'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Users, Settings, BarChart3, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, signout } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger si pas admin
  useEffect(() => {
    if (!isAdmin) {
      console.log('❌ [ADMIN] Accès refusé - Utilisateur non admin');
      showError('Accès refusé', 'Vous n\'avez pas les droits d\'administrateur nécessaires.');
      router.push('/dashboard');
    }
  }, [isAdmin, router, showError]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signout();
      showSuccess('Déconnexion réussie', 'Vous avez été déconnecté avec succès.');
      router.push('/admin-login');
    } catch (error) {
      console.error('❌ [ADMIN] Erreur lors de la déconnexion:', error);
      showError('Erreur', 'Erreur lors de la déconnexion.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p>Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-900/20 border border-red-700 rounded-lg">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-400">Administration</h1>
                <p className="text-sm text-gray-400">Panel d'administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Connecté en tant que: <span className="text-red-400">{user?.email}</span>
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenue dans l'administration
          </h2>
          <p className="text-gray-400">
            Gérez votre application depuis ce panel d'administration sécurisé.
          </p>
        </motion.div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestion des Utilisateurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-700 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-900/20 border border-blue-700 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Gestion des Utilisateurs</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Gérez les utilisateurs, leurs rôles et leurs permissions.
            </p>
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <span>Accéder</span>
            </Link>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-700 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-900/20 border border-green-700 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Statistiques</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Consultez les statistiques et métriques de votre application.
            </p>
            <Link
              href="/stats"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <span>Accéder</span>
            </Link>
          </motion.div>

          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-yellow-700 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <Settings className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Configuration</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Configurez les paramètres de votre application.
            </p>
            <Link
              href="/admin/settings"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
            >
              <span>Accéder</span>
            </Link>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-gray-400" />
              <span>Dashboard Utilisateur</span>
            </Link>
            <Link
              href="/logs"
              className="flex items-center space-x-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>📋</span>
              <span>Logs Système</span>
            </Link>
            <Link
              href="/cache"
              className="flex items-center space-x-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>⚡</span>
              <span>Gestion Cache</span>
            </Link>
            <Link
              href="/tests"
              className="flex items-center space-x-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>🧪</span>
              <span>Tests API</span>
            </Link>
          </div>
        </motion.div>

        {/* Admin Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 bg-red-900/10 border border-red-800 rounded-lg p-6"
        >
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-red-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Informations Administrateur
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rôle:</strong> <span className="text-red-400">{user?.role}</span></p>
                <p><strong>ID Utilisateur:</strong> {user?.id}</p>
                <p><strong>Statut Premium:</strong> {user?.is_premium ? 'Oui' : 'Non'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 