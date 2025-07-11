'use client';

import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      value: "1000+",
      label: "Développeurs"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      value: "99.9%",
      label: "Uptime"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      value: "1M+",
      label: "Requêtes/mois"
    }
  ];

  return (
    <section className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-green-400 mb-2 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 