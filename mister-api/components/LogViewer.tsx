'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  User,
  Globe,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';

export interface ApiLog {
  id: string;
  timestamp: Date;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status_code: number;
  response_time: number;
  user_id?: string;
  api_key_id?: string;
  ip_address: string;
  user_agent: string;
  request_body?: any;
  response_body?: any;
  error_message?: string;
}

interface LogViewerProps {
  className?: string;
  maxLogs?: number;
}

const LogViewer: React.FC<LogViewerProps> = ({ className = '', maxLogs = 100 }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadLogs();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadLogs();
      }, 5000); // Rafraîchir toutes les 5 secondes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    // Auto-scroll vers le bas pour les nouveaux logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadLogs = async () => {
    try {
      // Simuler le chargement des logs
      const mockLogs: ApiLog[] = [
        {
          id: '1',
          timestamp: new Date(),
          method: 'GET',
          endpoint: '/api/v1/citations/random',
          status_code: 200,
          response_time: 45,
          user_id: 'user123',
          api_key_id: 'key456',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 30),
          method: 'POST',
          endpoint: '/api/v1/api-keys',
          status_code: 201,
          response_time: 120,
          user_id: 'user123',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60),
          method: 'GET',
          endpoint: '/api/v1/animals/random',
          status_code: 429,
          response_time: 15,
          user_id: 'user456',
          api_key_id: 'key789',
          ip_address: '10.0.0.50',
          user_agent: 'curl/7.68.0',
          error_message: 'Rate limit exceeded'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 120),
          method: 'DELETE',
          endpoint: '/api/v1/api-keys/key123',
          status_code: 404,
          response_time: 25,
          user_id: 'user789',
          ip_address: '172.16.0.10',
          user_agent: 'PostmanRuntime/7.28.0',
          error_message: 'API key not found'
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
      showError('Erreur', 'Impossible de charger les logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm) ||
      log.user_agent.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'success' && log.status_code < 400) ||
      (statusFilter === 'error' && log.status_code >= 400);
    
    const matchesMethod = methodFilter === 'all' || log.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  }).slice(0, maxLogs);

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-100';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 bg-blue-100';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600 bg-blue-100';
      case 'POST': return 'text-green-600 bg-green-100';
      case 'PUT': return 'text-yellow-600 bg-yellow-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 100) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = async () => {
    try {
      const csvContent = [
        'Timestamp,Method,Endpoint,Status,Response Time,IP Address,User Agent',
        ...filteredLogs.map(log => 
          `${formatTimestamp(log.timestamp)},${log.method},${log.endpoint},${log.status_code},${log.response_time},${log.ip_address},"${log.user_agent}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Succès', 'Logs exportés avec succès');
    } catch (error) {
      console.error('Error exporting logs:', error);
      showError('Erreur', 'Impossible d\'exporter les logs');
    }
  };

  const getStats = () => {
    const total = filteredLogs.length;
    const success = filteredLogs.filter(log => log.status_code < 400).length;
    const error = total - success;
    const avgResponseTime = total > 0 
      ? Math.round(filteredLogs.reduce((sum, log) => sum + log.response_time, 0) / total)
      : 0;
    
    return { total, success, error, avgResponseTime };
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logs API</h2>
          <p className="text-gray-600">Surveillance en temps réel des requêtes API</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadLogs}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Requêtes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Succès</p>
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Erreurs</p>
              <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Temps Moyen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par endpoint, IP, user agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="success">Succès (2xx, 3xx)</option>
              <option value="error">Erreurs (4xx, 5xx)</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les méthodes</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Agent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun log trouvé
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(log.method)}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status_code)}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getResponseTimeColor(log.response_time)}>
                        {log.response_time}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={log.user_agent}>
                        {log.user_agent}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default LogViewer; 