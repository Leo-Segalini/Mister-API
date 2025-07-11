# Guide de débogage - Webhooks Stripe

## Problèmes identifiés

### 1. Erreur de date invalide
```
QueryFailedError: invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"
```

**Cause :** `current_period_end` est `0` ou invalide dans l'objet subscription.

**Solution :** Ajout de validation et date par défaut.

### 2. PaymentIntent sans userId
```
PaymentIntent sans userId dans les métadonnées
```

**Cause :** Les PaymentIntents n'ont pas toujours les métadonnées de l'utilisateur.

**Solution :** Recherche de l'userId depuis la session de paiement associée.

### 3. Invoice sans subscription
```
Invoice sans subscription
```

**Cause :** L'invoice n'a pas de subscription associée.

**Solution :** Ajout de logs détaillés pour comprendre la structure.

## Corrections apportées

### 1. Validation des dates
```typescript
// Vérifier et calculer la date d'expiration
const currentPeriodEnd = (subscription as any).current_period_end;
let premiumExpiresAt: Date;

if (currentPeriodEnd && typeof currentPeriodEnd === 'number' && currentPeriodEnd > 0) {
  premiumExpiresAt = new Date(currentPeriodEnd * 1000);
  this.logger.log(`📅 Date d'expiration calculée: ${premiumExpiresAt.toISOString()}`);
} else {
  // Date par défaut : 30 jours à partir de maintenant
  premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  this.logger.log(`📅 Date d'expiration par défaut: ${premiumExpiresAt.toISOString()}`);
}
```

### 2. Recherche de l'userId pour PaymentIntent
```typescript
// Si pas d'userId dans les métadonnées, essayer de le récupérer depuis la session
if (!userId) {
  this.logger.log('🔍 Recherche de l\'userId depuis la session de paiement...');
  
  try {
    // Récupérer la session de paiement associée
    const sessions = await this.stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });
    
    if (sessions.data.length > 0) {
      userId = sessions.data[0].metadata?.userId;
      this.logger.log(`✅ UserId trouvé dans la session: ${userId}`);
    }
  } catch (sessionError) {
    this.logger.warn('⚠️ Impossible de récupérer la session:', sessionError.message);
  }
}
```

### 3. Logs détaillés pour Invoice
```typescript
this.logger.log(`📄 Traitement de l'invoice: ${invoice.id}`);
this.logger.log(`📄 Invoice subscription: ${invoice.subscription}`);
this.logger.log(`📄 Invoice customer: ${invoice.customer}`);
this.logger.log(`📄 Invoice amount_paid: ${invoice.amount_paid}`);
```

## Test après correction

### 1. Effectuer un nouveau paiement
1. Allez sur https://mister-api.vercel.app/payment
2. Cliquez sur "Upgrade to Premium"
3. Complétez le paiement

### 2. Logs attendus
```
💳 Webhook reçu: customer.subscription.created
📅 Date d'expiration calculée: 2025-08-10T12:42:47.000Z
✅ Abonnement créé pour l'utilisateur c9782951-c33a-4d01-ad0b-b6f96d752c80 - Premium activé

💳 Webhook reçu: payment_intent.succeeded
🔍 Recherche de l'userId depuis la session de paiement...
✅ UserId trouvé dans la session: c9782951-c33a-4d01-ad0b-b6f96d752c80
✅ PaymentIntent réussi pour l'utilisateur c9782951-c33a-4d01-ad0b-b6f96d752c80 - Paiement enregistré: [payment_id]

💳 Webhook reçu: invoice.payment_succeeded
📄 Traitement de l'invoice: in_1Rjg4cQQFSQSRXWkHE19ILr6
📄 Invoice subscription: sub_1Rjg4bQQFSQSRXWkNggwByIl
📄 Invoice customer: cus_Sf0IcegDrhrCfi
📄 Invoice amount_paid: 500
✅ Paiement réussi pour l'utilisateur c9782951-c33a-4d01-ad0b-b6f96d752c80 - Renouvellement enregistré: [payment_id]
```

## Vérification dans Supabase

Après le paiement, vérifiez dans Supabase :

1. **Table `users`** :
   - `is_premium = true`
   - `premium_expires_at` = date valide
   - `stripe_customer_id` = ID du client Stripe

2. **Table `payments`** :
   - Nouvel enregistrement avec `status = 'succeeded'`
   - `stripe_payment_intent_id` ou `stripe_subscription_id` renseigné

## Prochaines étapes

1. Effectuez un nouveau paiement de test
2. Vérifiez que les logs sont plus détaillés
3. Confirmez que l'utilisateur devient premium
4. Testez la fonctionnalité premium sur le frontend 