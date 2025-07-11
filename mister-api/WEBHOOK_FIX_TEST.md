# Test des Webhooks Stripe - Correction

## Problème résolu

Les webhooks Stripe arrivaient bien (retour 200) mais les événements n'étaient pas traités car :

1. **Événements non gérés** : `customer.subscription.created` et `payment_intent.succeeded`
2. **Logs insuffisants** : Difficile de diagnostiquer les problèmes

## Corrections apportées

### 1. Ajout de la gestion des événements manquants

**Nouveaux événements gérés :**
- ✅ `customer.subscription.created` - Nouvel abonnement créé
- ✅ `payment_intent.succeeded` - Paiement réussi

**Événements déjà gérés :**
- ✅ `checkout.session.completed` - Session de paiement finalisée
- ✅ `invoice.payment_succeeded` - Renouvellement réussi
- ✅ `invoice.payment_failed` - Renouvellement échoué
- ✅ `customer.subscription.updated` - Abonnement modifié
- ✅ `customer.subscription.deleted` - Abonnement supprimé

### 2. Amélioration des logs

Ajout de logs détaillés pour chaque événement webhook reçu.

## Test à effectuer

### 1. Effectuer un nouveau paiement

1. **Allez sur la page de paiement** : https://mister-api.vercel.app/payment
2. **Cliquez sur "Upgrade to Premium"**
3. **Complétez le paiement** sur Stripe
4. **Vérifiez les logs** du backend sur Render

### 2. Logs attendus

Vous devriez voir dans les logs du backend :

```
💳 Webhook reçu: customer.subscription.created
✅ Abonnement créé pour l'utilisateur c9782951-c33a-4d01-ad0b-b6f96d752c80 - Premium activé

💳 Webhook reçu: payment_intent.succeeded
✅ PaymentIntent réussi pour l'utilisateur c9782951-c33a-4d01-ad0b-b6f96d752c80 - Paiement enregistré: [payment_id]

💳 Webhook reçu: invoice.payment_succeeded
✅ Paiement réussi pour l'utilisateur c9782951-c33a-4d01-ad0b-b6f96d752c80 - Renouvellement enregistré: [payment_id]
```

### 3. Vérification dans Supabase

Après le paiement, vérifiez dans Supabase que :

1. **Table `users`** : L'utilisateur a `is_premium = true`
2. **Table `payments`** : Un nouvel enregistrement de paiement a été créé
3. **Champ `premium_expires_at`** : Date d'expiration mise à jour

### 4. Test manuel des webhooks

Vous pouvez tester manuellement avec curl :

```bash
# Test customer.subscription.created
curl -X POST https://mister-api.onrender.com/api/v1/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: whsec_test" \
  -d '{
    "id": "evt_test",
    "object": "event",
    "api_version": "2025-06-30.basil",
    "created": 1234567890,
    "data": {
      "object": {
        "id": "sub_test",
        "object": "subscription",
        "customer": "cus_test",
        "status": "active",
        "current_period_end": 1234567890,
        "metadata": {
          "userId": "c9782951-c33a-4d01-ad0b-b6f96d752c80"
        }
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_test",
      "idempotency_key": null
    },
    "type": "customer.subscription.created"
  }'
```

## Résultat attendu

Après correction :
- ✅ Tous les événements webhook sont traités
- ✅ L'utilisateur devient premium dans Supabase
- ✅ Les paiements sont enregistrés en base de données
- ✅ Les logs sont détaillés et informatifs

## Prochaines étapes

1. Effectuez un nouveau paiement de test
2. Vérifiez les logs du backend
3. Confirmez que l'utilisateur est premium dans Supabase
4. Testez la fonctionnalité premium sur le frontend 