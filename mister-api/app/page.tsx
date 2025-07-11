'use client';

import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  ApisSection,
  PricingSection,
  CTASection
} from '@/components/home';

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ApisSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
