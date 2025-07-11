'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Star, Zap, Crown, Rocket, Headphones, Shield, Clock, Database, Globe } from 'lucide-react';

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: Array<{
      text: string;
      icon: React.ReactNode;
      highlight?: boolean;
      tooltip?: string;
    }>;
    buttonText: string;
    buttonHref: string;
    popular: boolean;
    icon: React.ReactNode;
    quota: {
      daily: string;
      perMinute: string;
    };
  };
  index: number;
}

export default function PricingCard({ plan, index }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.8 }}
      whileHover={{ y: -10 }}
      className={`relative p-8 rounded-2xl border flex flex-col h-full ${
        plan.popular 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-green-400 transform scale-105 shadow-2xl shadow-green-400/20' 
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-green-400 to-green-300 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
            <Star className="h-4 w-4" />
            <span>RECOMMANDÉ</span>
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${
            plan.popular 
              ? 'bg-gradient-to-r from-green-400 to-green-300 text-black shadow-lg' 
              : 'bg-gray-700 text-white'
          }`}>
            {plan.icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
        <p className="text-gray-400 mb-4">{plan.description}</p>
        
        {/* Quotas mis en avant */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-xs text-gray-400">Par jour</span>
              </div>
              <div className="text-lg font-bold text-white">{plan.quota.daily}</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Zap className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-xs text-gray-400">Par minute</span>
              </div>
              <div className="text-lg font-bold text-white">{plan.quota.perMinute}</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          {plan.price !== '0€' && <span className="text-gray-400">/mois</span>}
        </div>
        {plan.popular && (
          <p className="text-green-400 font-semibold text-sm">
            Économisez 50% par rapport à la concurrence
          </p>
        )}
      </div>

      <ul className="space-y-4 mb-8 flex-grow">
        {plan.features.map((feature, featureIndex) => (
          <motion.li
            key={featureIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 + featureIndex * 0.1 }}
            className={`flex items-center group ${feature.highlight ? 'text-white font-medium' : 'text-gray-400'}`}
            title={feature.tooltip}
          >
            <div className={`mr-3 ${feature.highlight ? 'text-green-400' : 'text-green-400'}`}>
              {feature.icon}
            </div>
            <span className="flex-1">{feature.text}</span>
            {feature.highlight && (
              <span className="ml-2 bg-gradient-to-r from-green-400 to-green-300 text-black text-xs px-2 py-1 rounded-full font-bold">
                PREMIUM
              </span>
            )}
          </motion.li>
        ))}
      </ul>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full mt-auto"
      >
        <Link
          href={plan.buttonHref}
          className={`w-full block text-center py-4 px-6 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
            plan.popular
              ? 'bg-gradient-to-r from-green-400 to-green-300 text-black hover:from-green-300 hover:to-green-200 text-lg font-bold shadow-lg hover:shadow-xl'
              : 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
          }`}
        >
          {plan.buttonText}
        </Link>
      </motion.div>
    </motion.div>
  );
} 