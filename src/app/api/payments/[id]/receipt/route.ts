import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Les montants de paiements sont en centimes → diviser par 100
function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount / 100)) + ' FCFA';
}

// Les prix de commandes sont en FCFA brut → affichage direct
function formatFCFADirect(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  ADVANCE: 'Avance',
  PARTIAL: 'Paiement partiel',
  FINAL: 'Solde final',
  REFUND: 'Remboursement',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement bancaire',
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
  });
  if (!stylist) {
    return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: {
          client: { select: { name: true, phone: true } },
        },
      },
      stylist: true,
    },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  // Isolation multi-tenant
  if (payment.stylistId !== stylist.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Import dynamique de jsPDF (côté serveur uniquement)
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const margin = 20;
  let y = margin;

  // En-tête
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RECU DE PAIEMENT', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Styliste.com · Recu #${payment.id.slice(0, 8).toUpperCase()}`, 105, y, { align: 'center' });
  y += 15;

  // Ligne de séparation
  doc.setDrawColor(200);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  // Informations styliste
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Styliste', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(payment.stylist.businessName || session.user.name || 'N/A', margin, y);
  if (payment.stylist.phone) {
    y += 5;
    doc.text(payment.stylist.phone, margin, y);
  }
  y += 10;

  // Informations client
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Client', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(payment.order.client.name, margin, y);
  y += 5;
  doc.text(payment.order.client.phone, margin, y);
  y += 10;

  // Détails commande
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Commande', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`N° ${payment.order.orderNumber}`, margin, y);
  y += 5;
  doc.text(`Type : ${payment.order.garmentType}`, margin, y);
  y += 10;

  // Ligne de séparation
  doc.setDrawColor(200);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  // Détails du paiement
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails du paiement', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const rows = [
    ['Date', formatDate(new Date(payment.paymentDate))],
    ['Type', PAYMENT_TYPE_LABELS[payment.paymentType] || payment.paymentType],
    ['Méthode', PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod],
    ...(payment.mobileMoneyProvider ? [['Opérateur', payment.mobileMoneyProvider]] : []),
    ['Montant payé', formatFCFA(payment.amount)],
    ['Total commande', formatFCFADirect(payment.order.totalPrice)],
    ['Solde restant', formatFCFADirect(Math.max(0, payment.order.totalPrice - payment.order.totalPaid))],
  ];

  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} :`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, y);
    y += 7;
  }

  if (payment.notes) {
    y += 3;
    doc.setFont('helvetica', 'italic');
    doc.text(`Notes : ${payment.notes}`, margin, y);
    y += 7;
  }

  // Pied de page
  y = 270;
  doc.setDrawColor(200);
  doc.line(margin, y, 210 - margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Généré le ${formatDate(new Date())} par Styliste.com`,
    105,
    y,
    { align: 'center' }
  );

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-${payment.id.slice(0, 8)}.pdf"`,
    },
  });
}
