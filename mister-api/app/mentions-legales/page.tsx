'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Building, Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MentionsLegalesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-green-400" />
              <h1 className="text-xl font-bold text-white">Mentions Légales</h1>
            </div>
            <div className="w-20"></div> {/* Spacer pour centrer le titre */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Introduction */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Informations Légales</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Les présentes mentions légales s'appliquent à l'ensemble du site web Mister API et de ses services. 
              Elles sont conformes aux dispositions légales en vigueur en France et dans l'Union Européenne.
            </p>
          </div>

          {/* Éditeur du site */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Building className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Éditeur du Site</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-white">Raison sociale :</strong> Mister API</p>
              <p><strong className="text-white">Forme juridique :</strong> Entreprise individuelle</p>
              <p><strong className="text-white">Adresse :</strong> 37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France</p>
              <p><strong className="text-white">Email :</strong> contact@mister-api.com</p>
              <p><strong className="text-white">Téléphone :</strong> +33 6 70 96 33 71</p>
              <p><strong className="text-white">Directeur de publication :</strong> Léo SEGALINI-BRIANT</p>
            </div>
          </motion.div>

          {/* Hébergement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Hébergement</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-white">Frontend :</strong> Vercel Inc.</p>
              <p><strong className="text-white">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
              <p><strong className="text-white">Site web :</strong> <a href="https://vercel.com" className="text-green-400 hover:underline">vercel.com</a></p>
              <br />
              <p><strong className="text-white">Backend :</strong> Render Inc.</p>
              <p><strong className="text-white">Adresse :</strong> 2261 Market Street #5021, San Francisco, CA 94114, États-Unis</p>
              <p><strong className="text-white">Site web :</strong> <a href="https://render.com" className="text-green-400 hover:underline">render.com</a></p>
              <br />
              <p><strong className="text-white">Base de données :</strong> Supabase (PostgreSQL)</p>
              <p><strong className="text-white">Opérateur :</strong> Supabase Inc.</p>
              <p><strong className="text-white">Site web :</strong> <a href="https://supabase.com" className="text-green-400 hover:underline">supabase.com</a></p>
            </div>
          </motion.div>

          {/* Propriété intellectuelle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Propriété Intellectuelle</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
              <p>
                Les marques et logos figurant sur le site sont des marques déposées par leurs propriétaires respectifs. 
                Leur reproduction ou représentation, totale ou partielle, sans autorisation préalable, est interdite.
              </p>
            </div>
          </motion.div>

          {/* Responsabilité */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Responsabilité</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
                mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
              </p>
              <p>
                Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler 
                par email à l'adresse <a href="mailto:contact@mister-api.com" className="text-green-400 hover:underline">contact@mister-api.com</a>.
              </p>
              <p>
                Tout contenu téléchargé se fait aux risques et périls de l'utilisateur et sous sa seule responsabilité. 
                En conséquence, Mister API ne saurait être tenu responsable d'un quelconque dommage subi par l'ordinateur de l'utilisateur 
                ou d'une quelconque perte de données consécutives au téléchargement.
              </p>
            </div>
          </motion.div>

          {/* Liens hypertextes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Liens Hypertextes</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Les liens hypertextes mis en place dans le cadre du présent site web en direction d'autres ressources présentes sur le réseau Internet 
                ne sauraient engager la responsabilité de Mister API.
              </p>
              <p>
                Les utilisateurs et visiteurs du site web ne peuvent pas mettre en place un hyperlien en direction de ce site sans autorisation expresse et préalable de Mister API.
              </p>
            </div>
          </motion.div>

          {/* Cookies */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Cookies</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Le site peut-être amené à vous demander l'acceptation des cookies pour des besoins de statistiques et d'affichage. 
                Un cookie ne nous permet pas de vous identifier ; il sert uniquement à enregistrer des informations relatives à la navigation de votre ordinateur sur notre site.
              </p>
              <p>
                Vous pouvez librement accepter ou refuser les cookies en modifiant les paramètres de votre navigateur. 
                Pour en savoir plus, consultez notre <Link href="/politique-confidentialite" className="text-green-400 hover:underline">Politique de Confidentialité</Link>.
              </p>
            </div>
          </motion.div>

          {/* Droit applicable */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Droit Applicable</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Tout litige en relation avec l'utilisation du site Mister API est soumis au droit français. 
                Hormis les cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents de Saint-Denis, La Réunion.
              </p>
              <p>
                Les présentes mentions légales sont soumises au droit français. 
                En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de droit en vigueur.
              </p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Contact</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-green-400" />
                <a href="mailto:contact@mister-api.com" className="text-green-400 hover:underline">
                  contact@mister-api.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-green-400" />
                <a href="tel:+33670963371" className="text-green-400 hover:underline">
                  +33 6 70 96 33 71
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-green-400" />
                <span>37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France</span>
              </div>
            </div>
          </motion.div>

          {/* Dernière mise à jour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Dernière Mise à Jour</h2>
            </div>
            <div className="text-gray-300">
              <p>
                <strong className="text-white">Date de dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="mt-2">
                Ces mentions légales peuvent être modifiées à tout moment sans préavis. 
                Nous vous invitons à les consulter régulièrement.
              </p>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex justify-center space-x-4 pt-8"
          >
            <Link
              href="/politique-confidentialite"
              className="flex items-center space-x-2 bg-green-400 text-black px-6 py-3 rounded-lg hover:bg-green-500 transition-colors font-semibold"
            >
              <Shield className="h-4 w-4" />
              <span>Politique de Confidentialité</span>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 