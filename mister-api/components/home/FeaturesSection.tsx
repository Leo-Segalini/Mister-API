'use client';

import { motion } from 'framer-motion';
import { Code, Zap, Shield, Globe } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Rapide & Fiable",
      description: "APIs optimisées pour des performances maximales avec cache Redis"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Sécurisé",
      description: "Authentification par cookies sécurisés et quotas intelligents"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global",
      description: "Disponible 24/7 avec une haute disponibilité et monitoring"
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Simple",
      description: "Documentation claire, exemples pratiques et support"
    }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Pourquoi choisir Mister API ?</h2>
          <p className="text-xl text-gray-400">Des APIs conçues pour les développeurs modernes</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-700 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-green-400 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 