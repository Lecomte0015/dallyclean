export const uspItems = [
  { icon: 'sparkles', title: 'Satisfaction garantie', text: 'Interventions soignées et contrôles qualité.' },
  { icon: 'clock', title: 'Ponctualité', text: 'Créneaux respectés et confirmations rapides.' },
  { icon: 'leaf', title: 'Écoresponsable', text: 'Produits et méthodes respectueuses.' },
  { icon: 'phone', title: 'Devis en 24h', text: 'Réponse rapide par téléphone ou email.' },
  { icon: 'shield', title: 'Assuré & déclaré', text: 'Entreprise professionnelle et assurée.' }
]

export const plans = [
  { name: 'Nettoyage voiture', price: 'à partir de 39€', points: ['Intérieur complet', 'Extérieur soigné', 'Options à la demande'] },
  { name: 'Nettoyage domicile', price: 'à partir de 59€', points: ['Pièces de vie', 'Sanitaires & cuisine', 'Matériel adapté'] },
  { name: 'Nettoyage bureau', price: 'sur devis', points: ['Surfaces & sols', 'Postes de travail', 'Fréquence au choix'] }
]

export const processSteps = [
  { step: 1, title: 'Devis rapide', text: 'Expliquez votre besoin, nous répondons sous 24h.' },
  { step: 2, title: 'Planification', text: 'Créneau au choix, rappel de confirmation.' },
  { step: 3, title: 'Intervention', text: 'Équipe équipée, prestation soignée.' },
  { step: 4, title: 'Contrôle & paiement', text: 'Vérification avec vous et règlement.' }
]

export const beforeAfter = [
  { before: 'Avant (placeholder)', after: 'Après (placeholder)', caption: 'Habitacle voiture' },
  { before: 'Avant (placeholder)', after: 'Après (placeholder)', caption: 'Salon' },
  { before: 'Avant (placeholder)', after: 'Après (placeholder)', caption: 'Open-space' }
]

export const areas = {
  geneve: ['Genève', 'Carouge', 'Lancy', 'Meyrin', 'Vernier', 'Onex', 'Chêne-Bougeries', 'Chêne-Bourg'],
  vaud: ['Lausanne', 'Nyon', 'Morges', 'Renens', 'Gland', 'Vevey', 'Montreux']
}

export const faqs = [
  { q: 'Quels produits utilisez-vous ?', a: 'Nous privilégions des produits efficaces et respectueux des surfaces et de l’environnement.' },
  { q: 'Intervenez-vous le week-end ?', a: 'Oui, sur demande et selon disponibilité.' },
  { q: 'Proposez-vous des contrats récurrents ?', a: 'Oui, pour particuliers et entreprises (hebdomadaire, bi-hebdomadaire, mensuel).' },
  { q: 'Comment obtenir un devis ?', a: 'Via le formulaire Prendre RDV, téléphone ou email. Réponse sous 24h.' },
  { q: 'Êtes-vous assurés ?', a: 'Oui, nous sommes une entreprise déclarée et assurée.' }
]

const homeContent = { uspItems, plans, processSteps, beforeAfter, areas, faqs }
export default homeContent
