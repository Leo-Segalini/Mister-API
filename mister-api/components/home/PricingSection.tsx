'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Star, Zap, Shield, Headphones, Rocket, Clock, Database, Globe, Crown } from 'lucide-react';

export default function PricingSection() {
  const freeFeatures = [
    { text: "Accès à toutes les APIs", icon: <Globe className="h-4 w-4" /> },
    { text: "Documentation complète", icon: <Check className="h-4 w-4" /> },
    { text: "Support communautaire", icon: <Check className="h-4 w-4" /> },
    { text: "Logs d'utilisation", icon: <Database className="h-4 w-4" /> },
    { text: "API RESTful", icon: <Check className="h-4 w-4" /> }
  ];

  const premiumFeatures = [
    { text: "Support prioritaire 24/7", icon: <Headphones className="h-4 w-4" />, highlight: true },
    { text: "Analytics avancées", icon: <Star className="h-4 w-4" />, highlight: true },
    { text: "Webhooks personnalisés", icon: <Zap className="h-4 w-4" />, highlight: true },
    { text: "SLA garanti 99.9%", icon: <Shield className="h-4 w-4" />, highlight: true },
    { text: "Accès aux nouvelles APIs en avant-première", icon: <Crown className="h-4 w-4" />, highlight: true },
    { text: "Intégrations premium (Slack, Discord)", icon: <Check className="h-4 w-4" />, highlight: true },
    { text: "Dashboard personnalisé", icon: <Database className="h-4 w-4" />, highlight: true },
    { text: "Migration gratuite depuis d'autres APIs", icon: <Rocket className="h-4 w-4" />, highlight: true }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Plans simples et transparents</h2>
          <p className="text-xl text-gray-400">Commencez gratuitement, évoluez selon vos besoins</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-700 relative hover:border-gray-600 transition-colors"
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gray-700 text-white">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Gratuit</h3>
              <div className="text-4xl font-bold text-white mb-2">0€</div>
              <p className="text-gray-400">Parfait pour commencer</p>
            </div>

            {/* Quotas Free */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-xs text-gray-400">Par jour</span>
                  </div>
                  <div className="text-lg font-bold text-white">500 appels</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-xs text-gray-400">Par minute</span>
                  </div>
                  <div className="text-lg font-bold text-white">5 appels</div>
                </div>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-400">
                  <span className="text-green-400 mr-3">{feature.icon}</span>
                  {feature.text}
                </li>
              ))}
            </ul>
            
            <Link 
              href="/register" 
              className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors inline-block text-center"
            >
              Commencer gratuitement
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl border-2 border-green-400 relative transform scale-105"
          >
            {/* Badge Recommandé */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-green-400 to-green-300 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
                <Star className="h-4 w-4" />
                <span>RECOMMANDÉ</span>
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-green-400 to-green-300 text-black shadow-lg">
                  <Crown className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="text-4xl font-bold text-white mb-2">5€<span className="text-lg text-gray-400">/mois</span></div>
              <p className="text-green-400 font-semibold">Économisez 50% par rapport à la concurrence</p>
            </div>

            {/* Quotas Premium */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-xs text-gray-400">Par jour</span>
                  </div>
                  <div className="text-lg font-bold text-white">150 000 appels</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-xs text-gray-400">Par minute</span>
                  </div>
                  <div className="text-lg font-bold text-white">100 appels</div>
                </div>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className={`flex items-center ${feature.highlight ? 'text-white font-medium' : 'text-gray-400'}`}>
                  <span className={`mr-3 ${feature.highlight ? 'text-green-400' : 'text-green-400'}`}>
                    {feature.icon}
                  </span>
                  <span className="flex-1">{feature.text}</span>
                  {feature.highlight && (
                    <span className="ml-2 bg-gradient-to-r from-green-400 to-green-300 text-black text-xs px-2 py-1 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                </li>
              ))}
            </ul>
            
            <Link 
              href="/pricing" 
              className="w-full bg-gradient-to-r from-green-400 to-green-300 text-black px-6 py-3 rounded-lg font-bold hover:from-green-300 hover:to-green-200 transition-all duration-300 inline-block text-center text-lg shadow-lg hover:shadow-xl"
            >
              Choisir Premium
            </Link>
          </motion.div>
        </div>

        {/* Note de garantie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Garantie satisfait ou remboursé</h3>
            </div>
            <p className="text-gray-400 text-sm">
              30 jours d'essai gratuit • Annulation à tout moment • Support 24/7 pour les clients Premium
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 