'use client';

import { motion } from 'framer-motion';
import { Code, Globe, Shield, Zap } from 'lucide-react';

export default function AdditionalResources() {
  const resources = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Exemples de code',
      description: 'Exemples dans différents langages'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'SDK',
      description: 'Bibliothèques officielles'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Sécurité',
      description: 'Bonnes pratiques de sécurité'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Performance',
      description: 'Optimisation et monitoring'
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-12 text-white">Ressources supplémentaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                whileHover={{ y: -5 }}
                className="bg-black p-6 rounded-lg border border-gray-700 text-center hover:border-green-400 transition-colors"
              >
                <div className="text-green-400 mx-auto mb-4 flex items-center justify-center">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{resource.title}</h3>
                <p className="text-gray-400 text-sm">
                  {resource.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 