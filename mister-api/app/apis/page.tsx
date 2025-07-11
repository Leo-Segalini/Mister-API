'use client';

import {
  ApisHeader,
  ApisList,
  ApisFeatures,
  ApisCTA
} from '@/components/apis';

export default function APIs() {
  return (
    <div className="bg-black min-h-screen">
      <ApisHeader />
      <ApisList />
      <ApisFeatures />
      <ApisCTA />
    </div>
  );
} 