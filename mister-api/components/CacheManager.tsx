'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Clock, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';

export interface CacheStats {
  total_keys: number;
  memory_usage: number;
  hit_rate: number;
  miss_rate: number;
  evictions: number;
  expired_keys: number;
  last_cleanup: Date;
}

export interface CacheKey {
  key: string;
  type: 'citation' | 'animal' | 'pays' | 'user' | 'api_key' | 'stats';
  size: number;
  ttl: number;
  created_at: Date;
  last_accessed: Date;
  access_count: number;
}

interface CacheManagerProps {
  className?: string;
}

const CacheManager: React.FC<CacheManagerProps> = ({ className = '' }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cacheKeys, setCacheKeys] = useState<CacheKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadCacheData();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadCacheData();
      }, 10000); // Rafraîchir toutes les 10 secondes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadCacheData = async () => {
    try {
      // Simuler le chargement des données de cache
      const mockStats: CacheStats = {
        total_keys: 1247,
        memory_usage: 45.2, // MB
        hit_rate: 87.3, // %
        miss_rate: 12.7, // %
        evictions: 23,
        expired_keys: 156,
        last_cleanup: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      };

      const mockKeys: CacheKey[] = [
        {
          key: 'citation:random:123',
          type: 'citation',
          size: 2048,
          ttl: 3600,
          created_at: new Date(Date.now() - 1000 * 60 * 15),
          last_accessed: new Date(Date.now() - 1000 * 60 * 2),
          access_count: 45
        },
        {
          key: 'animal:random:456',
          type: 'animal',
          size: 1536,
          ttl: 3600,
          created_at: new Date(Date.now() - 1000 * 60 * 30),
          last_accessed: new Date(Date.now() - 1000 * 60 * 5),
          access_count: 23
        },
        {
          key: 'pays:list:all',
          type: 'pays',
          size: 8192,
          ttl: 7200,
          created_at: new Date(Date.now() - 1000 * 60 * 60),
          last_accessed: new Date(Date.now() - 1000 * 60 * 10),
          access_count: 12
        },
        {
          key: 'stats:user:789',
          type: 'stats',
          size: 512,
          ttl: 1800,
          created_at: new Date(Date.now() - 1000 * 60 * 45),
          last_accessed: new Date(Date.now() - 1000 * 60 * 1),
          access_count: 8
        }
      ];

      setCacheStats(mockStats);
      setCacheKeys(mockKeys);
    } catch (error) {
      console.error('Error loading cache data:', error);
      showError('Erreur', 'Impossible de charger les données de cache');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async (type?: string) => {
    try {
      if (type) {
        setCacheKeys(prev => prev.filter(key => key.type !== type));
        showSuccess('Succès', `Cache ${type} vidé avec succès`);
      } else {
        setCacheKeys([]);
        setCacheStats(prev => prev ? { ...prev, total_keys: 0, memory_usage: 0 } : null);
        showSuccess('Succès', 'Cache entièrement vidé');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      showError('Erreur', 'Impossible de vider le cache');
    }
  };

  const warmCache = async () => {
    try {
      // Simuler le réchauffement du cache
      showSuccess('Succès', 'Cache en cours de réchauffement...');
    } catch (error) {
      console.error('Error warming cache:', error);
      showError('Erreur', 'Impossible de réchauffer le cache');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'citation': return 'text-blue-600 bg-blue-100';
      case 'animal': return 'text-green-600 bg-green-100';
      case 'pays': return 'text-purple-600 bg-purple-100';
      case 'user': return 'text-yellow-600 bg-yellow-100';
      case 'api_key': return 'text-red-600 bg-red-100';
      case 'stats': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'citation': return <BookOpen className="h-4 w-4" />;
      case 'animal': return <PawPrint className="h-4 w-4" />;
      case 'pays': return <Globe className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'api_key': return <Key className="h-4 w-4" />;
      case 'stats': return <BarChart3 className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const filteredKeys = cacheKeys.filter(key => 
    selectedType === 'all' || key.type === selectedType
  );

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestionnaire de Cache</h2>
          <p className="text-gray-600">Optimisation des performances et surveillance du cache Redis</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadCacheData}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={warmCache}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Zap className="h-4 w-4" />
            <span>Réchauffer</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {cacheStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Clés Total</p>
                <p className="text-2xl font-bold text-gray-900">{cacheStats.total_keys.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% ce mois</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Mémoire Utilisée</p>
                <p className="text-2xl font-bold text-gray-900">{cacheStats.memory_usage} MB</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(cacheStats.memory_usage / 100) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Taux de Hit</p>
                <p className="text-2xl font-bold text-green-600">{cacheStats.hit_rate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+5% cette semaine</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Évictions</p>
                <p className="text-2xl font-bold text-red-600">{cacheStats.evictions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Dernière: {cacheStats.last_cleanup.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="citation">Citations</option>
              <option value="animal">Animaux</option>
              <option value="pays">Pays</option>
              <option value="user">Utilisateurs</option>
              <option value="api_key">Clés API</option>
              <option value="stats">Statistiques</option>
            </select>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => clearCache(selectedType !== 'all' ? selectedType : undefined)}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vider {selectedType !== 'all' ? selectedType : 'Cache'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cache Keys Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Clés de Cache ({filteredKeys.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TTL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accès
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier Accès
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune clé trouvée
                  </td>
                </tr>
              ) : (
                filteredKeys.map((cacheKey) => (
                  <tr key={cacheKey.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 max-w-xs truncate" title={cacheKey.key}>
                        {cacheKey.key}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(cacheKey.type)}`}>
                        {getTypeIcon(cacheKey.type)}
                        <span className="ml-1 capitalize">{cacheKey.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBytes(cacheKey.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(cacheKey.ttl)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cacheKey.access_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cacheKey.last_accessed.toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CacheManager; 