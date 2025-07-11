'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Settings, 
  BarChart3,
  Crown,
  Menu,
  X,
  Home,
  Zap,
  BookOpen,
  CreditCard,
  ChevronDown,
  LogIn,
  UserPlus
} from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const { user, signout, isAdmin } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const handleSignout = async () => {
    try {
      await signout();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Navigation pour utilisateurs non connectés
  const publicNavItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/apis', label: 'APIs', icon: Zap },
    { href: '/pricing', label: 'Prix', icon: CreditCard },
    { href: '/docs', label: 'Docs', icon: BookOpen }
  ];

  // Navigation pour utilisateurs connectés (supprimée car déplacée dans le menu utilisateur)
  // const privateNavItems = [
  //   { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  //   { href: '/stats', label: 'Stats', icon: BarChart3 },
  //   { href: '/profile', label: 'Profil', icon: User }
  // ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-br from-gray-900 to-gray-800 border-b-2 border-green-400 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {/* Logo avec animation */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <Image 
                    src="/logo.png" 
                    alt="Mister API Logo" 
                    width={100} 
                    height={100}
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
                Mister API
                </span>
              </Link>
            </motion.div>
            </div>
          
          {/* Navigation centrée */}
          <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {/* Navigation publique */}
            {publicNavItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-green-400 hover:bg-gray-800/50 rounded-lg transition-all duration-200 group text-base"
                >
                  <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium text-lg">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
            
          {/* Menu utilisateur */}
              <div className="flex items-center space-x-4">
            {/* Statut utilisateur avec animations */}
            <div className="hidden md:flex items-center space-x-2">
              {user?.is_premium && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-400 border border-yellow-400">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </span>
                </motion.div>
              )}
              {isAdmin && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-400 border border-purple-400">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                </motion.div>
              )}
            </div>

            {/* Menu utilisateur desktop */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                {/* Avatar et nom utilisateur */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-black" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {user?.prenom && user?.nom 
                          ? `${user.prenom} ${user.nom}`
                          : user?.prenom 
                          ? user.prenom
                          : user?.nom 
                          ? user.nom
                          : user?.email?.split('@')[0] || 'Utilisateur'
                        }
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Menu déroulant utilisateur */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-gray-800 border border-green-400 rounded-lg shadow-xl z-50"
                      >
                        <div className="p-4 border-b border-green-400">
                          <p className="text-sm font-medium text-white">Menu utilisateur</p>
                        </div>
                        <div className="p-2">
                          {[
                            { href: '/dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-400' },
                            // { href: '/stats', label: 'Statistiques', icon: BarChart3, color: 'text-green-400' }, // Temporairement masqué
                            { href: '/profile', label: 'Profil', icon: User, color: 'text-purple-400' },
                            { href: '/settings', label: 'Paramètres', icon: Settings, color: 'text-gray-400' }
                          ].map((item) => (
                            <button
                              key={item.href}
                              onClick={() => {
                                router.push(item.href);
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                              <item.icon className={`h-5 w-5 ${item.color}`} />
                              <span className="text-gray-300 text-base font-medium">{item.label}</span>
                            </button>
                          ))}
                          <div className="border-t border-gray-700 mt-2 pt-2">
                            <button
                              onClick={() => {
                                handleSignout();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            >
                              <LogOut className="h-5 w-5 text-red-400" />
                              <span className="text-red-400 text-base font-medium">Déconnexion</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-10 h-10 text-gray-300 hover:text-green-400 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                    title="Connexion"
                  >
                    <LogIn className="h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                <Link
                    href="/register"
                    className="flex items-center justify-center w-10 h-10 bg-green-400 hover:bg-green-500 text-black rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Inscription"
                >
                    <UserPlus className="h-5 w-5" />
                </Link>
              </motion.div>
              </div>
            )}

            {/* Bouton menu mobile avec animation */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Menu mobile avec animations */}
        <AnimatePresence>
          {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-green-400 overflow-hidden"
            >
              <nav className="flex flex-col space-y-2">
                {/* Navigation publique */}
                {publicNavItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                <Link
                  href={item.href}
                      className="flex items-center space-x-3 text-gray-300 hover:text-green-400 px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium text-lg">{item.label}</span>
                </Link>
                  </motion.div>
                ))}
                
                {user ? (
                  <>
                    <div className="border-t border-green-400 pt-4 mt-4">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Espace utilisateur
                      </div>
                      
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {user?.prenom && user?.nom 
                              ? `${user.prenom} ${user.nom}`
                              : user?.prenom 
                              ? user.prenom
                              : user?.nom 
                              ? user.nom
                              : user?.email?.split('@')[0] || 'Utilisateur'
                            }
                          </p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 px-4">
                        <button
                          onClick={() => {
                            router.push('/settings');
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 p-3 text-gray-400 hover:text-green-400 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="text-sm">Paramètres</span>
                        </button>
                  <button
                          onClick={() => {
                            handleSignout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                          <span className="text-sm">Déconnexion</span>
                  </button>
                      </div>
                    </div>
                </>
              ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="border-t border-green-400 pt-4 mt-4 space-y-3"
                  >
                <Link
                  href="/login"
                      className="flex items-center justify-center space-x-2 text-gray-300 hover:text-green-400 px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Connexion</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center space-x-2 bg-green-400 hover:bg-green-500 text-black px-4 py-3 rounded-lg transition-all duration-200 font-medium shadow-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Inscription</span>
                </Link>
                  </motion.div>
              )}
              </nav>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </header>
  );
}