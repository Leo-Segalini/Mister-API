'use client';

import { motion } from 'framer-motion';

export default function DocsHeader() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Documentation
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Guide complet pour intégrer nos APIs dans vos applications. 
            Exemples, tutoriels et références techniques.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 