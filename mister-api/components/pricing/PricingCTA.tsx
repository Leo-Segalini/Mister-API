'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';

export default function PricingCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="text-center mt-16"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">
        Prêt à commencer ?
      </h2>
      <p className="text-gray-400 mb-8">
        Rejoignez des milliers de développeurs qui utilisent déjà nos APIs
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/login"
            className="bg-green-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors inline-flex items-center space-x-2"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/apis"
            className="border-2 border-green-400 text-green-400 px-8 py-3 rounded-lg font-semibold hover:bg-green-400 hover:text-black transition-colors inline-flex items-center space-x-2"
          >
            <span>Voir nos APIs</span>
          </Link>
        </motion.div>
      </div>

      {/* Note de garantie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-center"
      >
        <p className="text-gray-400 text-sm flex items-center justify-center">
          <Shield className="inline h-4 w-4 mr-1" />
          Garantie satisfait ou remboursé 30 jours • Annulation à tout moment
        </p>
      </motion.div>
    </motion.div>
  );
} 