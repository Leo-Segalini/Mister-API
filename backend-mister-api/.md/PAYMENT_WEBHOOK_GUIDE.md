# Guide des Paiements et Webhooks

Ce guide explique comment utiliser les nouvelles fonctionnalités de paiement Stripe et de webhooks dans l'API Punchiline.

## 🏦 Intégration Stripe

### Configuration

1. **Créer un compte Stripe** : Allez sur [stripe.com](https://stripe.com) et créez un compte
2. **Récupérer les clés** : Dans le dashboard Stripe, allez dans "Developers" > "API keys"
3. **Configurer les variables d'environnement** :

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Création des Produits et Prix

1. **Créer un produit** : Dans Stripe Dashboard > "Products"
2. **Ajouter des prix** : Pour chaque plan (Free, Premium, etc.)
3. **Récupérer les Price IDs** : Utilisez ces IDs dans l'API

### Endpoints de Paiement

#### 1. Créer une Session de Paiement

```http
POST /payments/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "priceId": "price_1ABC123DEF456",
  "successUrl": "https://your-app.com/success",
  "cancelUrl": "https://your-app.com/cancel"
}
```

#### 2. Créer un Abonnement Direct

```http
POST /payments/create-subscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "priceId": "price_1ABC123DEF456",
  "paymentMethodId": "pm_1ABC123DEF456"
}
```

#### 3. Récupérer les Prix Disponibles

```http
GET /payments/prices
```

#### 4. Gérer les Abonnements

```http
# Récupérer les abonnements
GET /payments/subscriptions
Authorization: Bearer <token>

# Annuler un abonnement
POST /payments/cancel-subscription/{subscriptionId}
Authorization: Bearer <token>

# Mettre à jour un abonnement
POST /payments/update-subscription/{subscriptionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "priceId": "price_1ABC123DEF456"
}
```

#### 5. Portail Client Stripe

```http
POST /payments/create-portal-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnUrl": "https://your-app.com/account"
}
```

## 🔗 Système de Webhooks

### Configuration des Webhooks

L'API supporte trois types de webhooks :

1. **Paiements** (`payment_events`)
2. **Sécurité** (`security_events`)
3. **Administration** (`admin_events`)

### Variables d'Environnement

```env
WEBHOOK_PAYMENT_URL=https://your-domain.com/webhooks/payment
WEBHOOK_PAYMENT_SECRET=your_secret_key
WEBHOOK_SECURITY_URL=https://your-domain.com/webhooks/security
WEBHOOK_SECURITY_SECRET=your_secret_key
WEBHOOK_ADMIN_URL=https://your-domain.com/webhooks/admin
WEBHOOK_ADMIN_SECRET=your_secret_key
```

### Endpoints de Webhooks

#### 1. Webhook Stripe

```http
POST /webhooks/stripe
Content-Type: application/json
Stripe-Signature: <signature>

{
  "id": "evt_123",
  "type": "checkout.session.completed",
  "data": { ... }
}
```

#### 2. Déclencher un Événement de Sécurité

```http
POST /webhooks/security
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "api_key.suspicious_activity",
  "data": {
    "userId": "user_id",
    "keyId": "key_id",
    "activity": "Multiple failed requests",
    "riskLevel": "high"
  }
}
```

#### 3. Déclencher un Événement d'Administration

```http
POST /webhooks/admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "quota.exceeded",
  "data": {
    "userId": "user_id",
    "quota": 1000,
    "usage": 1200
  }
}
```

#### 4. Tester un Webhook

```http
POST /webhooks/test/{configKey}
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "test.event",
  "data": {
    "message": "Test webhook"
  }
}
```

#### 5. Gérer les Configurations

```http
# Récupérer les configurations
GET /webhooks/configs
Authorization: Bearer <token>

# Ajouter une configuration
POST /webhooks/configs
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "custom_webhook",
  "url": "https://your-domain.com/webhook",
  "events": ["user.created", "payment.succeeded"],
  "secret": "your_secret"
}

# Supprimer une configuration
POST /webhooks/configs/{key}/delete
Authorization: Bearer <token>
```

### Types d'Événements Supportés

#### Événements de Paiement
- `payment.succeeded`
- `payment.failed`
- `subscription.created`
- `subscription.updated`
- `subscription.deleted`

#### Événements de Sécurité
- `api_key.rotated`
- `api_key.suspicious_activity`
- `user.login_failed`
- `user.account_locked`

#### Événements d'Administration
- `user.created`
- `user.updated`
- `user.deleted`
- `quota.exceeded`
- `system.alert`

## 🔐 Sécurité des Webhooks

### Signature HMAC

Les webhooks sont sécurisés avec des signatures HMAC-SHA256 :

```javascript
// Exemple de vérification côté client
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Headers de Sécurité

Les webhooks incluent automatiquement :
- `X-Webhook-Signature` : Signature HMAC
- `User-Agent` : `Punchiline-API-Webhook/1.0`
- `Content-Type` : `application/json`

## 📊 Monitoring et Logs

### Endpoint de Santé

```http
GET /webhooks/health
```

Réponse :
```json
{
  "success": true,
  "message": "Service webhook opérationnel",
  "data": {
    "status": "healthy",
    "activeConfigs": 3,
    "totalConfigs": 3
  }
}
```

### Logs

Tous les événements webhook sont loggés avec :
- Timestamp
- Type d'événement
- Source
- Statut (succès/échec)
- Détails d'erreur si applicable

## 🧪 Tests

### Test Externe

```http
POST /webhooks/external-test
Content-Type: application/json

{
  "url": "https://webhook.site/your-unique-id",
  "event": {
    "type": "test.event",
    "data": {
      "message": "Test message"
    }
  },
  "secret": "optional_secret"
}
```

### Test avec Webhook.site

1. Allez sur [webhook.site](https://webhook.site)
2. Copiez l'URL unique générée
3. Utilisez cette URL dans vos configurations de webhook
4. Déclenchez des événements pour voir les payloads

## 🔄 Intégration avec l'Application

### Flux de Paiement Complet

1. **Création de session** : L'utilisateur clique sur "Upgrade Premium"
2. **Redirection Stripe** : L'utilisateur est redirigé vers Stripe Checkout
3. **Paiement** : L'utilisateur saisit ses informations de paiement
4. **Webhook** : Stripe envoie un webhook à votre API
5. **Mise à jour** : L'utilisateur est automatiquement upgradé
6. **Notification** : L'utilisateur reçoit une confirmation

### Gestion des Échecs

- **Paiement échoué** : Notification automatique à l'utilisateur
- **Webhook échoué** : Retry automatique avec backoff exponentiel
- **Signature invalide** : Rejet automatique de l'événement

## 🚀 Prochaines Étapes

1. **Interface Web** : Créer un dashboard utilisateur
2. **Analytics** : Intégrer des métriques de paiement
3. **Support Client** : Système de tickets pour les problèmes de paiement
4. **Facturation** : Génération automatique de factures
5. **Remises** : Système de codes promo et remises

## 📞 Support

Pour toute question sur l'intégration Stripe ou les webhooks :

1. Consultez la [documentation Stripe](https://stripe.com/docs)
2. Vérifiez les logs de l'application
3. Testez avec webhook.site
4. Contactez l'équipe de développement 