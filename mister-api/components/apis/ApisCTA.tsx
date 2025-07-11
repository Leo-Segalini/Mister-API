'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Book } from 'lucide-react';

export default function ApisCTA() {
  return (
    <section className="py-20 bg-green-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 text-black">
            Prêt à intégrer nos APIs ?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Rejoignez des milliers de développeurs qui utilisent déjà nos APIs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="bg-black text-green-400 px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors inline-flex items-center space-x-2 shadow-lg"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/docs"
                className="border-2 border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-black hover:text-green-400 transition-colors inline-flex items-center space-x-2"
              >
                <Book className="h-5 w-5" />
                <span>Voir la documentation</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 