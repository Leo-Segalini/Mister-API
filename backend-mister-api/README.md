<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS" />
  <h1>🚀 Punchiline API Backend</h1>
  <p><strong>API RESTful sécurisée et scalable pour la gestion de citations, animaux, pays et paiements</strong></p>
</div>

<div align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/NestJS-11.0.1-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
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
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  </a>
</div>

---

## 🎯 Fonctionnalités Principales

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

### 🛠️ Outils de Développement
- **Documentation Swagger** interactive
- **Tests unitaires et E2E** avec Jest
- **Linting et formatting** avec ESLint/Prettier
- **CI/CD** avec GitHub Actions
- **Monitoring** avec Prometheus

---

## 🏗️ Architecture

```
backend-mister-api/
├── src/
│   ├── controllers/        # Contrôleurs REST
│   ├── services/          # Logique métier
│   ├── entities/          # Modèles de données
│   ├── dto/              # Data Transfer Objects
│   ├── guards/            # Guards d'authentification
│   ├── interceptors/      # Intercepteurs
│   ├── middleware/        # Middleware personnalisés
│   └── modules/           # Modules NestJS
├── sql/                   # Scripts SQL
├── test/                  # Tests E2E
└── supabase/             # Configuration Supabase
```

---

## 🚀 Installation & Configuration

### Prérequis
- **Node.js** 18+ 
- **PostgreSQL** 14+
- **Redis** 6+
- **Supabase** compte
- **Stripe** compte

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd backend-mister-api

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp env.example .env

# Configurer les variables d'environnement
# Voir la section Configuration ci-dessous

# Lancer en développement
npm run start:dev
```

### Configuration

Créez un fichier `.env` avec les variables suivantes :

```env
# Application
PORT=3001
NODE_ENV=development

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/punchiline_db

# Redis
REDIS_URL=redis://localhost:6379

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# JWT
JWT_SECRET=your_jwt_secret

# Email (Brevo/Sendinblue)
BREVO_API_KEY=your_brevo_api_key
```

---

## 📚 Endpoints API

### 🔐 Authentification
```
POST   /auth/login          # Connexion utilisateur
POST   /auth/register       # Inscription utilisateur
POST   /auth/refresh        # Refresh token
POST   /auth/logout         # Déconnexion
```

### 📝 Citations & Contenu
```
GET    /punchlines          # Liste des citations
GET    /punchlines/:id      # Citation par ID
POST   /punchlines          # Créer une citation (admin)
PUT    /punchlines/:id      # Modifier une citation (admin)
DELETE /punchlines/:id      # Supprimer une citation (admin)

GET    /animals             # Liste des animaux
GET    /pays-du-monde       # Liste des pays
```

### 🔑 Gestion des Clés API
```
GET    /api-keys            # Mes clés API
POST   /api-keys            # Créer une clé API
DELETE /api-keys/:id        # Supprimer une clé API
GET    /api-keys/:id/stats  # Statistiques d'utilisation
```

### 💳 Paiements
```
POST   /payments/create-checkout-session  # Créer session Stripe
POST   /payments/webhook                  # Webhook Stripe
GET    /payments/history                  # Historique des paiements
```

### 👨‍💼 Administration
```
GET    /admin/users         # Liste des utilisateurs (admin)
PUT    /admin/users/:id     # Modifier un utilisateur (admin)
GET    /admin/stats         # Statistiques globales (admin)
```

---

## 🛠️ Technologies Utilisées

| Catégorie | Technologies |
|-----------|--------------|
| **Framework** | NestJS 11, TypeScript 5.7 |
| **Base de données** | PostgreSQL, TypeORM |
| **Cache** | Redis, Cache Manager |
| **Authentification** | Supabase, JWT |
| **Paiements** | Stripe |
| **Validation** | class-validator, class-transformer |
| **Documentation** | Swagger/OpenAPI |
| **Tests** | Jest, Supertest |
| **Logs** | Winston, Nest Winston |
| **Monitoring** | Prometheus |
| **Email** | Brevo (Sendinblue) |

---

## 🔧 Scripts Disponibles

```bash
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

---

## 🗄️ Base de Données

### Tables Principales
- **users** : Utilisateurs et profils
- **punchlines** : Citations historiques
- **animals** : Animaux et leurs caractéristiques
- **pays** : Pays du monde
- **api_keys** : Clés API des utilisateurs
- **payments** : Historique des paiements
- **api_logs** : Logs d'utilisation des API

### Vues SQL
- **api_key_usage_stats** : Statistiques d'utilisation des clés
- **user_premium_status** : Statut premium des utilisateurs

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

## 📊 Monitoring & Logs

### Logs Structurés
```typescript
// Exemple de log
{
  level: 'info',
  message: 'API request processed',
  timestamp: '2024-01-15T10:30:00Z',
  userId: 'user-123',
  endpoint: '/api/punchlines',
  responseTime: 150,
  statusCode: 200
}
```

### Métriques Prometheus
- **Taux de requêtes** par endpoint
- **Temps de réponse** moyen
- **Taux d'erreur** par type
- **Utilisation des ressources**

---

## 🧪 Tests

### Tests Unitaires
```bash
# Lancer tous les tests
npm run test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

### Tests E2E
```bash
# Tests end-to-end
npm run test:e2e
```

### Exemple de Test
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

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

### Variables d'Environnement Production
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
# Autres variables...
```

### Plateformes Supportées
- **Railway** : Déploiement simple
- **Heroku** : Compatible
- **DigitalOcean** : App Platform
- **AWS** : ECS, Lambda
- **Google Cloud** : Cloud Run

---

## 📈 Performance

### Optimisations
- **Cache Redis** pour les requêtes fréquentes
- **Pagination** sur tous les endpoints de liste
- **Indexation** optimisée de la base de données
- **Compression** des réponses
- **Rate limiting** intelligent

### Métriques Cibles
- **Temps de réponse** < 200ms
- **Disponibilité** > 99.9%
- **Throughput** > 1000 req/s
- **Erreurs** < 0.1%

---

## 🤝 Contribution

### Workflow de Développement
1. **Fork** le projet
2. **Créer** une branche feature
3. **Développer** avec tests
4. **Linter** et formater le code
5. **Créer** une Pull Request

### Standards de Code
- **TypeScript strict** mode
- **ESLint** configuration
- **Prettier** formatting
- **Conventional commits**
- **Tests obligatoires**

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
  <p>Construit avec ❤️ et NestJS</p>
  <img src="https://nestjs.com/img/logo_text.svg" width="200" alt="NestJS" />
</div>
