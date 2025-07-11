'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CacheManager from '@/components/CacheManager';

export default function CachePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <Database className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Gestionnaire de Cache</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CacheManager />
      </div>
    </div>
  );
} 