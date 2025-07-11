'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail, Phone, Calendar, FileText, Globe, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PolitiqueConfidentialitePage() {
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
              <Shield className="h-6 w-6 text-green-400" />
              <h1 className="text-xl font-bold text-white">Politique de Confidentialité</h1>
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
              <h2 className="text-2xl font-bold text-white">Protection de vos Données</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Mister API s'engage à protéger votre vie privée et vos données personnelles. 
              Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations 
              conformément au Règlement Général sur la Protection des Données (RGPD) et à la législation française.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Responsable du traitement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Responsable du Traitement</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-white">Identité :</strong> Mister API</p>
              <p><strong className="text-white">Adresse :</strong> 37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France</p>
              <p><strong className="text-white">Email :</strong> <a href="mailto:contact@mister-api.com" className="text-green-400 hover:underline">contact@mister-api.com</a></p>
              <p><strong className="text-white">Téléphone :</strong> <a href="tel:+33670963371" className="text-green-400 hover:underline">+33 6 70 96 33 71</a></p>
              <p><strong className="text-white">Représentant légal :</strong> Léo SEGALINI-BRIANT</p>
            </div>
          </motion.div>

          {/* Données collectées */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Données Collectées</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Données d'identification</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Date de naissance</li>
                  <li>Adresse postale complète</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Données de connexion</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Données de navigation</li>
                  <li>Cookies et technologies similaires</li>
                  <li>Historique des connexions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Données d'utilisation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Utilisation des APIs</li>
                  <li>Statistiques d'usage</li>
                  <li>Préférences utilisateur</li>
                  <li>Données de paiement (via Stripe)</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Finalités du traitement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Finalités du Traitement</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Gestion de votre compte</h3>
                <p>Création et gestion de votre compte utilisateur, authentification, support client.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Fourniture des services</h3>
                <p>Accès aux APIs, génération de clés API, suivi de l'utilisation, facturation.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Communication</h3>
                <p>Envoi d'emails de confirmation, newsletters, notifications importantes.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Amélioration des services</h3>
                <p>Analyse statistique, optimisation des performances, développement de nouvelles fonctionnalités.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Obligations légales</h3>
                <p>Respect des obligations fiscales, comptables et réglementaires.</p>
              </div>
            </div>
          </motion.div>

          {/* Base légale */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Base Légale du Traitement</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Exécution du contrat</h3>
                <p>Le traitement est nécessaire à l'exécution du contrat de services que vous avez accepté.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Obligation légale</h3>
                <p>Le traitement est nécessaire au respect d'une obligation légale à laquelle nous sommes soumis.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Intérêt légitime</h3>
                <p>Le traitement est nécessaire à la poursuite de nos intérêts légitimes (sécurité, amélioration des services).</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Consentement</h3>
                <p>Pour certaines finalités (newsletter, cookies analytiques), nous nous appuyons sur votre consentement.</p>
              </div>
            </div>
          </motion.div>

          {/* Destinataires */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Destinataires des Données</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Personnel autorisé</h3>
                <p>Notre équipe technique et support client, dans la limite de leurs attributions.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Prestataires techniques</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Supabase</strong> : Hébergement et gestion de la base de données</li>
                  <li><strong>Vercel</strong> : Hébergement du frontend</li>
                  <li><strong>Render</strong> : Hébergement du backend</li>
                  <li><strong>Stripe</strong> : Traitement des paiements</li>
                  <li><strong>Brevo</strong> : Envoi d'emails</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Autorités</h3>
                <p>En cas d'obligation légale ou de demande judiciaire, nous pouvons être amenés à communiquer vos données aux autorités compétentes.</p>
              </div>
            </div>
          </motion.div>

          {/* Durée de conservation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Durée de Conservation</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Données de compte</h3>
                <p><strong>Durée :</strong> Pendant la durée de vie du compte + 3 ans après suppression</p>
                <p><strong>Raison :</strong> Obligations légales et comptables</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Données de connexion</h3>
                <p><strong>Durée :</strong> 12 mois</p>
                <p><strong>Raison :</strong> Sécurité et support technique</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Données de paiement</h3>
                <p><strong>Durée :</strong> 10 ans</p>
                <p><strong>Raison :</strong> Obligations comptables et fiscales</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookies</h3>
                <p><strong>Durée :</strong> 13 mois maximum</p>
                <p><strong>Raison :</strong> Conformité RGPD</p>
              </div>
            </div>
          </motion.div>

          {/* Vos droits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Vos Droits</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Droit d'accès</h3>
                <p>Vous pouvez accéder à vos données personnelles et obtenir une copie.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Droit de rectification</h3>
                <p>Vous pouvez corriger ou compléter vos données personnelles inexactes ou incomplètes.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Droit à l'effacement</h3>
                <p>Vous pouvez demander la suppression de vos données dans certaines conditions.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Droit à la limitation</h3>
                <p>Vous pouvez demander la limitation du traitement de vos données.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Droit à la portabilité</h3>
                <p>Vous pouvez recevoir vos données dans un format structuré et les transmettre à un autre responsable.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Droit d'opposition</h3>
                <p>Vous pouvez vous opposer au traitement de vos données pour des finalités de prospection.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Retrait du consentement</h3>
                <p>Vous pouvez retirer votre consentement à tout moment pour les traitements qui s'y fondent.</p>
              </div>
            </div>
          </motion.div>

          {/* Exercice des droits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Exercice de vos Droits</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Pour exercer vos droits, vous pouvez nous contacter :
              </p>
              <div className="space-y-2">
                <p><strong className="text-white">Par email :</strong> <a href="mailto:contact@mister-api.com" className="text-green-400 hover:underline">contact@mister-api.com</a></p>
                <p><strong className="text-white">Par téléphone :</strong> <a href="tel:+33670963371" className="text-green-400 hover:underline">+33 6 70 96 33 71</a></p>
                <p><strong className="text-white">Par courrier :</strong> 37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France</p>
              </div>
              <p className="mt-4">
                <strong className="text-white">Délai de réponse :</strong> Nous nous engageons à répondre dans un délai maximum de 30 jours.
              </p>
              <p>
                <strong className="text-white">Justificatif d'identité :</strong> Pour des raisons de sécurité, nous pourrons vous demander un justificatif d'identité.
              </p>
            </div>
          </motion.div>

          {/* Cookies */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Cookies et Technologies Similaires</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookies techniques</h3>
                <p>Nécessaires au fonctionnement du site (authentification, session, sécurité).</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookies analytiques</h3>
                <p>Mesure de l'audience et analyse du comportement des utilisateurs (Google Analytics).</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookies de préférences</h3>
                <p>Sauvegarde de vos préférences et paramètres personnalisés.</p>
              </div>
              <p className="mt-4">
                Vous pouvez configurer votre navigateur pour refuser les cookies ou être informé quand un cookie est déposé. 
                Cependant, certaines fonctionnalités du site pourraient ne plus être disponibles.
              </p>
            </div>
          </motion.div>

          {/* Sécurité */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Sécurité des Données</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                <li>Chiffrement des données au repos</li>
                <li>Authentification sécurisée</li>
                <li>Accès restreint aux données</li>
                <li>Surveillance et détection d'intrusion</li>
                <li>Sauvegardes sécurisées</li>
                <li>Formation du personnel à la sécurité</li>
              </ul>
            </div>
          </motion.div>

          {/* Transferts hors UE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Transferts Hors Union Européenne</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Certains de nos prestataires sont situés hors de l'Union Européenne. Ces transferts sont encadrés par :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Des décisions d'adéquation de la Commission européenne</li>
                <li>Des garanties contractuelles appropriées</li>
                <li>Des clauses contractuelles types</li>
              </ul>
              <p className="mt-4">
                Vous pouvez nous contacter pour obtenir plus d'informations sur ces transferts et les garanties mises en place.
              </p>
            </div>
          </motion.div>

          {/* Contact DPO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Contact et Réclamations</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Pour toute question relative à cette politique de confidentialité ou au traitement de vos données :
              </p>
              <div className="space-y-2">
                <p><strong className="text-white">Email :</strong> <a href="mailto:contact@mister-api.com" className="text-green-400 hover:underline">contact@mister-api.com</a></p>
                <p><strong className="text-white">Téléphone :</strong> <a href="tel:+33670963371" className="text-green-400 hover:underline">+33 6 70 96 33 71</a></p>
              </div>
              <p className="mt-4">
                <strong className="text-white">Réclamation à la CNIL :</strong> Si vous estimez que vos droits ne sont pas respectés, 
                vous pouvez déposer une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL).
              </p>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex justify-center space-x-4 pt-8"
          >
            <Link
              href="/mentions-legales"
              className="flex items-center space-x-2 bg-blue-400 text-black px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold"
            >
              <FileText className="h-4 w-4" />
              <span>Mentions Légales</span>
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