export const siteConfig = {
  name: 'Mister API',
  description: 'Collection d\'APIs pour développeurs - Citations historiques, Animaux, Pays du monde',
  url: 'https://mister-api.com',
  ogImage: 'https://mister-api.com/og.jpg',
  links: {
    twitter: 'https://twitter.com/mister-api',
    github: 'https://github.com/mister-api',
    docs: 'https://docs.mister-api.com',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    endpoints: {
      auth: '/api/v1/auth',
      apiKeys: '/api/v1/api-keys',
      citations: '/api/v1/punchlines',
      animaux: '/api/v1/animaux',
      pays: '/api/v1/pays',
      payments: '/api/v1/payments',
      stats: '/api/v1/stats',
      admin: '/api/v1/admin',
    }
  },
  pricing: {
    free: {
      name: 'FREE',
      price: '0€',
      callsPerDay: 1000,
      callsPerMinute: 60,
      features: [
        '1000 appels par jour',
        '60 appels par minute',
        'Accès à toutes les APIs',
        'Documentation complète',
        'Support communautaire',
        'Pas de carte de crédit requise'
      ]
    },
    premium: {
      name: 'PREMIUM',
      price: '9.99€/mois',
      callsPerDay: 10000,
      callsPerMinute: 300,
      features: [
        '10000 appels par jour',
        '300 appels par minute',
        'Accès à toutes les APIs',
        'Documentation complète',
        'Support prioritaire',
        'Statistiques avancées',
        'API keys multiples',
        'Webhooks',
        'SLA garanti'
      ]
    }
  }
};

export const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'APIs', href: '/apis' },
  { name: 'Prix', href: '/pricing' },
  { name: 'Docs', href: '/docs' },
  { name: 'Connexion', href: '/login' },
  { name: 'Inscription', href: '/register' },
];

export const apis = [
  {
    name: 'API Citations Historiques',
    description: 'Découvrez des citations inspirantes de personnages historiques',
    endpoint: '/api/v1/punchlines',
    color: 'text-green-400',
    status: 'active',
    features: [
      'Citations par thème',
      'Filtres par auteur',
      'Recherche par année',
      'Citations aléatoires',
      'Pagination intelligente'
    ],
    categories: ['histoire', 'philosophie', 'politique', 'littérature', 'science'],
    documentation: '/docs/punchlines',
    popular: true
  },
  {
    name: 'API Animaux',
    description: 'Base de données complète sur les animaux du monde',
    endpoint: '/api/v1/animaux',
    color: 'text-blue-400',
    status: 'active',
    features: [
      'Informations détaillées',
      'Filtres par espèce',
      'Recherche par habitat',
      'Données géographiques',
      'Statistiques biologiques'
    ],
    categories: ['biologie', 'nature', 'éducation', 'science'],
    documentation: '/docs/animals',
    popular: false
  },
  {
    name: 'API Pays du Monde',
    description: 'Données géographiques et démographiques des pays',
    endpoint: '/api/v1/pays',
    color: 'text-purple-400',
    status: 'active',
    features: [
      'Données démographiques',
      'Filtres par continent',
      'Recherche par capitale',
      'Informations économiques',
      'Données géographiques'
    ],
    categories: ['géographie', 'économie', 'éducation', 'voyage'],
    documentation: '/docs/pays-du-monde',
    popular: false
  }
];

// Configuration pour les thèmes de citations
export const citationThemes = [
  'amour',
  'amitié',
  'bonheur',
  'courage',
  'éducation',
  'famille',
  'liberté',
  'paix',
  'sagesse',
  'travail',
  'vérité',
  'victoire'
];

// Configuration pour les continents
export const continents = [
  'Afrique',
  'Amérique du Nord',
  'Amérique du Sud',
  'Asie',
  'Europe',
  'Océanie'
];

// Configuration pour les familles d'animaux
export const animalFamilies = [
  'Mammifères',
  'Oiseaux',
  'Reptiles',
  'Amphibiens',
  'Poissons',
  'Insectes',
  'Arachnides',
  'Mollusques'
]; 