'use client';

import { motion } from 'framer-motion';
import { MapPin, Code, Zap, Shield, ArrowRight, Copy, Check, ChevronDown, ChevronUp, Settings, Database } from 'lucide-react';
import { useState } from 'react';

interface Pays {
  id: string;
  nom: string;
  capitale: string;
  population: string;
  superficie: string;
  continent: string;
  langue_officielle: string;
  monnaie: string;
  drapeau_url: string | null;
  nombre_habitants: string;
  plus_grandes_villes: Array<{ nom: string; population: number }>;
  plus_grandes_regions: Array<{ nom: string; population: number }>;
  animal_national: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    pays: Pays[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AccordionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function PaysDuMondeDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>('getting-started');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const codeExamples = [
    {
      id: 'basic',
      title: 'Liste des pays',
      description: 'Récupérez la liste complète des pays du monde',
      code: `curl -X GET "http://localhost:3001/api/v1/pays" \\
  -H "x-api-key: votre_clé_api"`,
      response: {
        success: true,
        message: "Pays récupérés avec succès",
        data: {
          pays: [
            {
              id: "fb6fe022-beca-4217-936c-2ed855d531f0",
              nom: "Canada",
              capitale: "Ottawa",
              population: "38000000",
              superficie: "9984670.00",
              continent: "Amérique du Nord",
              langue_officielle: "Anglais",
              monnaie: "Dollar canadien",
              drapeau_url: null,
              nombre_habitants: "38000000",
              plus_grandes_villes: [
                {
                  nom: "Toronto",
                  population: 2930000
                },
                {
                  nom: "Montréal",
                  population: 1704694
                }
              ],
              plus_grandes_regions: [
                {
                  nom: "Ontario",
                  population: 14711827
                }
              ],
              animal_national: null,
              is_active: true,
              created_at: "2025-07-05T11:42:49.972Z",
              updated_at: "2025-07-05T11:42:49.972Z"
            }
          ],
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      }
    },
    {
      id: 'continent',
      title: 'Filtrage par continent',
      description: 'Récupérez les pays d\'un continent spécifique',
      code: `curl -X GET "http://localhost:3001/api/v1/pays?continent=Europe" \\
  -H "x-api-key: votre_clé_api"`,
      response: {
        success: true,
        message: "Pays récupérés avec succès",
        data: {
          pays: [
            {
              id: "e10fae4a-b736-4f50-a63c-b1c3aa5896ca",
              nom: "France",
              capitale: "Paris",
              population: "67390000",
              superficie: "551695.00",
              continent: "Europe",
              langue_officielle: "Français",
              monnaie: "Euro",
              drapeau_url: null,
              nombre_habitants: "67390000",
              plus_grandes_villes: [
                {
                  nom: "Paris",
                  population: 2161000
                },
                {
                  nom: "Marseille",
                  population: 861635
                }
              ],
              plus_grandes_regions: [
                {
                  nom: "Île-de-France",
                  population: 12278247
                }
              ],
              animal_national: null,
              is_active: true,
              created_at: "2025-07-05T11:42:49.972Z",
              updated_at: "2025-07-05T11:42:49.972Z"
            }
          ],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      }
    },
    {
      id: 'search',
      title: 'Recherche par nom',
      description: 'Recherchez un pays par son nom',
      code: `curl -X GET "http://localhost:3001/api/v1/pays?search=canada" \\
  -H "x-api-key: votre_clé_api"`,
      response: {
        success: true,
        message: "Pays récupérés avec succès",
        data: {
          pays: [
            {
              id: "fb6fe022-beca-4217-936c-2ed855d531f0",
              nom: "Canada",
              capitale: "Ottawa",
              population: "38000000",
              superficie: "9984670.00",
              continent: "Amérique du Nord",
              langue_officielle: "Anglais",
              monnaie: "Dollar canadien",
              drapeau_url: null,
              nombre_habitants: "38000000",
              plus_grandes_villes: [
                {
                  nom: "Toronto",
                  population: 2930000
                },
                {
                  nom: "Montréal",
                  population: 1704694
                }
              ],
              plus_grandes_regions: [
                {
                  nom: "Ontario",
                  population: 14711827
                }
              ],
              animal_national: null,
              is_active: true,
              created_at: "2025-07-05T11:42:49.972Z",
              updated_at: "2025-07-05T11:42:49.972Z"
            }
          ],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      }
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Données géographiques',
      description: 'Informations complètes sur tous les pays'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Données fiables',
      description: 'Base de données mise à jour régulièrement'
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'API RESTful',
      description: 'Interface simple et intuitive'
    }
  ];

  const accordionItems: AccordionItem[] = [
    {
      id: 'getting-started',
      title: 'Commencer',
      icon: <Zap className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Introduction</h4>
            <p className="text-gray-300 mb-4">
              L'API Pays du Monde vous permet d'accéder à une base de données complète 
              des pays avec leurs informations géographiques, démographiques et économiques.
            </p>
            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-white mb-2">Endpoint de base</h5>
              <code className="text-green-400 text-sm">GET /api/v1/pays</code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Authentification</h4>
            <p className="text-gray-300 mb-3">
              Toutes les requêtes nécessitent une clé API valide dans l'en-tête :
            </p>
            <div className="bg-black rounded-lg p-3">
              <code className="text-green-400 text-sm">x-api-key: votre_clé_api</code>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'examples',
      title: 'Exemples d\'utilisation',
      icon: <Code className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          {codeExamples.map((example) => (
            <div key={example.id} className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">{example.title}</h4>
              <p className="text-gray-300 mb-3">{example.description}</p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Requête</span>
                  <button
                    onClick={() => copyToClipboard(example.code, example.id)}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    {copiedCode === example.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="bg-black rounded-lg p-3 overflow-x-auto">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap">{example.code}</pre>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-400 mb-2 block">Réponse</span>
                <div className="bg-black rounded-lg p-3 overflow-x-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                    {JSON.stringify(example.response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'parameters',
      title: 'Paramètres de requête',
      icon: <Settings className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Paramètres disponibles</h4>
            <div className="space-y-3">
              <div>
                <code className="text-green-400">search</code>
                <p className="text-gray-300 text-sm mt-1">Recherche par nom de pays</p>
              </div>
              <div>
                <code className="text-green-400">continent</code>
                <p className="text-gray-300 text-sm mt-1">Filtrage par continent</p>
              </div>
              <div>
                <code className="text-green-400">langue_officielle</code>
                <p className="text-gray-300 text-sm mt-1">Filtrage par langue officielle</p>
              </div>
              <div>
                <code className="text-green-400">monnaie</code>
                <p className="text-gray-300 text-sm mt-1">Filtrage par monnaie</p>
              </div>
              <div>
                <code className="text-green-400">page</code>
                <p className="text-gray-300 text-sm mt-1">Numéro de page (défaut: 1)</p>
              </div>
              <div>
                <code className="text-green-400">limit</code>
                <p className="text-gray-300 text-sm mt-1">Nombre d'éléments par page (défaut: 20)</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'response-format',
      title: 'Format de réponse',
      icon: <Database className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Structure de la réponse</h4>
            <div className="space-y-3">
              <div>
                <code className="text-green-400">success</code>
                <p className="text-gray-300 text-sm mt-1">Boolean indiquant le succès de la requête</p>
              </div>
              <div>
                <code className="text-green-400">message</code>
                <p className="text-gray-300 text-sm mt-1">Message descriptif</p>
              </div>
              <div>
                <code className="text-green-400">data.pays</code>
                <p className="text-gray-300 text-sm mt-1">Tableau des pays</p>
              </div>
              <div>
                <code className="text-green-400">data.total</code>
                <p className="text-gray-300 text-sm mt-1">Nombre total de pays</p>
              </div>
              <div>
                <code className="text-green-400">data.page</code>
                <p className="text-gray-300 text-sm mt-1">Page actuelle</p>
              </div>
              <div>
                <code className="text-green-400">data.totalPages</code>
                <p className="text-gray-300 text-sm mt-1">Nombre total de pages</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <MapPin className="h-12 w-12 text-green-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">API Pays du Monde</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Accédez à une base de données complète des pays du monde avec leurs informations 
              géographiques, démographiques et économiques.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-400/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Documentation avec accordéons */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            {accordionItems.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg border border-gray-700">
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-green-400">
                      {item.icon}
                    </div>
                    <span className="text-lg font-medium text-white">{item.title}</span>
                  </div>
                  {openAccordion === item.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {openAccordion === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    {item.content}
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
} 