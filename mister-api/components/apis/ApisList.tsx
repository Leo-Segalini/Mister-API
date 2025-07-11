'use client';

import { apis } from '@/lib/config';
import ApiCard from './ApiCard';

export default function ApisList() {
  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {apis.map((api, index) => (
            <ApiCard key={index} api={api} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
} 