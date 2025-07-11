'use client';

import { motion } from 'framer-motion';
import { Shield, Code, Zap } from 'lucide-react';

export default function QuickStart() {
  const quickStart = [
    {
      title: '1. Créer un compte',
      description: 'Inscrivez-vous gratuitement pour obtenir votre clé API',
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: '2. Obtenir votre clé API',
      description: 'Générez votre clé API depuis votre dashboard',
      icon: <Code className="h-6 w-6" />
    },
    {
      title: '3. Faire votre premier appel',
      description: 'Testez l\'API avec un exemple simple',
      icon: <Zap className="h-6 w-6" />
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="mb-16"
    >
      <h2 className="text-3xl font-bold text-center mb-12 text-white">Démarrage rapide</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {quickStart.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
            whileHover={{ y: -5 }}
            className="bg-gray-900 p-6 rounded-lg border border-gray-700 text-center hover:border-green-400 transition-colors"
          >
            <div className="text-green-400 mb-4 flex justify-center">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 