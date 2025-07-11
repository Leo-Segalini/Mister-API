'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Code, 
  Crown,
  User
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardInfo } from '@/components/dashboard';

function DashboardContent() {
  const { user, isAdmin } = useAuth();

  // Fonction pour afficher le nom complet de l'utilisateur
  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    
    const hasName = user.nom && user.prenom;
    const hasFirstName = user.prenom;
    const hasLastName = user.nom;
    
    if (hasName) {
      return `${user.prenom} ${user.nom}`;
    } else if (hasFirstName) {
      return user.prenom;
    } else if (hasLastName) {
      return user.nom;
      } else {
      // Fallback vers l'email si aucun nom n'est défini
      return user.email?.split('@')[0] || 'Utilisateur';
    }
  };

  return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Code className="h-8 w-8 text-green-400" />
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              {isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-800 text-yellow-400">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">
                  Bonjour, <span className="text-green-400 font-medium">{getUserDisplayName()}</span>
                </span>
              </div>
            </div>
            </div>
        </div>
      </header>

      {/* Contenu du Dashboard */}
      <DashboardInfo user={user} isAdmin={isAdmin} />
      </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 