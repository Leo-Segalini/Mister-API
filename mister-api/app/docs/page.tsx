'use client';

import { DocsHeader, QuickStart, ApisList, AdditionalResources } from '../../components/docs';

export default function Docs() {
  return (
    <div className="bg-black text-white min-h-screen">
      <DocsHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuickStart />
        <ApisList />
      </div>
      
      <AdditionalResources />
    </div>
  );
} 