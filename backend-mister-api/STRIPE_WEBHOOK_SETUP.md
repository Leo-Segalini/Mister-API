# Configuration du Webhook Stripe

## 1. Variables d'environnement

Ajoutez la variable suivante dans votre backend (Render) :

```bash
STRIPE_WEBHOOK_SECRET=whsec_PVX6GpB0hsrAFdOdrIf4cit1kOcnRTv0
```

## 2. Configuration dans le Dashboard Stripe

### 2.1 Créer le webhook

1. Allez dans votre [Dashboard Stripe](https://dashboard.stripe.com/webhooks)
2. Cliquez sur "Add endpoint"
3. Configurez :
   - **Endpoint URL** : `https://mister-api.onrender.com/api/v1/payment/webhook`
   - **Events to send** : Sélectionnez les événements suivants

### 2.2 Événements à configurer

**Événements essentiels :**
- ✅ `checkout.session.completed` - Paiement finalisé
- ✅ `invoice.payment_succeeded` - Renouvellement réussi
- ✅ `invoice.payment_failed` - Renouvellement échoué
- ✅ `customer.subscription.updated` - Abonnement modifié
- ✅ `customer.subscription.deleted` - Abonnement annulé

**Événements optionnels :**
- `payment_intent.succeeded` - Paiement réussi
- `payment_intent.payment_failed` - Paiement échoué
- `customer.subscription.created` - Nouvel abonnement

## 3. Test du webhook

### 3.1 Test depuis le dashboard Stripe

1. Dans votre webhook, cliquez sur "Send test webhook"
2. Sélectionnez un événement (ex: `checkout.session.completed`)
3. Cliquez sur "Send test webhook"
4. Vérifiez les logs de votre backend

### 3.2 Test manuel

Vous pouvez tester avec curl :

```bash
curl -X POST https://mister-api.onrender.com/api/v1/payment/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: whsec_test_signature" \
  -d '{
    "id": "evt_test",
    "object": "event",
    "api_version": "2020-08-27",
    "created": 1234567890,
    "data": {
      "object": {
        "id": "cs_test",
        "object": "checkout.session",
        "payment_intent": "pi_test",
        "customer": "cus_test",
        "amount_total": 2000,
        "currency": "eur",
        "metadata": {
          "userId": "test-user-id"
        }
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_test",
      "idempotency_key": null
    },
    "type": "checkout.session.completed"
  }'
```

## 4. Gestion des événements

### 4.1 Événements gérés par le backend

Le backend gère automatiquement les événements suivants :

#### `checkout.session.completed`
- Crée un enregistrement de paiement
- Met à jour le statut premium de l'utilisateur
- Envoie une notification de bienvenue

#### `invoice.payment_succeeded`
- Crée un enregistrement de renouvellement
- Met à jour la date d'expiration premium
- Envoie une notification de renouvellement

#### `invoice.payment_failed`
- Désactive le statut premium de l'utilisateur
- Envoie une notification d'échec

#### `customer.subscription.updated`
- Met à jour le statut premium selon l'état de l'abonnement

#### `customer.subscription.deleted`
- Désactive le statut premium de l'utilisateur

### 4.2 Logs et monitoring

Les événements webhook sont loggés dans votre backend. Vérifiez les logs sur Render pour diagnostiquer les problèmes.

## 5. Sécurité

### 5.1 Signature webhook

Le webhook vérifie automatiquement la signature Stripe pour s'assurer que les événements proviennent bien de Stripe.

### 5.2 Variables d'environnement

- `STRIPE_WEBHOOK_SECRET` : Clé secrète pour vérifier les signatures
- `STRIPE_SECRET_KEY` : Clé secrète Stripe pour les opérations API

## 6. Dépannage

### 6.1 Erreurs communes

**Erreur 401 - Signature invalide**
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Assurez-vous que la signature est bien envoyée dans le header

**Erreur 400 - Body invalide**
- Le middleware capture le body brut pour la vérification de signature
- Vérifiez que le content-type est `application/json`

**Webhook non reçu**
- Vérifiez que l'URL est accessible depuis Stripe
- Vérifiez les logs de votre backend
- Testez avec l'outil de test Stripe

### 6.2 Vérification des logs

```bash
# Sur Render, vérifiez les logs pour voir les événements reçus
# Recherchez les logs contenant "Webhook" ou "Stripe"
```

## 7. Production

### 7.1 Monitoring

- Surveillez les logs pour détecter les échecs de webhook
- Configurez des alertes pour les événements critiques
- Vérifiez régulièrement que les abonnements sont à jour

### 7.2 Retry automatique

Stripe retente automatiquement les webhooks échoués avec un délai exponentiel.

### 7.3 Idempotence

Le backend gère l'idempotence pour éviter les doublons en cas de retry. 