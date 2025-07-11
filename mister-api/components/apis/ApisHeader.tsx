'use client';

import { motion } from 'framer-motion';
import { Code, Zap, Users, Clock } from 'lucide-react';

export default function ApisHeader() {
  const stats = [
    { 
      label: 'APIs disponibles', 
      value: '3', 
      icon: <Code className="h-6 w-6" />,
      color: 'text-green-400'
    },
    { 
      label: 'Appels par jour', 
      value: '10M+', 
      icon: <Zap className="h-6 w-6" />,
      color: 'text-green-400'
    },
    { 
      label: 'Développeurs', 
      value: '1K+', 
      icon: <Users className="h-6 w-6" />,
      color: 'text-green-400'
    },
    { 
      label: 'Uptime', 
      value: '99.9%', 
      icon: <Clock className="h-6 w-6" />,
      color: 'text-green-400'
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Nos APIs
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Découvrez notre collection d'APIs conçues pour les développeurs. 
            Des outils puissants, simples à utiliser et bien documentés.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
              whileHover={{ y: -5 }}
              className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-700 text-center hover:shadow-md transition-shadow"
            >
              <div className={`mb-4 flex justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold mb-2 text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 