'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-8xl md:text-9xl font-bold text-green-400">404</h1>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Page introuvable
            </h2>
            <p className="text-gray-400 text-lg">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </p>
          </motion.div>

          {/* Search Icon Animation */}
          <motion.div
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-full border border-gray-700">
              <Search className="h-10 w-10 text-green-400" />
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="space-y-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="bg-green-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors inline-flex items-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Retour à l'accueil</span>
              </Link>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/docs"
                  className="border border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors inline-flex items-center space-x-2"
                >
                  <span>Documentation</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/apis"
                  className="border border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors inline-flex items-center space-x-2"
                >
                  <span>Explorer les APIs</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-800"
          >
            <p className="text-gray-400 mb-4">Pages populaires :</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/pricing" className="text-green-400 hover:text-green-300">
                Tarifs
              </Link>
              <Link href="/login" className="text-green-400 hover:text-green-300">
                Connexion
              </Link>
              <Link href="/register" className="text-green-400 hover:text-green-300">
                Inscription
              </Link>
              <Link href="/docs/punchlines" className="text-green-400 hover:text-green-300">
                API Punchlines
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 