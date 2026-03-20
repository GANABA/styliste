'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'

const FAQ_CATEGORIES = [
  {
    category: 'Compte',
    questions: [
      {
        q: 'Comment modifier mon profil ?',
        a: "Accédez à Paramètres depuis le menu de navigation pour modifier vos informations personnelles et professionnelles.",
      },
      {
        q: 'Comment changer mon abonnement ?',
        a: "Rendez-vous dans la section Abonnement du menu pour voir les plans disponibles et changer de formule.",
      },
      {
        q: 'Mes données sont-elles sécurisées ?',
        a: "Oui. Vos données sont chiffrées et stockées de manière sécurisée. Vous seul avez accès à vos clients et commandes.",
      },
    ],
  },
  {
    category: 'Clients',
    questions: [
      {
        q: 'Comment ajouter un client ?',
        a: "Dans la section Clients, cliquez sur Nouveau client et remplissez le formulaire avec ses informations.",
      },
      {
        q: 'Comment enregistrer les mesures d\'un client ?',
        a: "Ouvrez la fiche du client et cliquez sur Ajouter des mesures. Sélectionnez un template et saisissez les valeurs.",
      },
      {
        q: 'Peut-on archiver un client ?',
        a: "Oui. Dans la fiche du client, utilisez le menu d'actions pour l'archiver. Il reste accessible depuis l'onglet Archivés.",
      },
    ],
  },
  {
    category: 'Commandes',
    questions: [
      {
        q: 'Comment créer une commande ?',
        a: "Dans Commandes, cliquez sur Nouvelle commande. Renseignez le client, le type de vêtement, le prix et la date de livraison.",
      },
      {
        q: 'Quels sont les statuts d\'une commande ?',
        a: "Devis, En cours, Prêt, Livré. Vous pouvez aussi annuler une commande à tout moment.",
      },
      {
        q: 'Quelle est la limite de commandes actives ?',
        a: "Dépend de votre plan : 5 (Découverte), 15 (Standard), 20 (Pro), illimité (Premium).",
      },
    ],
  },
  {
    category: 'Paiements',
    questions: [
      {
        q: 'Comment enregistrer un paiement ?',
        a: "Ouvrez la fiche commande et cliquez sur Enregistrer un paiement. Indiquez le montant, la méthode et le type (avance, partiel, solde).",
      },
      {
        q: 'Comment générer une facture ?',
        a: "Dans la fiche commande, cliquez sur le bouton Télécharger la facture pour obtenir un PDF.",
      },
    ],
  },
  {
    category: 'Portfolio',
    questions: [
      {
        q: 'Comment publier des photos dans mon portfolio ?',
        a: "Le portfolio est disponible sur les plans Pro et Premium. Accédez à Portfolio dans le menu pour uploader vos créations.",
      },
      {
        q: 'Mon portfolio est-il visible par tous ?',
        a: "Uniquement les photos que vous marquez comme Publiées. Votre lien portfolio est accessible depuis la section Portfolio.",
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-center justify-between py-3.5 text-left text-sm font-medium text-foreground hover:text-amber-600 transition-colors gap-3"
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

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* En-tête */}
      <div>
        <h1 className="page-title flex items-center gap-2.5">
          <HelpCircle className="h-6 w-6 text-amber-500" />
          Centre d&apos;aide
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trouvez les réponses à vos questions
        </p>
      </div>

      {/* FAQ */}
      {FAQ_CATEGORIES.map((cat) => (
        <div key={cat.category} className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-xs font-bold text-stone-400 uppercase tracking-widest">
            {cat.category}
          </h2>
          {cat.questions.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      ))}

      {/* Contact support */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
          <MessageCircle className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-sm text-muted-foreground mt-1">Notre équipe répond sur WhatsApp en moins de 4h.</p>
        </div>
        <a
          href="https://wa.me/22996745791"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Contacter le support WhatsApp
        </a>
      </div>
    </div>
  )
}
