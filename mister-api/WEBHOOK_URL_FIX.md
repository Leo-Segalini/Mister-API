# Correction de l'URL du Webhook Stripe

## Problème identifié
Stripe essaie d'envoyer les événements à `/api/v1/stripe/webhook` mais l'endpoint correct est `/api/v1/payments/webhook`, ce qui cause des erreurs 404.

## Solution

### 1. Corriger l'URL dans le Dashboard Stripe

1. **Allez dans votre Dashboard Stripe** : https://dashboard.stripe.com/webhooks
2. **Trouvez votre webhook** existant
3. **Cliquez sur "Edit"** ou supprimez et recréez le webhook
4. **Corrigez l'URL** :

**❌ URL incorrecte actuelle :**
```
https://mister-api.onrender.com/api/v1/stripe/webhook
```

**✅ URL correcte :**
```
https://mister-api.onrender.com/api/v1/payments/webhook
```

### 2. Vérification de l'endpoint backend

L'endpoint webhook est bien configuré dans le backend :

```typescript
// Dans PaymentController
@Post('webhook')
@HttpCode(HttpStatus.OK)
async handleWebhook(
  @Req() req: RawBodyRequest<any>,
  @Headers('stripe-signature') signature: string,
): Promise<ApiResponse<any>> {
  // Traitement du webhook
}
```

**URL complète :** `https://mister-api.onrender.com/api/v1/payments/webhook`

### 3. Test de l'endpoint

Vous pouvez tester l'endpoint manuellement :

```bash
curl -X POST https://mister-api.onrender.com/api/v1/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"test": "data"}'
```

**Résultat attendu :** 200 OK (même si la signature est invalide, l'endpoint répond)

### 4. Événements à configurer

Une fois l'URL corrigée, configurez ces événements dans Stripe :

**Événements essentiels :**
- ✅ `checkout.session.completed` - Paiement finalisé
- ✅ `invoice.payment_succeeded` - Renouvellement réussi
- ✅ `invoice.payment_failed` - Renouvellement échoué
- ✅ `customer.subscription.updated` - Abonnement modifié
- ✅ `customer.subscription.deleted` - Abonnement annulé
- ✅ `customer.subscription.created` - Nouvel abonnement
- ✅ `payment_intent.succeeded` - Paiement réussi

### 5. Test du webhook

1. **Dans le Dashboard Stripe**, cliquez sur "Send test webhook"
2. **Sélectionnez** `checkout.session.completed`
3. **Cliquez** sur "Send test webhook"
4. **Vérifiez** que vous recevez un statut 200

### 6. Vérification des logs

Après correction, vous devriez voir dans les logs du backend :

```
🔧 Webhook middleware triggered for: /api/v1/payments/webhook
💳 Webhook received: checkout.session.completed
✅ User premium status updated: c9782951-c33a-4d01-ad0b-b6f96d752c80
```

### 7. Variables d'environnement

Assurez-vous que cette variable est configurée dans Render :

```bash
STRIPE_WEBHOOK_SECRET=whsec_PVX6GpB0hsrAFdOdrIf4cit1kOcnRTv0
```

## Résultat attendu

Après correction de l'URL :
- ✅ Les webhooks Stripe arrivent sur le bon endpoint
- ✅ Les événements sont traités correctement
- ✅ Le statut premium de l'utilisateur est mis à jour dans Supabase
- ✅ Les paiements sont enregistrés en base de données

## Prochaines étapes

1. Corrigez l'URL dans le Dashboard Stripe
2. Testez avec un webhook de test
3. Effectuez un nouveau paiement pour vérifier que tout fonctionne
4. Vérifiez que l'utilisateur devient premium dans Supabase 