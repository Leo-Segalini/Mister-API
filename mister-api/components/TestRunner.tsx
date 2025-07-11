'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Stop, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  Zap,
  Database,
  Globe,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';

export interface TestResult {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  response_time: number;
  status_code: number;
  error_message?: string;
  timestamp: Date;
  assertions: TestAssertion[];
}

export interface TestAssertion {
  name: string;
  status: 'passed' | 'failed';
  expected: any;
  actual: any;
  message?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestDefinition[];
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  last_run?: Date;
  avg_duration: number;
}

export interface TestDefinition {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  expected_status: number;
  expected_schema?: any;
  timeout: number;
  retries: number;
}

interface TestRunnerProps {
  className?: string;
}

const TestRunner: React.FC<TestRunnerProps> = ({ className = '' }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [currentResults, setCurrentResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadTestSuites();
    }
  }, [isAuthenticated, isAdmin]);

  const loadTestSuites = async () => {
    try {
      // Simuler le chargement des suites de tests
      const mockSuites: TestSuite[] = [
        {
          id: '1',
          name: 'API Citations',
          description: 'Tests pour l\'API des citations historiques',
          total_tests: 8,
          passed_tests: 7,
          failed_tests: 1,
          skipped_tests: 0,
          last_run: new Date(Date.now() - 1000 * 60 * 30),
          avg_duration: 245,
          tests: [
            {
              id: '1.1',
              name: 'Récupérer une citation aléatoire',
              endpoint: '/api/v1/citations/random',
              method: 'GET',
              expected_status: 200,
              timeout: 5000,
              retries: 3
            },
            {
              id: '1.2',
              name: 'Récupérer une citation par ID',
              endpoint: '/api/v1/citations/123',
              method: 'GET',
              expected_status: 200,
              timeout: 5000,
              retries: 3
            },
            {
              id: '1.3',
              name: 'Citation inexistante',
              endpoint: '/api/v1/citations/999999',
              method: 'GET',
              expected_status: 404,
              timeout: 5000,
              retries: 3
            }
          ]
        },
        {
          id: '2',
          name: 'API Animaux',
          description: 'Tests pour l\'API des animaux',
          total_tests: 6,
          passed_tests: 6,
          failed_tests: 0,
          skipped_tests: 0,
          last_run: new Date(Date.now() - 1000 * 60 * 15),
          avg_duration: 180,
          tests: [
            {
              id: '2.1',
              name: 'Récupérer un animal aléatoire',
              endpoint: '/api/v1/animals/random',
              method: 'GET',
              expected_status: 200,
              timeout: 5000,
              retries: 3
            },
            {
              id: '2.2',
              name: 'Récupérer un animal par ID',
              endpoint: '/api/v1/animals/456',
              method: 'GET',
              expected_status: 200,
              timeout: 5000,
              retries: 3
            }
          ]
        },
        {
          id: '3',
          name: 'API Pays',
          description: 'Tests pour l\'API des pays du monde',
          total_tests: 5,
          passed_tests: 4,
          failed_tests: 1,
          skipped_tests: 0,
          last_run: new Date(Date.now() - 1000 * 60 * 45),
          avg_duration: 320,
          tests: [
            {
              id: '3.1',
              name: 'Récupérer un pays par ID',
              endpoint: '/api/v1/pays/789',
              method: 'GET',
              expected_status: 200,
              timeout: 5000,
              retries: 3
            },
            {
              id: '3.2',
              name: 'Pays inexistant',
              endpoint: '/api/v1/pays/999999',
              method: 'GET',
              expected_status: 404,
              timeout: 5000,
              retries: 3
            }
          ]
        }
      ];

      setTestSuites(mockSuites);
    } catch (error) {
      console.error('Error loading test suites:', error);
      showError('Erreur', 'Impossible de charger les suites de tests');
    } finally {
      setIsLoading(false);
    }
  };

  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    setIsRunning(true);
    setSelectedSuite(suiteId);
    setCurrentResults([]);

    try {
      // Simuler l'exécution des tests
      for (const test of suite.tests) {
        const result: TestResult = {
          id: test.id,
          name: test.name,
          endpoint: test.endpoint,
          method: test.method,
          status: 'running',
          duration: 0,
          response_time: 0,
          status_code: 0,
          timestamp: new Date(),
          assertions: []
        };

        setCurrentResults(prev => [...prev, result]);

        // Simuler le délai d'exécution
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simuler le résultat
        const isSuccess = Math.random() > 0.1; // 90% de succès
        const responseTime = 100 + Math.random() * 400;
        const statusCode = isSuccess ? test.expected_status : 500;

        const updatedResult: TestResult = {
          ...result,
          status: isSuccess ? 'passed' : 'failed',
          duration: responseTime,
          response_time: responseTime,
          status_code: statusCode,
          error_message: isSuccess ? undefined : 'Erreur de connexion simulée',
          assertions: [
            {
              name: 'Status Code',
              status: statusCode === test.expected_status ? 'passed' : 'failed',
              expected: test.expected_status,
              actual: statusCode
            },
            {
              name: 'Response Time',
              status: responseTime < 1000 ? 'passed' : 'failed',
              expected: '< 1000ms',
              actual: `${responseTime}ms`
            }
          ]
        };

        setCurrentResults(prev => 
          prev.map(r => r.id === test.id ? updatedResult : r)
        );
      }

      showSuccess('Succès', `Suite de tests "${suite.name}" terminée`);
    } catch (error) {
      console.error('Error running test suite:', error);
      showError('Erreur', 'Erreur lors de l\'exécution des tests');
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setSelectedSuite(null);
    setCurrentResults([]);

    try {
      for (const suite of testSuites) {
        await runTestSuite(suite.id);
      }
      showSuccess('Succès', 'Tous les tests ont été exécutés');
    } catch (error) {
      console.error('Error running all tests:', error);
      showError('Erreur', 'Erreur lors de l\'exécution des tests');
    } finally {
      setIsRunning(false);
    }
  };

  const stopTests = () => {
    setIsRunning(false);
    setCurrentResults(prev => 
      prev.map(r => r.status === 'running' ? { ...r, status: 'skipped' } : r)
    );
    showSuccess('Arrêté', 'Exécution des tests arrêtée');
  };

  const exportResults = () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        suites: testSuites,
        results: currentResults
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Succès', 'Résultats exportés avec succès');
    } catch (error) {
      console.error('Error exporting results:', error);
      showError('Erreur', 'Impossible d\'exporter les résultats');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'passed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'skipped': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSuiteIcon = (name: string) => {
    if (name.includes('Citation')) return <BookOpen className="h-5 w-5" />;
    if (name.includes('Animal')) return <Database className="h-5 w-5" />;
    if (name.includes('Pays')) return <Globe className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Test Runner</h2>
          <p className="text-gray-600">Tests automatisés pour les APIs</p>
        </div>
        <div className="flex items-center space-x-2">
          {!isRunning ? (
            <>
              <button
                onClick={runAllTests}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Exécuter Tout</span>
              </button>
              <button
                onClick={exportResults}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </button>
            </>
          ) : (
            <button
              onClick={stopTests}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Stop className="h-4 w-4" />
              <span>Arrêter</span>
            </button>
          )}
        </div>
      </div>

      {/* Test Suites */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des suites de tests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testSuites.map((suite) => (
            <motion.div
              key={suite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getSuiteIcon(suite.name)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
                    <p className="text-sm text-gray-600">{suite.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{suite.passed_tests}</div>
                  <div className="text-xs text-gray-500">Succès</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{suite.failed_tests}</div>
                  <div className="text-xs text-gray-500">Échecs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{suite.skipped_tests}</div>
                  <div className="text-xs text-gray-500">Ignorés</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Total: {suite.total_tests} tests</span>
                <span>Durée moy: {suite.avg_duration}ms</span>
              </div>

              {suite.last_run && (
                <div className="text-xs text-gray-400 mb-4">
                  Dernière exécution: {suite.last_run.toLocaleString()}
                </div>
              )}

              <button
                onClick={() => runTestSuite(suite.id)}
                disabled={isRunning}
                className={`w-full px-4 py-2 rounded-md transition-colors ${
                  isRunning
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning && selectedSuite === suite.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>En cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Exécuter</span>
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Current Results */}
      {currentResults.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Résultats en cours ({currentResults.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {currentResults.map((result) => (
              <div key={result.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{result.name}</h4>
                      <p className="text-sm text-gray-500 font-mono">{result.method} {result.endpoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                    <span className="text-gray-500">{result.response_time}ms</span>
                    {result.status_code > 0 && (
                      <span className="text-gray-500">HTTP {result.status_code}</span>
                    )}
                  </div>
                </div>

                {result.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                    <p className="text-sm text-red-800">{result.error_message}</p>
                  </div>
                )}

                {result.assertions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Assertions:</h5>
                    {result.assertions.map((assertion, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{assertion.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">
                            Attendu: {assertion.expected} | Reçu: {assertion.actual}
                          </span>
                          {assertion.status === 'passed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner; 