# Configuration des Webhooks Stripe

## Vue d'ensemble

Le système de paiement utilise les webhooks Stripe pour :
1. **Mettre à jour la table `payments`** lors des paiements réussis
2. **Mettre à jour le statut premium** de l'utilisateur
3. **Gérer les renouvellements d'abonnement**
4. **Envoyer des notifications** aux utilisateurs

## Configuration dans le Dashboard Stripe

### 1. Accéder aux Webhooks
1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Developers** > **Webhooks**
3. Cliquez sur **Add endpoint**

### 2. Configurer l'Endpoint
- **Endpoint URL**: `http://localhost:3001/api/v1/payments/webhook`
- **Events to send**: Sélectionnez les événements suivants :
  - `checkout.session.completed` ✅
  - `invoice.payment_succeeded` ✅
  - `invoice.payment_failed` ✅
  - `customer.subscription.updated` ✅
  - `customer.subscription.deleted` ✅

### 3. Récupérer le Secret
1. Après avoir créé l'endpoint, cliquez sur **Reveal** pour voir le secret
2. Copiez le secret (commence par `whsec_`)
3. Ajoutez-le à votre fichier `.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
```

## Variables d'Environnement Requises

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# Produit Premium
STRIPE_PREMIUM_PRODUCT_ID=prod_votre_produit_id
STRIPE_PREMIUM_PRICE_ID=price_1RiIyuQQFSQSRXWkrY9vgZa1
```

## Test du Système Complet

### 1. Démarrer le Backend
```bash
cd backend-mister-api
npm run start:dev
```

### 2. Tester le Paiement
1. Allez sur `http://localhost:3000/payment`
2. Cliquez sur "Passer Premium"
3. Complétez le paiement dans Stripe
4. Vérifiez les logs du backend pour voir les webhooks

### 3. Vérifier les Données

#### Table `payments`
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
```

#### Table `users`
```sql
SELECT id, email, is_premium, premium_expires_at, stripe_customer_id 
FROM users 
WHERE is_premium = true;
```

## Événements Webhook Gérés

### `checkout.session.completed`
- **Déclencheur**: Paiement initial réussi
- **Actions**:
  - Crée un enregistrement dans `payments`
  - Met à jour `users.is_premium = true`
  - Envoie une notification de bienvenue

### `invoice.payment_succeeded`
- **Déclencheur**: Renouvellement d'abonnement
- **Actions**:
  - Crée un enregistrement dans `payments` (renouvellement)
  - Met à jour `users.premium_expires_at`
  - Envoie une notification de renouvellement

### `invoice.payment_failed`
- **Déclencheur**: Échec de paiement
- **Actions**:
  - Met à jour `users.is_premium = false`
  - Envoie une notification d'échec

### `customer.subscription.updated`
- **Déclencheur**: Modification d'abonnement
- **Actions**:
  - Met à jour le statut premium selon l'état de l'abonnement

### `customer.subscription.deleted`
- **Déclencheur**: Annulation d'abonnement
- **Actions**:
  - Met à jour `users.is_premium = false`
  - Envoie une notification d'annulation

## Dépannage

### Webhook non reçu
1. Vérifiez que l'URL est correcte : `http://localhost:3001/api/v1/payments/webhook`
2. Vérifiez que le backend est démarré
3. Vérifiez les logs du dashboard Stripe

### Erreur de signature
1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
2. Redémarrez le backend après modification

### Paiement non enregistré
1. Vérifiez les logs du backend
2. Vérifiez que l'événement `checkout.session.completed` est configuré
3. Vérifiez que le `userId` est dans les métadonnées de la session

## Logs à Surveiller

```bash
# Logs de création de session
🚀 [PAYMENT] Création de la session de paiement Premium...

# Logs de webhook
✅ [WEBHOOK] Événement reçu: checkout.session.completed
✅ [WEBHOOK] Abonnement activé pour l'utilisateur xxx - Paiement enregistré: xxx

# Logs d'erreur
❌ [WEBHOOK] Erreur lors du traitement du webhook: xxx
```

## Test avec Stripe CLI (Optionnel)

Pour tester localement avec Stripe CLI :

```bash
# Installer Stripe CLI
# Puis lancer :
stripe listen --forward-to localhost:3001/api/v1/payments/webhook

# Cela vous donnera un webhook secret à utiliser temporairement
```

## Prochaines Étapes

1. **Configurer les webhooks en production** avec l'URL de production
2. **Ajouter des tests automatisés** pour les webhooks
3. **Implémenter la gestion des remboursements**
4. **Ajouter des métriques** pour suivre les conversions 