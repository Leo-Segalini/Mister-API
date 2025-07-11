# Variables d'Environnement

Ce document décrit toutes les variables d'environnement nécessaires pour faire fonctionner l'API Punchiline.

## Configuration de Base

```env
NODE_ENV=development
PORT=3000
```

## Base de Données

```env
DATABASE_URL=postgresql://username:password@localhost:5432/punchiline_api
```

## Redis (Cache)

```env
REDIS_URL=redis://localhost:6379
```

## Supabase (Authentification)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Stripe (Paiements)

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Webhooks

```env
WEBHOOK_PAYMENT_URL=https://your-domain.com/webhooks/payment
WEBHOOK_PAYMENT_SECRET=your_payment_webhook_secret
WEBHOOK_SECURITY_URL=https://your-domain.com/webhooks/security
WEBHOOK_SECURITY_SECRET=your_security_webhook_secret
WEBHOOK_ADMIN_URL=https://your-domain.com/webhooks/admin
WEBHOOK_ADMIN_SECRET=your_admin_webhook_secret
```

## Rate Limiting

```env
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

## Logs

```env
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Sécurité

```env
JWT_SECRET=your-jwt-secret-key
COOKIE_SECRET=your-cookie-secret
```

## Quotas

```env
FREE_TIER_DAILY_LIMIT=1000
PREMIUM_TIER_DAILY_LIMIT=10000
```

## Cache

```env
CACHE_TTL=3600
CACHE_MAX_ITEMS=1000
```

## Notifications (Email)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Monitoring

```env
SENTRY_DSN=your-sentry-dsn
```

## Configuration Recommandée pour le Développement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Configuration de base
NODE_ENV=development
PORT=3000

# Base de données (PostgreSQL local)
DATABASE_URL=postgresql://postgres:password@localhost:5432/punchiline_api

# Redis (Redis local)
REDIS_URL=redis://localhost:6379

# Supabase (créez un projet sur supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (créez un compte sur stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Webhooks (URLs de test)
WEBHOOK_PAYMENT_URL=https://webhook.site/your-unique-id
WEBHOOK_SECURITY_URL=https://webhook.site/your-unique-id
WEBHOOK_ADMIN_URL=https://webhook.site/your-unique-id

# Autres configurations
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
LOG_LEVEL=debug
FREE_TIER_DAILY_LIMIT=1000
PREMIUM_TIER_DAILY_LIMIT=10000
```

## Configuration pour la Production

Pour la production, assurez-vous de :

1. Utiliser des clés de production Stripe (`sk_live_` au lieu de `sk_test_`)
2. Configurer des URLs de webhooks sécurisées (HTTPS)
3. Utiliser des secrets forts pour les webhooks
4. Configurer un serveur Redis de production
5. Utiliser une base de données PostgreSQL de production
6. Configurer un service de monitoring (Sentry, etc.)

## Sécurité

⚠️ **Important** : Ne jamais commiter le fichier `.env` dans le repository Git. Il contient des informations sensibles.

Ajoutez `.env` à votre fichier `.gitignore` :

```gitignore
# Variables d'environnement
.env
.env.local
.env.production
```

## Validation

L'application valide automatiquement la présence des variables d'environnement requises au démarrage. Si une variable manque, l'application s'arrêtera avec un message d'erreur explicite. 