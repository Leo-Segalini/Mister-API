'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, ArrowLeft, Clock, AlertCircle } from 'lucide-react';

export default function RegisterSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // Récupérer l'email depuis les paramètres d'URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Compte à rebours pour redirection automatique
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage({ type: 'error', message: 'Email non disponible' });
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage({ type: 'success', message: 'Email de confirmation renvoyé avec succès !' });
      } else {
        setResendMessage({ type: 'error', message: data.error || 'Erreur lors de l\'envoi de l\'email de confirmation' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      setResendMessage({ type: 'error', message: 'Erreur lors de l\'envoi de l\'email de confirmation' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>

          {/* Icône de succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 border-2 border-green-400 mb-6"
          >
            <CheckCircle className="h-8 w-8 text-green-400" />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Inscription réussie !
          </h1>

          <p className="text-gray-300 text-lg mb-6">
            Votre compte a été créé avec succès sur Mister API
          </p>
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-yellow-200">
                  <strong>Important :</strong> Vous n'êtes pas encore connecté. Vous devez d'abord confirmer votre email pour pouvoir vous connecter.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 space-y-6"
        >
          {/* Section Email de confirmation */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  Email de confirmation envoyé
                </h3>
                <p className="text-blue-200 text-sm mb-3">
                  Un email de confirmation a été envoyé à :
                </p>
                <p className="text-blue-100 font-medium text-sm bg-blue-900/30 p-2 rounded border border-blue-500/20">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Prochaines étapes :
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  1
                </div>
                <p className="text-gray-300 text-sm">
                  Vérifiez votre boîte de réception (et vos spams)
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  2
                </div>
                <p className="text-gray-300 text-sm">
                  Cliquez sur le lien de confirmation dans l'email
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  3
                </div>
                <p className="text-gray-300 text-sm">
                  Connectez-vous à votre compte
                </p>
              </div>
            </div>
          </div>

          {/* Message de statut du renvoi */}
          {resendMessage && (
            <div className={`p-3 rounded-lg border ${
              resendMessage.type === 'success' 
                ? 'bg-green-900/20 border-green-500/30 text-green-300' 
                : 'bg-red-900/20 border-red-500/30 text-red-300'
            }`}>
              <p className="text-sm">{resendMessage.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4 pt-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Renvoyer l'email de confirmation</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-green-400 to-blue-400 text-black font-medium rounded-lg hover:from-green-300 hover:to-blue-300 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Aller à la page de connexion</span>
            </Link>
          </div>

          {/* Compte à rebours */}
          <div className="text-center pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>Redirection automatique vers la connexion dans {countdown} secondes</span>
            </div>
          </div>
        </motion.div>

        {/* Section d'aide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-300 mb-1">
                Besoin d'aide ?
              </h4>
              <p className="text-xs text-yellow-200">
                Si vous ne recevez pas l'email de confirmation, vérifiez vos spams ou contactez notre support.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 