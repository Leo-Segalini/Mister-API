<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS" />
  <h1>🚀 Mister API - Plateforme Complète</h1>
  <p><strong>API RESTful + Interface Web pour la gestion de citations, animaux, pays et paiements</strong></p>
</div>

<div align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/NestJS-11.0.1-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  </a>
  <a href="https://nextjs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  </a>
  <a href="https://supabase.com/" target="_blank">
    <img src="https://img.shields.io/badge/Supabase-2.50.3-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  </a>
  <a href="https://stripe.com/" target="_blank">
    <img src="https://img.shields.io/badge/Stripe-18.3.0-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe"/>
  </a>
  <a href="https://www.postgresql.org/" target="_blank">
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  </a>
  <a href="https://redis.io/" target="_blank">
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  </a>
</div>

---

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation Rapide](#-installation-rapide)
- [⚙️ Configuration Détaillée](#️-configuration-détaillée)
- [🔧 Développement](#-développement)
- [📊 Fonctionnalités](#-fonctionnalités)
- [🔒 Sécurité](#-sécurité)
- [🧪 Tests](#-tests)
- [🚀 Déploiement](#-déploiement)
- [📚 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)

---

## 🎯 Vue d'ensemble

**Mister API** est une plateforme complète comprenant :

- **Backend API** : API RESTful sécurisée avec NestJS
- **Frontend Web** : Interface moderne avec Next.js
- **Système de paiement** : Intégration Stripe complète
- **Authentification** : Supabase avec JWT
- **Base de données** : PostgreSQL avec cache Redis
- **Monitoring** : Logs structurés et métriques

### APIs Disponibles
- 📝 **Citations historiques** - Collection de citations
- 🐾 **Animaux** - Base de données d'animaux
- 🌍 **Pays du monde** - Informations géographiques
- 📊 **Statistiques** - Métriques d'utilisation
- 🔑 **Gestion des clés API** - Système de quotas

---

## 🏗️ Architecture

```
Mister API/
├── backend-mister-api/          # API Backend (NestJS)
│   ├── src/
│   │   ├── controllers/         # Contrôleurs REST
│   │   ├── services/           # Logique métier
│   │   ├── entities/           # Modèles de données
│   │   ├── guards/             # Guards d'authentification
│   │   └── middleware/         # Middleware personnalisés
│   ├── sql/                    # Scripts SQL
│   └── test/                   # Tests E2E
│
└── mister-api/                 # Frontend Web (Next.js)
    ├── app/                    # App Router Next.js
    ├── components/             # Composants React
    ├── hooks/                  # Hooks personnalisés
    └── lib/                    # Utilitaires
```

### Stack Technologique

| Composant | Backend | Frontend |
|-----------|---------|----------|
| **Framework** | NestJS 11 | Next.js 15 |
| **Language** | TypeScript 5.7 | TypeScript 5.0 |
| **Base de données** | PostgreSQL + TypeORM | - |
| **Cache** | Redis | - |
| **Authentification** | Supabase + JWT | Supabase Client |
| **Paiements** | Stripe Server | Stripe React |
| **Styling** | - | Tailwind CSS 4 |
| **Animations** | - | Framer Motion |
| **Formulaires** | class-validator | React Hook Form |

---

## 🚀 Installation Rapide

### Prérequis
- **Node.js** 18+ 
- **PostgreSQL** 14+
- **Redis** 6+
- **Git**

### 1. Cloner le projet
```bash
git clone <repository-url>
cd "Mister-API"
```

### 2. Configuration Backend
```bash
cd backend-mister-api

# Installer les dépendances
npm install

# Copier la configuration
cp env.example .env

# Configurer les variables d'environnement
# (voir section Configuration Détaillée)

# Lancer en développement
npm run start:dev
```

### 3. Configuration Frontend
```bash
cd ../mister-api

# Installer les dépendances
npm install

# Copier la configuration
cp .env.example .env.local

# Configurer les variables d'environnement
# (voir section Configuration Détaillée)

# Lancer en développement
npm run dev
```

### 4. Accès aux applications
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **Documentation API** : http://localhost:3001/api-docs (dev uniquement)

---

## ⚙️ Configuration Détaillée

### Configuration Backend (.env)

```env
# ========================================
# Supabase Configuration
# ========================================
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ========================================
# Database Configuration
# ========================================
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# ========================================
# Redis Cache Configuration
# ========================================
REDIS_URL=redis://localhost:6379

# ========================================
# API Configuration
# ========================================
API_PORT=3001
API_PREFIX=api/v1
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ========================================
# Rate Limiting Configuration
# ========================================
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# ========================================
# Stripe Configuration
# ========================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
STRIPE_PREMIUM_PRICE_ID=price_1OqX9w2dgIFG

# ========================================
# Quota Configuration
# ========================================
FREE_QUOTA_DAILY=50
PREMIUM_QUOTA_DAILY=999999
```

### Configuration Frontend (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Services Externes Requis

#### 1. Supabase
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer les clés d'API dans Settings > API
3. Configurer l'authentification dans Authentication > Settings

#### 2. Stripe
1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer les clés d'API dans Developers > API keys
3. Créer un produit et un prix pour l'abonnement premium
4. Configurer les webhooks dans Developers > Webhooks

#### 3. PostgreSQL
- **Option 1** : Utiliser Supabase (recommandé)
- **Option 2** : Installation locale
- **Option 3** : Service cloud (Railway, PlanetScale, etc.)

#### 4. Redis
- **Option 1** : Installation locale
- **Option 2** : Redis Cloud
- **Option 3** : Upstash Redis

---

## 🔧 Développement

### Scripts Backend

```bash
cd backend-mister-api

# Développement
npm run start:dev      # Serveur de développement avec hot reload
npm run start:debug    # Mode debug avec inspecteur

# Production
npm run build          # Build de production
npm run start:prod     # Serveur de production

# Tests
npm run test           # Tests unitaires
npm run test:watch     # Tests en mode watch
npm run test:cov       # Tests avec couverture
npm run test:e2e       # Tests end-to-end

# Qualité du code
npm run lint           # Vérification ESLint
npm run format         # Formatage avec Prettier
```

### Scripts Frontend

```bash
cd mister-api

# Développement
npm run dev            # Lance le serveur de développement

# Production
npm run build          # Build de production
npm run start          # Lance le serveur de production

# Qualité du code
npm run lint           # Vérification ESLint
```

### Structure des Endpoints

#### Authentification
```
POST   /auth/login          # Connexion utilisateur
POST   /auth/register       # Inscription utilisateur
POST   /auth/refresh        # Refresh token
POST   /auth/logout         # Déconnexion
```

#### APIs Publiques
```
GET    /punchlines          # Liste des citations
GET    /punchlines/:id      # Citation par ID
GET    /animals             # Liste des animaux
GET    /pays-du-monde       # Liste des pays
```

#### Gestion des Clés API
```
GET    /api-keys            # Mes clés API
POST   /api-keys            # Créer une clé API
DELETE /api-keys/:id        # Supprimer une clé API
GET    /api-keys/:id/stats  # Statistiques d'utilisation
```

#### Paiements
```
POST   /payments/create-checkout-session  # Créer session Stripe
POST   /payments/webhook                  # Webhook Stripe
GET    /payments/history                  # Historique des paiements
```

#### Administration
```
GET    /admin/users         # Liste des utilisateurs (admin)
PUT    /admin/users/:id     # Modifier un utilisateur (admin)
GET    /admin/stats         # Statistiques globales (admin)
```

---

## 📊 Fonctionnalités

### 🔐 Authentification & Sécurité
- **Authentification Supabase** avec JWT et gestion des rôles
- **Guards personnalisés** pour la protection des endpoints
- **Rate limiting** et protection contre les attaques
- **Validation des données** avec class-validator
- **Logs structurés** avec Winston

### 📊 Gestion des Données
- **CRUD complet** pour citations, animaux, pays
- **Gestion des utilisateurs** avec profils premium
- **Clés API** avec quotas et monitoring
- **Statistiques d'utilisation** en temps réel
- **Cache Redis** pour les performances

### 💳 Système de Paiement
- **Intégration Stripe** complète
- **Gestion des abonnements** premium
- **Webhooks sécurisés** pour les événements
- **Historique des transactions**
- **Facturation automatique**

### 🛠️ Interface Utilisateur
- **Design moderne** avec Tailwind CSS et animations fluides
- **Responsive design** optimisé pour tous les appareils
- **Dashboard** pour gérer les clés API
- **Documentation interactive** des APIs
- **Système de notifications** avec toasts

---

## 🔒 Sécurité

### Authentification
- **JWT tokens** avec expiration
- **Refresh tokens** automatiques
- **Rôles utilisateur** (user, admin)
- **Guards** sur tous les endpoints sensibles

### Protection des Données
- **Row Level Security (RLS)** sur Supabase
- **Validation des entrées** stricte
- **Sanitisation** des données
- **Rate limiting** par IP et par utilisateur

### API Keys
- **Génération sécurisée** avec UUID
- **Quotas** par type d'abonnement
- **Monitoring** en temps réel
- **Rotation automatique** possible

---

## 🧪 Tests

### Tests Backend

```bash
cd backend-mister-api

# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Tests Frontend

```bash
cd mister-api

# Tests unitaires (à implémenter)
npm run test

# Tests E2E (à implémenter)
npm run test:e2e
```

### Exemple de Test Backend

```typescript
describe('PunchlineController', () => {
  it('should return punchlines', async () => {
    const response = await request(app.getHttpServer())
      .get('/punchlines')
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

---

## 🚀 Déploiement

### Déploiement Backend

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

#### Plateformes Supportées
- **Railway** : Déploiement simple
- **Heroku** : Compatible
- **DigitalOcean** : App Platform
- **AWS** : ECS, Lambda
- **Google Cloud** : Cloud Run

### Déploiement Frontend

#### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

#### Autres plateformes
- **Netlify** : Compatible avec Next.js
- **Railway** : Déploiement simple
- **Docker** : Containerisation possible

### Variables d'Environnement Production

```env
# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_live_...

# Frontend
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 📚 Documentation

### Documentation API
- **Swagger UI** : http://localhost:3001/api-docs (développement)
- **OpenAPI Spec** : http://localhost:3001/api-json

### Guides Détaillés
- [Guide de Configuration des Paiements](backend-mister-api/PAYMENT_BACKEND_GUIDE.md)
- [Configuration Stripe](backend-mister-api/STRIPE_PRICE_SETUP.md)
- [Configuration des Webhooks](backend-mister-api/STRIPE_WEBHOOK_SETUP.md)
- [Tests du Système de Paiement](backend-mister-api/TEST_PAYMENT_SYSTEM.md)

### Base de Données
- **Scripts SQL** : `backend-mister-api/sql/`
- **Entités** : `backend-mister-api/src/entities/`
- **Migrations** : À implémenter avec TypeORM

---

## 🤝 Contribution

### Workflow de Développement
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Développer** avec tests
4. **Linter** et formater le code
5. **Créer** une Pull Request

### Standards de Code
- **TypeScript strict** mode
- **ESLint** configuration
- **Prettier** formatting
- **Conventional commits**
- **Tests obligatoires**

### Structure des Commits
```
feat: ajouter nouvelle fonctionnalité
fix: corriger un bug
docs: mise à jour documentation
style: formatage du code
refactor: refactorisation
test: ajouter tests
chore: tâches de maintenance
```

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 📞 Support & Contact

- **Documentation API** : `/api-docs` (développement uniquement)
- **Issues** : GitHub Issues
- **Email** : contact@example.com
- **Discord** : Serveur communautaire

---

<div align="center">
  <p>Construit avec ❤️, NestJS et Next.js</p>
  <img src="https://nestjs.com/img/logo_text.svg" width="200" alt="NestJS" />
  <img src="https://nextjs.org/static/blog/next-15/next-15.png" width="60" alt="Next.js" />
</div> 