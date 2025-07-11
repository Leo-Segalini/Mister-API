'use client';

import { motion } from 'framer-motion';

export default function PricingHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
        Tarifs simples et transparents
      </h1>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">
        Choisissez le plan qui correspond à vos besoins. Pas de frais cachés, 
        pas de surprise. Commencez gratuitement et évoluez quand vous le souhaitez.
      </p>
    </motion.div>
  );
} 