'use client';

import {
  PricingHeader,
  PricingPlans,
  PricingFAQ,
  PricingCTA
} from '@/components/pricing';

export default function Pricing() {
  return (
    <div className="bg-black text-white min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingHeader />
        <PricingPlans />
        <PricingFAQ />
        <PricingCTA />
      </div>
    </div>
  );
} 