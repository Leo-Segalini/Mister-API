'use client';

import { motion } from 'framer-motion';
import { BookOpen, PawPrint, MapPin } from 'lucide-react';
import ApiDocCard from './ApiDocCard';

export default function ApisList() {
  const apis = [
    {
      name: 'API Punchlines',
      description: 'Générez des punchlines créatives pour vos projets humoristiques',
      endpoint: '/api/v1/punchlines',
      href: '/docs/punchlines',
      icon: <BookOpen className="h-6 w-6" />,
      features: ['Génération aléatoire', 'Filtres par catégorie', 'Pagination', 'Recherche']
    },
    {
      name: 'API Animaux',
      description: 'Accédez à une base de données complète d\'animaux du monde',
      endpoint: '/api/v1/animals',
      href: '/docs/animals',
      icon: <PawPrint className="h-6 w-6" />,
      features: ['Liste complète', 'Filtres par espèce', 'Informations détaillées', 'Images']
    },
    {
      name: 'API Pays du Monde',
      description: 'Données géographiques et informations sur tous les pays',
      endpoint: '/api/v1/pays-du-monde',
      href: '/docs/pays-du-monde',
      icon: <MapPin className="h-6 w-6" />,
      features: ['Données géographiques', 'Informations démographiques', 'Filtres par région', 'Statistiques']
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <h2 className="text-3xl font-bold text-center mb-12 text-white">APIs disponibles</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {apis.map((api, index) => (
          <ApiDocCard key={index} api={api} index={index} />
        ))}
      </div>
    </motion.div>
  );
} 