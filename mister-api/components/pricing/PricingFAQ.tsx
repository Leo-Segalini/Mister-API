'use client';

import { motion } from 'framer-motion';

export default function PricingFAQ() {
  const faqs = [
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez passer du plan FREE au plan PREMIUM à tout moment. Le changement est immédiat et vous ne payez que la différence.'
    },
    {
      question: 'Que se passe-t-il si je dépasse ma limite quotidienne ?',
      answer: 'Avec le plan FREE, vos appels seront temporairement suspendus jusqu\'au lendemain. Avec le plan PREMIUM, vous avez des appels illimités.'
    },
    {
      question: 'Comment fonctionne la facturation ?',
      answer: 'Le plan PREMIUM est facturé mensuellement. Vous pouvez annuler à tout moment et continuer à utiliser le service jusqu\'à la fin de votre période de facturation.'
    },
    {
      question: 'Y a-t-il des frais cachés ?',
      answer: 'Non, nos tarifs sont transparents. Vous payez exactement ce qui est affiché, sans frais cachés ni surprises.'
    },
    {
      question: 'Puis-je annuler mon abonnement ?',
      answer: 'Oui, vous pouvez annuler votre abonnement PREMIUM à tout moment depuis votre dashboard. Aucun engagement à long terme.'
    },
    {
      question: 'Le plan FREE a-t-il des limitations ?',
      answer: 'Le plan FREE inclut 1000 appels par jour et 60 appels par minute. C\'est suffisant pour tester et développer vos applications.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="mt-20 max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-center mb-12 text-white">
        Questions fréquentes
      </h2>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2 text-white">
              {faq.question}
            </h3>
            <p className="text-gray-400">
              {faq.answer}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 