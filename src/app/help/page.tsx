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
        a: "Rendez-vous dans la section 'Abonnement' du menu pour voir les plans disponibles et changer de formule.",
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
        a: "Dans la section 'Clients', cliquez sur 'Nouveau client' et remplissez le formulaire avec ses informations.",
      },
      {
        q: 'Comment enregistrer les mesures d\'un client ?',
        a: "Ouvrez la fiche du client et cliquez sur 'Ajouter des mesures'. Sélectionnez un template et saisissez les valeurs.",
      },
      {
        q: 'Peut-on archiver un client ?',
        a: "Oui. Dans la fiche du client, utilisez le menu d'actions pour l'archiver. Il reste accessible depuis l'onglet 'Archivés'.",
      },
    ],
  },
  {
    category: 'Commandes',
    questions: [
      {
        q: 'Comment créer une commande ?',
        a: "Dans 'Commandes', cliquez sur 'Nouvelle commande'. Renseignez le client, le type de vêtement, le prix et la date de livraison.",
      },
      {
        q: 'Quels sont les statuts d\'une commande ?',
        a: "Devis → En cours → Prêt → Livré. Vous pouvez aussi annuler une commande à tout moment.",
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
        a: "Ouvrez la fiche commande et cliquez sur 'Enregistrer un paiement'. Indiquez le montant, la méthode et le type (avance, partiel, solde).",
      },
      {
        q: 'Comment générer une facture ?',
        a: "Dans la fiche commande, cliquez sur le bouton 'Télécharger la facture' pour obtenir un PDF.",
      },
    ],
  },
  {
    category: 'Portfolio',
    questions: [
      {
        q: 'Comment publier des photos dans mon portfolio ?',
        a: "Le portfolio est disponible sur les plans Pro et Premium. Accédez à 'Portfolio' dans le menu pour uploader vos créations.",
      },
      {
        q: 'Mon portfolio est-il visible par tous ?',
        a: "Uniquement les photos que vous marquez comme 'Publiées'. Votre lien portfolio est votre.slug.styliste.com",
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-3 text-left text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
      </button>
      {open && <p className="pb-3 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Centre d&apos;aide</h1>
            <p className="text-sm text-gray-500">Trouvez les réponses à vos questions</p>
          </div>
        </div>

        {/* FAQ par catégorie */}
        {FAQ_CATEGORIES.map((cat) => (
          <div key={cat.category} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {cat.category}
            </h2>
            {cat.questions.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        {/* Contact support */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
          <MessageCircle className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-sm text-gray-600 mb-3">Notre équipe répond sur WhatsApp en moins de 4h.</p>
          <a
            href="https://wa.me/22900000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Contacter le support WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
