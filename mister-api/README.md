<div align="center">
  <img src="https://nextjs.org/static/blog/next-15/next-15.png" width="120" alt="Next.js" />
  <h1>🎯 Punchiline Frontend</h1>
  <p><strong>Interface moderne et intuitive pour l'API Punchiline</strong></p>
</div>

<div align="center">
  <a href="https://nextjs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  </a>
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  </a>
  <a href="https://tailwindcss.com/" target="_blank">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  </a>
  <a href="https://stripe.com/" target="_blank">
    <img src="https://img.shields.io/badge/Stripe-7.3.1-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe"/>
  </a>
  <a href="https://framer.com/motion" target="_blank">
    <img src="https://img.shields.io/badge/Framer_Motion-12.18.1-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
  </a>
</div>

---

## 🚀 Fonctionnalités

### ✨ Interface Utilisateur
- **Design moderne** avec Tailwind CSS et animations fluides
- **Responsive design** optimisé pour tous les appareils
- **Thème sombre/clair** avec transitions élégantes
- **Composants réutilisables** et modulaires

### 🔐 Authentification
- **Intégration Supabase** pour l'authentification sécurisée
- **Gestion des sessions** avec refresh token automatique
- **Protection des routes** avec guards personnalisés
- **Gestion des erreurs** robuste

### 💳 Paiements
- **Intégration Stripe** complète
- **Checkout sécurisé** pour les abonnements
- **Gestion des webhooks** en temps réel
- **Historique des transactions**

### 📊 Dashboard
- **Gestion des clés API** (création, suppression, monitoring)
- **Statistiques d'utilisation** en temps réel
- **Interface d'administration** intuitive
- **Notifications toast** pour le feedback utilisateur

---

## 🛠️ Technologies

| Catégorie | Technologies |
|-----------|--------------|
| **Framework** | Next.js 15, React 19 |
| **Styling** | Tailwind CSS 4, Headless UI |
| **Animations** | Framer Motion |
| **Formulaires** | React Hook Form, Yup |
| **Paiements** | Stripe React, Stripe.js |
| **HTTP Client** | Axios |
| **Icons** | Heroicons, Lucide React |
| **Utilitaires** | clsx, tailwind-merge |

---

## 📦 Installation

```bash
# Cloner le repository
git clone <repository-url>
cd mister-api

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
# Voir la section Configuration ci-dessous

# Lancer en développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir l'application.

---

## ⚙️ Configuration

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

## 🏗️ Structure du Projet

```
mister-api/
├── app/                    # App Router Next.js 13+
│   ├── dashboard/         # Page dashboard utilisateur
│   ├── login/            # Page de connexion
│   ├── register/         # Page d'inscription
│   ├── pricing/          # Page des tarifs
│   ├── apis/             # Documentation API
│   ├── stats/            # Statistiques
│   └── layout.tsx        # Layout principal
├── components/           # Composants réutilisables
│   ├── AuthGuard.tsx     # Guard d'authentification
│   ├── LoadingSpinner.tsx # Composant de chargement
│   ├── Toast.tsx         # Notifications
│   └── layout/           # Composants de layout
├── hooks/                # Hooks personnalisés
│   └── useAuth.tsx       # Hook d'authentification
├── lib/                  # Utilitaires et configuration
│   ├── api.ts           # Client API
│   ├── config.ts        # Configuration
│   └── utils.ts         # Fonctions utilitaires
└── types/               # Types TypeScript
```

---

## 🎨 Design System

### Palette de Couleurs
- **Primaire** : `#10B981` (Vert)
- **Secondaire** : `#3B82F6` (Bleu)
- **Accent** : `#F59E0B` (Orange)
- **Neutre** : `#1F2937` (Gris foncé)
- **Fond** : `#111827` (Noir)

### Composants Principaux
- **LoadingSpinner** : Animations de chargement personnalisées
- **Toast** : Système de notifications
- **AuthGuard** : Protection des routes
- **Header/Footer** : Navigation cohérente

---

## 🚀 Scripts Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Production
npm run build        # Build de production
npm run start        # Lance le serveur de production

# Qualité du code
npm run lint         # Vérification ESLint
```

---

## 🔧 Développement

### Ajouter un nouveau composant

```tsx
// components/MyComponent.tsx
import { cn } from '@/lib/utils'

interface MyComponentProps {
  className?: string
  children: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  )
}
```

### Utiliser le hook d'authentification

```tsx
import { useAuth } from '@/hooks/useAuth'

export function MyPage() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  return (
    <div>
      <h1>Bienvenue {user?.email}</h1>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  )
}
```

---

## 🧪 Tests

```bash
# Tests unitaires (à implémenter)
npm run test

# Tests E2E (à implémenter)
npm run test:e2e
```

---

## 📱 Responsive Design

L'application est optimisée pour :
- **Mobile** : 320px - 768px
- **Tablet** : 768px - 1024px
- **Desktop** : 1024px+

---

## 🔒 Sécurité

- **Authentification Supabase** avec JWT
- **Protection CSRF** intégrée
- **Validation des formulaires** côté client et serveur
- **HTTPS obligatoire** en production
- **Headers de sécurité** configurés

---

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Autres plateformes
- **Netlify** : Compatible avec Next.js
- **Railway** : Déploiement simple
- **Docker** : Containerisation possible

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 📞 Support

- **Documentation** : Consultez les fichiers de documentation
- **Issues** : Ouvrez une issue sur GitHub
- **Email** : contact@example.com

---

<div align="center">
  <p>Construit avec ❤️ et Next.js</p>
  <img src="https://nextjs.org/static/blog/next-15/next-15.png" width="60" alt="Next.js" />
</div>
