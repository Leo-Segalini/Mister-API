'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Book, ArrowRight, BookOpen, PawPrint, MapPin } from 'lucide-react';

interface ApiDocCardProps {
  api: {
    name: string;
    description: string;
    endpoint: string;
    href: string;
    features: string[];
    icon: React.ReactNode;
  };
  index: number;
}

export default function ApiDocCard({ api, index }: ApiDocCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
      whileHover={{ y: -5 }}
      className="bg-gray-900 p-8 rounded-lg border border-gray-700 hover:border-green-400 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">{api.name}</h3>
        <div className="text-green-400">
          {api.icon}
        </div>
      </div>
      <p className="text-gray-400 mb-6">{api.description}</p>
      
      <div className="bg-black p-4 rounded border border-gray-700 mb-6">
        <code className="text-sm text-green-400">{api.endpoint}</code>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-white">Fonctionnalités :</h4>
        <ul className="space-y-2">
          {api.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-center text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href={api.href}
          className="bg-green-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors inline-flex items-center space-x-2"
        >
          <span>Voir la documentation</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
} 