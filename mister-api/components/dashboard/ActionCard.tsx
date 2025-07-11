'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverColor: string;
  route: string;
  index: number;
}

export default function ActionCard({ 
  title, 
  description, 
  icon, 
  color, 
  bgColor, 
  hoverColor, 
  route, 
  index 
}: ActionCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-800 hover:border-gray-700 transition-all duration-200"
    >
      <div className="flex items-center mb-3">
        <div className={`${color} mr-2`}>
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      
      <div className="mb-4 min-h-[60px]">
        <p className="text-sm text-gray-300">{description}</p>
      </div>
      
      <button
        onClick={() => router.push(route)}
        className={`w-full ${bgColor} text-black px-3 py-2 rounded-md ${hoverColor} transition-colors font-semibold text-sm`}
      >
        Accéder
      </button>
    </motion.div>
  );
} 