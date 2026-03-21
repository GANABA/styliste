'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'

const FAQ_CATEGORIES = [
  {
    category: 'Compte',
    questions: [
      {
        q: 'Comment modifier mon profil ?',
        a: "Accédez à Paramètres depuis le menu de navigation pour modifier vos informations personnelles et professionnelles (nom d'atelier, ville, téléphone, logo).",
      },
      {
        q: 'Comment changer mon abonnement ?',
        a: "Rendez-vous dans la section 'Abonnement' du menu pour voir les plans disponibles et changer de formule. Le changement prend effet immédiatement.",
      },
      {
        q: 'Mes données sont-elles sécurisées ?',
        a: "Oui. Vos données sont chiffrées et stockées de manière sécurisée. Vous seul avez accès à vos clients et commandes. Nous n'utilisons pas vos données à des fins commerciales.",
      },
    ],
  },
  {
    category: 'Clients',
    questions: [
      {
        q: 'Comment ajouter un client ?',
        a: "Dans la section 'Clients', cliquez sur 'Nouveau client' et remplissez le formulaire avec ses informations. Nom et téléphone sont obligatoires.",
      },
      {
        q: "Comment enregistrer les mesures d'un client ?",
        a: "Ouvrez la fiche du client et cliquez sur 'Ajouter des mesures'. Sélectionnez un template de mesures (ou créez le vôtre) puis saisissez les valeurs.",
      },
      {
        q: 'Peut-on archiver un client ?',
        a: "Oui. Dans la fiche du client ou depuis la liste, utilisez le menu d'actions pour l'archiver. Il reste accessible depuis l'onglet 'Archivés' et peut être restauré à tout moment.",
      },
    ],
  },
  {
    category: 'Commandes',
    questions: [
      {
        q: 'Comment créer une commande ?',
        a: "Dans 'Commandes', cliquez sur 'Nouvelle commande'. Renseignez le client, le type de vêtement, le prix total, l'avance éventuelle et la date de livraison promise.",
      },
      {
        q: "Quels sont les statuts d'une commande ?",
        a: "Devis → En cours → Prêt → Livré. Vous pouvez aussi annuler une commande à tout moment depuis sa fiche.",
      },
      {
        q: 'Quelle est la limite de commandes actives ?',
        a: "Découverte : 5 · Standard : 15 · Pro : 20 · Premium : illimité. Les commandes livrées ou annulées ne comptent pas dans cette limite.",
      },
      {
        q: 'Comment ajouter des photos à une commande ?',
        a: "Dans la fiche commande, cliquez sur 'Ajouter une photo'. Vous pouvez uploader des photos de référence, tissu, essayage ou produit fini.",
      },
    ],
  },
  {
    category: 'Paiements',
    questions: [
      {
        q: 'Comment enregistrer un paiement ?',
        a: "Ouvrez la fiche commande et cliquez sur 'Enregistrer un paiement'. Indiquez le montant, la méthode (espèces, Mobile Money, virement) et le type (avance, partiel, solde).",
      },
      {
        q: 'Comment générer une facture ?',
        a: "Dans la fiche commande, cliquez sur le bouton 'Télécharger la facture' pour obtenir un PDF. Vous pouvez aussi télécharger le reçu de chaque paiement.",
      },
    ],
  },
  {
    category: 'Portfolio',
    questions: [
      {
        q: 'Comment publier des photos dans mon portfolio ?',
        a: "Le portfolio est disponible sur les plans Pro et Premium. Accédez à 'Portfolio' dans le menu, uploadez vos créations, puis cochez 'Publier' pour les rendre visibles.",
      },
      {
        q: "Comment apparaître dans l'annuaire des stylistes ?",
        a: "Avec un plan Pro ou Premium, votre profil apparaît automatiquement dans l'annuaire si vous avez au moins une photo publiée. Renseignez votre ville et votre nom d'atelier dans Paramètres.",
      },
      {
        q: 'Comment ajouter un logo à mon atelier ?',
        a: "Accédez à Paramètres › Logo de l'atelier. Uploadez une image JPEG, PNG ou WebP (2 Mo max, format carré recommandé). Le logo apparaît sur votre portfolio et dans l'annuaire.",
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-foreground hover:text-amber-600 transition-colors gap-3"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-stone-400" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-stone-400" />
        }
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function DashboardHelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <HelpCircle className="h-3.5 w-3.5" />
          Centre d&apos;aide
        </div>
        <h1 className="page-title">Comment pouvons-nous vous aider ?</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trouvez des réponses aux questions fréquentes sur l&apos;utilisation de Styliste.com.
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        {FAQ_CATEGORIES.map((cat) => (
          <div key={cat.category} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-stone-100 bg-stone-50/50">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">{cat.category}</h2>
            </div>
            <div className="px-6">
              {cat.questions.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact support */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <MessageCircle className="h-8 w-8 text-amber-600 mx-auto mb-3" />
        <h3 className="font-bold text-foreground mb-1">Vous ne trouvez pas votre réponse ?</h3>
        <p className="text-sm text-muted-foreground mb-4">Notre équipe répond sur WhatsApp en moins de 4h.</p>
        <a
          href="https://wa.me/22996745791"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Contacter le support WhatsApp
        </a>
      </div>

      <p className="text-xs text-center text-muted-foreground pb-4">
        <Link href="/cgu" className="hover:underline">CGU</Link>
        {' '}·{' '}
        <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
      </p>
    </div>
  )
}
