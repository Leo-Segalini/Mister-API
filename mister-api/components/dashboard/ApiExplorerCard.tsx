'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BookOpen, PawPrint, Globe } from 'lucide-react';

interface ApiExplorerCardProps {
  type: 'punchlines' | 'animals' | 'pays';
  data: any;
  index: number;
}

const apiConfig = {
  punchlines: {
    title: 'Citations Historiques',
    icon: BookOpen,
    color: 'text-green-400',
    bgColor: 'bg-green-400',
    hoverColor: 'hover:bg-green-500',
    description: 'Citations et punchlines historiques',
    route: '/apis'
  },
  animals: {
    title: 'Animaux',
    icon: PawPrint,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
    hoverColor: 'hover:bg-blue-500',
    description: 'Base de données des animaux',
    route: '/apis'
  },
  pays: {
    title: 'Pays du Monde',
    icon: Globe,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400',
    hoverColor: 'hover:bg-purple-500',
    description: 'Données géographiques des pays',
    route: '/apis'
  }
};

export default function ApiExplorerCard({ type, data, index }: ApiExplorerCardProps) {
  const router = useRouter();
  const config = apiConfig[type];
  const IconComponent = config.icon;

  const renderContent = () => {
    switch (type) {
      case 'punchlines':
        return data ? (
          <div className="space-y-3">
            <blockquote className="text-gray-300 italic text-sm">
              "{data.citation?.substring(0, 80)}..."
            </blockquote>
            <p className="text-xs text-gray-400">
              — {data.auteur} ({data.annee})
            </p>
            <div className="flex flex-wrap gap-1">
              {data.tags?.slice(0, 2).map((tag: string, tagIndex: number) => (
                <span
                  key={tagIndex}
                  className="inline-block bg-green-900 text-green-400 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune donnée disponible</p>
        );

      case 'animals':
        return data ? (
          <div className="space-y-2">
            <h4 className="font-medium text-white text-sm">{data.nom}</h4>
            <p className="text-xs text-gray-300">
              <strong>Espèce:</strong> {data.espece}
            </p>
            <p className="text-xs text-gray-300">
              <strong>Famille:</strong> {data.famille}
            </p>
            <p className="text-xs text-gray-300">
              <strong>Habitat:</strong> {data.habitat?.substring(0, 40)}...
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune donnée disponible</p>
        );

      case 'pays':
        return data ? (
          <div className="space-y-2">
            <h4 className="font-medium text-white text-sm">{data.nom}</h4>
            <p className="text-xs text-gray-300">
              <strong>Capitale:</strong> {data.capitale}
            </p>
            <p className="text-xs text-gray-300">
              <strong>Continent:</strong> {data.continent}
            </p>
            <p className="text-xs text-gray-300">
              <strong>Population:</strong> {data.population?.toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune donnée disponible</p>
        );

      default:
        return <p className="text-gray-400 text-sm">Aucune donnée disponible</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-800 hover:border-gray-700 transition-all duration-200"
    >
      <div className="flex items-center mb-3">
        <IconComponent className={`h-5 w-5 ${config.color} mr-2`} />
        <h3 className="text-base font-semibold text-white">{config.title}</h3>
      </div>
      
      <div className="mb-4 min-h-[80px]">
        {renderContent()}
      </div>
      
      <button
        onClick={() => router.push(config.route)}
        className={`w-full ${config.bgColor} text-black px-3 py-2 rounded-md ${config.hoverColor} transition-colors font-semibold text-sm`}
      >
        Explorer l'API
      </button>
    </motion.div>
  );
} 