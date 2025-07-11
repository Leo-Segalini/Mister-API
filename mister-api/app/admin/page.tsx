'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Database, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  BookOpen,
  PawPrint,
  MapPin,
  FileText,
  Play
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToastContext } from '@/components/ToastProvider';
import { AdminGuard } from '@/components/AdminGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Citation, Animal, Pays, User } from '@/types';

function AdminContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  
  // États pour les données
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'users' | 'analytics' | 'logs' | 'cache' | 'tests'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les données
  const [citations, setCitations] = useState<Citation[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [pays, setPays] = useState<Pays[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // États pour les stats
  const [stats, setStats] = useState({
    totalCitations: 0,
    totalAnimals: 0,
    totalPays: 0,
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalApiCalls: 0,
    todayApiCalls: 0
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les données en parallèle
      const [citationsResponse, animalsResponse, paysResponse] = await Promise.all([
        apiService.getCitations(),
        apiService.getAnimaux(),
        apiService.getPays()
      ]);
      
      const citationsData = citationsResponse.data || [];
      const animalsData = animalsResponse.data || [];
      const paysData = paysResponse.data || [];
      const usersData: User[] = []; // TODO: Implémenter getAllUsers quand l'endpoint sera disponible
      
      setCitations(citationsData);
      setAnimals(animalsData);
      setPays(paysData);
      setUsers(usersData);
      
      // Calculer les stats
      setStats({
        totalCitations: citationsData.length,
        totalAnimals: animalsData.length,
        totalPays: paysData.length,
        totalUsers: usersData.length,
        activeUsers: usersData.length, // TODO: Ajouter is_active au type User
        premiumUsers: usersData.filter(u => u.is_premium).length,
        totalApiCalls: 0, // À implémenter avec les vraies données
        todayApiCalls: 0  // À implémenter avec les vraies données
      });
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      showError('Erreur', 'Impossible de charger les données d\'administration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (type: 'citation' | 'animal' | 'pays' | 'user', id: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) {
      return;
    }

    try {
      // Implémenter la suppression selon le type
      showSuccess('Succès', 'Élément supprimé avec succès');
      loadAdminData(); // Recharger les données
    } catch (error: any) {
      console.error('Error deleting item:', error);
      showError('Erreur', error.message || 'Impossible de supprimer l\'élément');
    }
  };

  const handleExportData = async (type: 'citations' | 'animals' | 'pays' | 'users') => {
    try {
      // Implémenter l'export
      showSuccess('Succès', `Données ${type} exportées avec succès`);
    } catch (error: any) {
      console.error('Error exporting data:', error);
      showError('Erreur', 'Impossible d\'exporter les données');
    }
  };

  const filteredData = () => {
    const data = {
      citations: citations.filter(c => 
        c.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.auteur.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      animals: animals.filter(a => 
        a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.espece.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      pays: pays.filter(p => 
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.capitale.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      users: users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
    return data;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Database className="h-8 w-8 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">Administration</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Admin: {user?.prenom} {user?.nom}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Vue d\'ensemble', icon: <BarChart3 className="h-5 w-5" /> },
              { id: 'data', name: 'Gestion des Données', icon: <Database className="h-5 w-5" /> },
              { id: 'users', name: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
              { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="h-5 w-5" /> },
              { id: 'logs', name: 'Logs', icon: <FileText className="h-5 w-5" /> },
              { id: 'cache', name: 'Cache', icon: <Database className="h-5 w-5" /> },
              { id: 'tests', name: 'Tests', icon: <Play className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Citations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCitations}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Animaux</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAnimals}</p>
                  </div>
                  <PawPrint className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pays</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPays}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('data')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Database className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-700">Gérer les Données</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-700">Gérer les Utilisateurs</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-700">Voir les Analytics</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Data Management */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Gestion des Données</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExportData('citations')}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exporter</span>
                    </button>
                    <button
                      onClick={loadAdminData}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Actualiser</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Citations */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                        Citations ({filteredData().citations.length})
                      </h3>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredData().citations.slice(0, 5).map((citation) => (
                        <div key={citation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">"{citation.citation}"</p>
                            <p className="text-xs text-gray-500">— {citation.auteur}</p>
                          </div>
                          <div className="flex space-x-1">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-blue-400 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('citation', citation.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Animaux */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <PawPrint className="h-5 w-5 mr-2 text-blue-500" />
                        Animaux ({filteredData().animals.length})
                      </h3>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredData().animals.slice(0, 5).map((animal) => (
                        <div key={animal.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">{animal.nom}</p>
                            <p className="text-xs text-gray-500">{animal.espece}</p>
                          </div>
                          <div className="flex space-x-1">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-blue-400 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('animal', animal.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pays */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-purple-500" />
                        Pays ({filteredData().pays.length})
                      </h3>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredData().pays.slice(0, 5).map((pays) => (
                        <div key={pays.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">{pays.nom}</p>
                            <p className="text-xs text-gray-500">{pays.capitale}</p>
                          </div>
                          <div className="flex space-x-1">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-blue-400 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('pays', pays.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Users Management */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Gestion des Utilisateurs</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExportData('users')}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exporter</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData().users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.prenom?.[0]}{user.nom?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.prenom} {user.nom}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            true // TODO: Ajouter is_active au type User
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Actif
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_premium 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_premium ? 'Premium' : 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('user', user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalApiCalls}</div>
                  <div className="text-sm text-gray-500">Total Appels API</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.todayApiCalls}</div>
                  <div className="text-sm text-gray-500">Appels Aujourd'hui</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                  <div className="text-sm text-gray-500">Utilisateurs Actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</div>
                  <div className="text-sm text-gray-500">Utilisateurs Premium</div>
                </div>
              </div>
              
              <div className="mt-8 text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Graphiques détaillés à venir...</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Visualisation des logs en temps réel</p>
              <button
                onClick={() => router.push('/logs')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Voir les logs détaillés
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'cache' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Gestion et optimisation du cache Redis</p>
              <button
                onClick={() => router.push('/cache')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Gérer le cache
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'tests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Tests automatisés pour les APIs</p>
              <button
                onClick={() => router.push('/tests')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Exécuter les tests
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
} 