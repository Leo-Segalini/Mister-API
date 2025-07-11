'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, PawPrint, MapPin, Star } from 'lucide-react';
import { apis } from '@/lib/config';

export default function ApisSection() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Nos APIs</h2>
          <p className="text-xl text-gray-400">Découvrez notre collection d'APIs spécialisées</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apis.map((api, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {api.name.includes('Citations') && <BookOpen className="h-6 w-6 text-green-400" />}
                  {api.name.includes('Animaux') && <PawPrint className="h-6 w-6 text-green-400" />}
                  {api.name.includes('Pays') && <MapPin className="h-6 w-6 text-green-400" />}
                  <h3 className="text-xl font-semibold text-white">{api.name}</h3>
                </div>
                {api.popular && <Star className="h-5 w-5 text-yellow-400" />}
              </div>
              <p className="text-gray-400 mb-4">{api.description}</p>
              <div className="bg-gray-800 p-3 rounded border border-gray-700 mb-4">
                <code className="text-sm text-gray-300">{api.endpoint}</code>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {api.categories.slice(0, 3).map((category, catIndex) => (
                  <span
                    key={catIndex}
                    className="inline-block bg-green-400 text-black text-xs px-2 py-1 rounded"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href={api.documentation} 
                  className="bg-green-400 text-black px-4 py-2 rounded font-semibold hover:bg-green-300 transition-colors inline-block"
                >
                  Voir la doc
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 