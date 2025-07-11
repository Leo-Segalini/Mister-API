'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function ApisFeatures() {
  const features = [
    'Authentification par clé API',
    'Rate limiting intelligent',
    'Documentation complète',
    'Support technique',
    'Cache Redis pour les performances',
    'Monitoring en temps réel'
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Pourquoi nos APIs ?</h2>
          <p className="text-xl text-gray-400">Des fonctionnalités conçues pour les développeurs</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-800 p-6 rounded-lg text-center hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <div className="text-green-400 mb-4 flex justify-center">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 