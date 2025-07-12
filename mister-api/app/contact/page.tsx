'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';

export default function Contact() {
  const { showSuccess, showError } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler l'envoi du message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess('Message envoyé !', 'Nous vous répondrons dans les plus brefs délais.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      showError('Erreur', 'Impossible d\'envoyer le message. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <section className="py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Contact</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Besoin d'aide ? Notre équipe est là pour vous accompagner. 
                N'hésitez pas à nous contacter pour toute question.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-gray-400">leo.segalini@outlook.com</p>
                  <p className="text-sm text-gray-500">Réponse sous 24h</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MessageSquare className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Support technique</h3>
                  <p className="text-gray-400">leo.segalini@outlook.com</p>
                  <p className="text-sm text-gray-500">Pour les problèmes techniques</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Téléphone</h3>
                  <p className="text-gray-400">+33 6 70 96 33 71</p>
                  <p className="text-sm text-gray-500">Lun-Ven, 9h-18h</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Adresse</h3>
                  <p className="text-gray-400">37 BIS RUE DES CAMOMILLES</p>
                  <p className="text-gray-400">97436 SAINT LEU, France</p>
                </div>
              </div>
            </div>

            {/* FAQ rapide */}
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">Questions fréquentes</h3>
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold mb-2">Comment créer ma première clé API ?</h4>
                  <p className="text-gray-400 text-sm">
                    Connectez-vous à votre dashboard et cliquez sur "Nouvelle clé API" 
                    pour générer votre première clé.
                  </p>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold mb-2">Quels sont les limites du plan gratuit ?</h4>
                  <p className="text-gray-400 text-sm">
                    Le plan FREE vous donne accès à 50 appels par jour pour chaque API.
                  </p>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold mb-2">Comment passer au plan PREMIUM ?</h4>
                  <p className="text-gray-400 text-sm">
                    Rendez-vous sur la page des tarifs et choisissez le plan PREMIUM 
                    pour un accès illimité.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire de contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  disabled={isLoading}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 disabled:opacity-50"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 disabled:opacity-50"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  disabled={isLoading}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 disabled:opacity-50"
                  placeholder="Sujet de votre message"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  disabled={isLoading}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 disabled:opacity-50 resize-none"
                  placeholder="Décrivez votre question ou problème..."
                />
              </div>

              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  'Envoyer le message'
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 