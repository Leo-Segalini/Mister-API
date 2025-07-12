'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Star, 
  BookOpen, 
  PawPrint, 
  MapPin,
  CheckCircle,
  Book,
  ArrowRight,
  ExternalLink,
  Play
} from 'lucide-react';
import { event } from '@/lib/gtag';

interface ApiCardProps {
  api: {
    name: string;
    description: string;
    endpoint: string;
    documentation: string;
    features: string[];
    categories: string[];
    popular?: boolean;
  };
  index: number;
}

export default function ApiCard({ api, index }: ApiCardProps) {
  // Fonction pour générer l'exemple de réponse selon l'API
  const getExampleResponse = (apiName: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    if (apiName.includes('Citations') || apiName.includes('Punchlines')) {
      return {
        request: `GET ${baseUrl}/api/v1/punchlines?limit=1&theme=Sagesse
Authorization: Bearer votre_clé_api`,
        response: `{
    "success": true,
    "message": "Citations historiques récupérées avec succès",
    "data": {
        "punchlines": [
            {
                "id": "f71092bf-5246-493f-af6b-70e3fc7e30c5",
                "citation": "La vie est un mystère qu'il faut vivre, et non un problème à résoudre.",
                "auteur": "Gandhi",
                "theme": "Sagesse",
                "tags": [
                    "vie",
                    "mystère",
                    "philosophie"
                ],
                "source_film": false,
                "source_livre": true,
                "annee": 1947,
                "langue": "Inde",
                "popularite": 87,
                "created_at": "2025-07-05T11:42:49.972Z",
                "updated_at": "2025-07-05T11:42:49.972Z"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 1,
        "totalPages": 1
    }
}`
      };
    } else if (apiName.includes('Animaux')) {
      return {
        request: `GET ${baseUrl}/api/v1/animaux?limit=1&famille=Delphinidés
Authorization: Bearer votre_clé_api`,
        response: `{
    "success": true,
    "message": "Animaux récupérés avec succès",
    "data": {
        "animaux": [
            {
                "id": "8f4393d1-de10-4ece-939e-aadc17f8b6f2",
                "nom": "Dauphin",
                "espece": "Delphinus delphis",
                "famille": "Delphinidés",
                "habitat": "Océans",
                "alimentation": "Carnivore",
                "taille": 2.00,
                "poids": 150.00,
                "esperance_vie": 25,
                "zones_geographiques": ["Océans", "Mers"],
                "image_url": null,
                "is_active": true,
                "created_at": "2025-07-05T11:42:49.972Z",
                "updated_at": "2025-07-05T11:42:49.972Z"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 1,
        "totalPages": 1
    }
}`
      };
    } else if (apiName.includes('Pays')) {
      return {
        request: `GET ${baseUrl}/api/v1/pays?limit=1&continent=Amérique du Nord
Authorization: Bearer votre_clé_api`,
        response: `{
    "success": true,
    "message": "Pays récupérés avec succès",
    "data": {
        "pays": [
            {
                "id": "fb6fe022-beca-4217-936c-2ed855d531f0",
                "nom": "Canada",
                "capitale": "Ottawa",
                "population": "38000000",
                "superficie": "9984670.00",
                "continent": "Amérique du Nord",
                "langue_officielle": "Anglais",
                "monnaie": "Dollar canadien",
                "nombre_habitants": "38000000",
                "plus_grandes_villes": [
                    {
                        "nom": "Toronto",
                        "population": 2930000
                    },
                    {
                        "nom": "Montréal",
                        "population": 1704694
                    }
                ],
                "plus_grandes_regions": [
                    {
                        "nom": "Ontario",
                        "population": 14711827
                    }
                ],
                "animal_national": null,
                "is_active": true,
                "created_at": "2025-07-05T11:42:49.972Z",
                "updated_at": "2025-07-05T11:42:49.972Z"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 1,
        "totalPages": 1
    }
}`
      };
    }
    
    // Fallback par défaut
    return {
      request: `GET ${baseUrl}${api.endpoint}?limit=1
Authorization: Bearer votre_clé_api`,
      response: `{
    "success": true,
    "message": "Données récupérées avec succès",
    "data": {
        "items": [
            {
                "id": "example-id",
                "example": "Données de l'API"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 1,
        "totalPages": 1
    }
}`
    };
  };

  const example = getExampleResponse(api.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
      whileHover={{ y: -5 }}
      className="bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-3">
              {(api.name.includes('Citations') || api.name.includes('Punchlines')) && <BookOpen className="h-8 w-8 text-green-400" />}
              {api.name.includes('Animaux') && <PawPrint className="h-8 w-8 text-green-400" />}
              {api.name.includes('Pays') && <MapPin className="h-8 w-8 text-green-400" />}
              <h2 className="text-3xl font-bold text-white">{api.name}</h2>
            </div>
            {api.popular && (
              <span className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Populaire
              </span>
            )}
            <span className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
              Actif
            </span>
          </div>

          <p className="text-gray-400 mb-6 text-lg leading-relaxed">
            {api.description}
          </p>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
            <code className="text-sm text-green-400 font-mono">{api.endpoint}</code>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-white">Fonctionnalités :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {api.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-white">Catégories disponibles :</h3>
            <div className="flex flex-wrap gap-2">
              {api.categories.slice(0, 6).map((category, categoryIndex) => (
                <span
                  key={categoryIndex}
                  className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-medium"
                >
                  {category}
                </span>
              ))}
              {api.categories.length > 6 && (
                <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm">
                  +{api.categories.length - 6} autres
                </span>
              )}
            </div>
          </div>

          {/* Exemple de requête et réponse */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-white">Exemple d'utilisation :</h3>
            
            {/* Requête */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Requête :</h4>
              <div className="bg-black p-4 rounded-lg border border-gray-700">
                <pre className="text-sm text-green-400 overflow-x-auto">
{example.request}
                </pre>
              </div>
            </div>

            {/* Réponse */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Réponse :</h4>
              <div className="bg-black p-4 rounded-lg border border-gray-700">
                <pre className="text-sm text-green-400 overflow-x-auto">
{example.response}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:ml-8 lg:mt-0 mt-8">
          <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={api.documentation}
                onClick={() => {
                  event({
                    action: 'click',
                    category: 'api_card',
                    label: `${api.name}_documentation`
                  })
                }}
                className="bg-green-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors inline-flex items-center space-x-2 w-full justify-center shadow-sm"
              >
                <Book className="h-5 w-5" />
                <span>Documentation</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/pricing"
                onClick={() => {
                  event({
                    action: 'click',
                    category: 'api_card',
                    label: `${api.name}_pricing`
                  })
                }}
                className="border-2 border-green-400 text-green-400 px-6 py-3 rounded-lg font-semibold hover:bg-green-400 hover:text-black transition-colors inline-flex items-center space-x-2 w-full justify-center"
              >
                <span>Voir les tarifs</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                onClick={() => {
                  event({
                    action: 'click',
                    category: 'api_card',
                    label: `${api.name}_start_free`
                  })
                }}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors inline-flex items-center space-x-2 w-full justify-center border border-gray-700"
              >
                <span>Commencer gratuitement</span>
                <ExternalLink className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 