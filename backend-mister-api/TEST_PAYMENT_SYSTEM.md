# Test du Système de Paiement Complet

## Prérequis

1. **Backend démarré** sur `http://localhost:3001`
2. **Frontend démarré** sur `http://localhost:3000`
3. **Webhook Stripe configuré** (voir `STRIPE_WEBHOOK_SETUP.md`)
4. **Variables d'environnement** configurées

## Test 1: Vérification de l'Endpoint de Prix

### POSTMAN
```http
GET http://localhost:3001/api/v1/payments/prices
```

**Résultat attendu**:
```json
{
  "success": true,
  "message": "Prix récupérés avec succès",
  "data": [
    {
      "id": "price_1RiIyuQQFSQSRXWkrY9vgZa1",
      "nickname": "Premium Monthly",
      "currency": "eur",
      "unit_amount": 500,
      "recurring": {
        "interval": "month"
      },
      "product": {
        "id": "prod_xxx",
        "name": "Premium Plan",
        "description": "Plan premium mensuel"
      }
    }
  ]
}
```

## Test 2: Création de Session de Paiement

### POSTMAN
```http
POST http://localhost:3001/api/v1/payments/create-checkout-session
Content-Type: application/json

{
  "priceId": "price_1RiIyuQQFSQSRXWkrY9vgZa1",
  "successUrl": "http://localhost:3000/dashboard?payment=success",
  "cancelUrl": "http://localhost:3000/payment?payment=cancelled"
}
```

**Résultat attendu**:
```json
{
  "success": true,
  "message": "Session de paiement créée avec succès",
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
  }
}
```

## Test 3: Test du Paiement Frontend

### Étapes
1. Allez sur `http://localhost:3000/payment`
2. Cliquez sur "Passer Premium"
3. Complétez le paiement dans Stripe avec les cartes de test :
   - **Succès**: `4242 4242 4242 4242`
   - **Échec**: `4000 0000 0000 0002`

### Vérifications
- ✅ Fenêtre Stripe s'ouvre
- ✅ Paiement se complète
- ✅ Fenêtre se ferme automatiquement
- ✅ Redirection vers dashboard avec `?payment=success`

## Test 4: Vérification des Webhooks

### Logs Backend
Après un paiement réussi, vous devriez voir :
```bash
✅ [WEBHOOK] Événement reçu: checkout.session.completed
✅ [WEBHOOK] Abonnement activé pour l'utilisateur xxx - Paiement enregistré: xxx
```

### Dashboard Stripe
1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur votre endpoint
3. Vérifiez les **Recent deliveries**
4. Statut devrait être **200 OK**

## Test 5: Vérification des Données

### Table `payments`
```sql
SELECT 
  id,
  user_id,
  stripe_payment_intent_id,
  amount,
  currency,
  status,
  created_at
FROM payments 
ORDER BY created_at DESC 
LIMIT 5;
```

**Résultat attendu**:
```
id | user_id | stripe_payment_intent_id | amount | currency | status | created_at
xxx | xxx | pi_xxx | 500 | EUR | succeeded | 2024-01-xx
```

### Table `users`
```sql
SELECT 
  id,
  email,
  is_premium,
  premium_expires_at,
  stripe_customer_id
FROM users 
WHERE is_premium = true;
```

**Résultat attendu**:
```
id | email | is_premium | premium_expires_at | stripe_customer_id
xxx | user@example.com | true | 2024-02-xx | cus_xxx
```

## Test 6: Test de Renouvellement

### Simulation d'un Renouvellement
1. Dans le Dashboard Stripe, allez dans **Subscriptions**
2. Trouvez l'abonnement créé
3. Cliquez sur **Test clock** pour avancer le temps
4. Vérifiez que le webhook `invoice.payment_succeeded` est reçu

### Vérification
- ✅ Nouvel enregistrement dans `payments` avec `is_renewal: true`
- ✅ `premium_expires_at` mis à jour
- ✅ Notification envoyée

## Test 7: Test d'Annulation

### Simulation d'une Annulation
1. Dans le Dashboard Stripe, annulez l'abonnement
2. Vérifiez que le webhook `customer.subscription.deleted` est reçu

### Vérification
- ✅ `users.is_premium` mis à `false`
- ✅ `premium_expires_at` mis à `null`
- ✅ Notification d'annulation envoyée

## Dépannage

### Problème: Webhook non reçu
```bash
# Vérifiez les logs du backend
tail -f backend-mister-api/logs/app.log

# Vérifiez l'URL du webhook dans Stripe
# Doit être: http://localhost:3001/api/v1/payments/webhook
```

### Problème: Erreur de signature
```bash
# Vérifiez la variable d'environnement
echo $STRIPE_WEBHOOK_SECRET

# Redémarrez le backend après modification
npm run start:dev
```

### Problème: Paiement non enregistré
```sql
-- Vérifiez que l'utilisateur existe
SELECT * FROM users WHERE id = 'user_id_from_webhook';

-- Vérifiez les logs d'erreur
SELECT * FROM logs WHERE level = 'error' ORDER BY created_at DESC;
```

### Problème: Redirection échouée
```javascript
// Vérifiez les logs du navigateur
console.log('✅ [PAYMENT] Fenêtre Stripe fermée - vérification du statut...');
console.log('✅ [PAYMENT] Utilisateur mis à jour vers Premium !');
```

## Cartes de Test Stripe

| Numéro | Description | Résultat |
|--------|-------------|----------|
| `4242 4242 4242 4242` | Visa | Succès |
| `4000 0000 0000 0002` | Visa | Échec (décliné) |
| `4000 0000 0000 9995` | Visa | Échec (insuffisant) |
| `4000 0000 0000 3220` | Visa | 3D Secure requis |

## Validation Finale

Après tous les tests, vérifiez que :

1. ✅ **Paiements enregistrés** dans la table `payments`
2. ✅ **Statut premium** mis à jour dans `users`
3. ✅ **Webhooks reçus** et traités
4. ✅ **Notifications envoyées** aux utilisateurs
5. ✅ **Redirections fonctionnelles** après paiement
6. ✅ **Gestion des erreurs** appropriée

## Prochaines Étapes

1. **Test en production** avec de vrais paiements
2. **Monitoring** des webhooks et paiements
3. **Alertes** en cas d'échec de webhook
4. **Métriques** de conversion et de rétention 