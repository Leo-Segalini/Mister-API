'use client';

import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Rocket, Headphones, Shield } from 'lucide-react';
import PricingCard from './PricingCard';

export default function PricingPlans() {
  const plans = [
    {
      name: 'FREE',
      price: '0€',
      description: 'Parfait pour commencer',
      features: [
        { text: '500 appels par jour', icon: <Zap className="h-4 w-4" /> },
        { text: '5 appels par minute', icon: <Zap className="h-4 w-4" /> },
        { text: 'Accès à toutes les APIs', icon: <Check className="h-4 w-4" /> },
        { text: 'Documentation complète', icon: <Check className="h-4 w-4" /> },
        { text: 'Support communautaire', icon: <Check className="h-4 w-4" /> }
      ],
      buttonText: 'Commencer gratuitement',
      buttonHref: '/login',
      popular: false,
      icon: <Zap className="h-8 w-8" />,
      quota: {
        daily: '500 appels',
        perMinute: '5 appels'
      }
    },
    {
      name: 'PREMIUM',
      price: '5€',
      description: 'Pour les développeurs professionnels',
      features: [
        { text: '150 000 appels par jours', icon: <Rocket className="h-4 w-4" />, highlight: true },
        { text: '100 appels par minute', icon: <Rocket className="h-4 w-4" />, highlight: true },
        { text: 'Support prioritaire 24/7', icon: <Headphones className="h-4 w-4" />, highlight: true },
        { text: 'Analytics avancées', icon: <Star className="h-4 w-4" />, highlight: true },
        { text: 'Webhooks personnalisés', icon: <Zap className="h-4 w-4" />, highlight: true },
        { text: 'SLA garanti 99.9%', icon: <Shield className="h-4 w-4" />, highlight: true },
        { text: 'Accès aux nouvelles APIs en avant-première', icon: <Star className="h-4 w-4" />, highlight: true },
        { text: 'Intégrations premium (Slack, Discord)', icon: <Check className="h-4 w-4" />, highlight: true }
      ],
      buttonText: 'Choisir Premium',
      buttonHref: '/checkout',
      popular: true,
      icon: <Crown className="h-8 w-8" />,
      quota: {
        daily: '150 000 appels',
        perMinute: '100 appels'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {plans.map((plan, index) => (
        <PricingCard key={plan.name} plan={plan} index={index} />
      ))}
    </div>
  );
} 