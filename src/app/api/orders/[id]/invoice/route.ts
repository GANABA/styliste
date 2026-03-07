import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const STATUS_LABELS: Record<string, string> = {
  QUOTE:       'Devis',
  IN_PROGRESS: 'En cours',
  READY:       'Prête',
  DELIVERED:   'Livrée',
  CANCELED:    'Annulée',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH:          'Espèces',
  MOBILE_MONEY:  'Mobile Money',
  BANK_TRANSFER: 'Virement bancaire',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  ADVANCE: 'Avance',
  PARTIAL: 'Paiement partiel',
  FINAL:   'Solde final',
  REFUND:  'Remboursement',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const stylist = await prisma.stylist.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!stylist) {
    return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, stylistId: stylist.id, deletedAt: null },
    include: {
      client: { select: { name: true, phone: true, email: true, city: true } },
      payments: {
        where: { paymentStatus: 'COMPLETED' },
        orderBy: { paymentDate: 'asc' },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const margin = 20;
  let y = margin;

  // En-tête
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('FACTURE', margin, y);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`N° ${order.orderNumber}`, 210 - margin, y, { align: 'right' });
  y += 6;
  doc.text(`Date : ${formatDate(new Date(order.createdAt))}`, 210 - margin, y, { align: 'right' });
  y += 12;

  // Ligne séparation
  doc.setDrawColor(220);
  doc.line(margin, y, 210 - margin, y);
  y += 10;

  // Deux colonnes : styliste | client
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DE', margin, y);
  doc.text('POUR', 115, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  const stylistName = stylist.businessName || stylist.user.name || 'Styliste';
  doc.text(stylistName, margin, y);
  doc.text(order.client.name, 115, y);
  y += 5;

  if (stylist.phone) { doc.text(stylist.phone, margin, y); }
  doc.text(order.client.phone, 115, y);
  y += 5;

  if (stylist.city) { doc.text(stylist.city, margin, y); }
  if (order.client.city) { doc.text(order.client.city, 115, y); }
  y += 12;

  // Ligne séparation
  doc.setDrawColor(220);
  doc.line(margin, y, 210 - margin, y);
  y += 10;

  // Détails commande
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DE LA COMMANDE', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Type de vêtement', order.garmentType],
    ['Statut', STATUS_LABELS[order.status] || order.status],
    ['Date promise', formatDate(new Date(order.promisedDate))],
    ['Tissu fourni par', order.fabricProvidedBy === 'CLIENT' ? 'Le client' : 'Le styliste'],
  ];

  if (order.description) {
    details.push(['Description', order.description]);
  }

  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} :`, margin, y);
    doc.setFont('helvetica', 'normal');
    // Wrap long text
    const wrapped = doc.splitTextToSize(value, 100);
    doc.text(wrapped, margin + 55, y);
    y += wrapped.length > 1 ? 6 * wrapped.length : 6;
  }

  y += 4;

  // Ligne séparation
  doc.setDrawColor(220);
  doc.line(margin, y, 210 - margin, y);
  y += 10;

  // Récapitulatif financier
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉCAPITULATIF FINANCIER', margin, y);
  y += 8;

  doc.setFontSize(10);

  // Tableau simple
  const financialRows = [
    { label: 'Prix total', value: formatFCFA(order.totalPrice), bold: false },
    { label: 'Total encaissé', value: formatFCFA(order.totalPaid), bold: false },
    { label: 'Solde restant', value: formatFCFA(Math.max(0, order.totalPrice - order.totalPaid)), bold: true },
  ];

  for (const row of financialRows) {
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    doc.text(row.label, margin, y);
    doc.text(row.value, 210 - margin, y, { align: 'right' });
    y += 7;
  }

  y += 4;

  // Historique des paiements
  if (order.payments.length > 0) {
    doc.setDrawColor(220);
    doc.line(margin, y, 210 - margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIQUE DES PAIEMENTS', margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('Date', margin, y);
    doc.text('Type', margin + 35, y);
    doc.text('Méthode', margin + 75, y);
    doc.text('Montant', 210 - margin, y, { align: 'right' });
    y += 5;

    doc.setDrawColor(200);
    doc.line(margin, y, 210 - margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    for (const payment of order.payments) {
      const amountFCFA = Math.round(payment.amount / 100); // centimes → FCFA
      doc.text(formatDate(new Date(payment.paymentDate)), margin, y);
      doc.text(PAYMENT_TYPE_LABELS[payment.paymentType] || payment.paymentType, margin + 35, y);
      doc.text(PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod, margin + 75, y);
      doc.text(new Intl.NumberFormat('fr-FR').format(amountFCFA) + ' FCFA', 210 - margin, y, { align: 'right' });
      y += 6;
    }
  }

  // Pied de page
  y = Math.max(y + 10, 260);
  doc.setDrawColor(220);
  doc.line(margin, y, 210 - margin, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Facture générée le ${formatDate(new Date())} via Styliste.com`,
    105,
    y,
    { align: 'center' }
  );

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${order.orderNumber}.pdf"`,
    },
  });
}
