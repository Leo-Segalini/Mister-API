'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface ServerStatusProps {
  className?: string;
}

export default function ServerStatus({ className = '' }: ServerStatusProps) {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      
      const response = await fetch('http://localhost:3001/api/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 5 secondes
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      console.log('🔍 Server status check failed:', error);
      setServerStatus('offline');
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkServerStatus();
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'checking':
        return <Server className="h-4 w-4 text-yellow-400 animate-pulse" />;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'checking':
        return 'Vérification du serveur...';
      case 'online':
        return 'Serveur en ligne';
      case 'offline':
        return 'Serveur hors ligne';
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'checking':
        return 'text-yellow-400';
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
    }
  };

  const getBackgroundColor = () => {
    switch (serverStatus) {
      case 'checking':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'online':
        return 'bg-green-900/20 border-green-700';
      case 'offline':
        return 'bg-red-900/20 border-red-700';
    }
  };

  if (serverStatus === 'online') {
    return null; // Ne pas afficher si le serveur est en ligne
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${getBackgroundColor()} ${className}`}
    >
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {serverStatus === 'offline' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-gray-300">
                Le serveur backend n'est pas accessible sur http://localhost:3001
              </p>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Solutions possibles :</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-2">
                  <li>• Démarrer le serveur backend : <code className="bg-gray-800 px-1 rounded">npm run start:dev</code></li>
                  <li>• Vérifier que le port 3001 est disponible</li>
                  <li>• Vérifier les logs du serveur</li>
                </ul>
              </div>
              <button
                onClick={checkServerStatus}
                className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
              >
                Vérifier à nouveau
              </button>
            </div>
          )}
          {lastCheck && (
            <p className="text-xs text-gray-500 mt-1">
              Dernière vérification : {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
} 