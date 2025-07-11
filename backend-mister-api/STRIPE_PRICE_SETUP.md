# Configuration du Prix Stripe

## Problème Actuel

L'erreur `"No such price: 'price_premium_monthly'"` indique que l'ID de prix n'existe pas dans votre compte Stripe.

## Solution : Créer le Prix dans Stripe

### 1. Accéder au Dashboard Stripe

1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Assurez-vous d'être en mode **Test** (bascule en haut à droite)
3. Connectez-vous à votre compte

### 2. Créer le Produit Premium

1. Allez dans **Products** dans le menu de gauche
2. Cliquez sur **Add product**
3. Remplissez les informations :
   - **Name**: `Premium Plan`
   - **Description**: `Plan Premium pour l'API Punchiline - 5€/mois`
   - **Images**: Optionnel
4. Cliquez sur **Save product**

### 3. Créer le Prix

1. Dans le produit créé, cliquez sur **Add pricing**
2. Configurez le prix :
   - **Price**: `5.00`
   - **Currency**: `EUR`
   - **Billing**: `Recurring`
   - **Interval**: `Monthly`
   - **Trial period**: `0` (pas d'essai gratuit)
3. Cliquez sur **Save pricing**

### 4. Récupérer l'ID du Prix

1. Après création, vous verrez l'ID du prix (format: `price_1ABC123...`)
2. Copiez cet ID

### 5. Configurer le Backend

Ajoutez l'ID du prix à votre fichier `.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_cle_webhook
STRIPE_PREMIUM_PRICE_ID=price_votre_id_ici
STRIPE_PREMIUM_PRODUCT_ID=prod_votre_id_produit
```

### 6. Alternative : Modifier le Code

Si vous voulez utiliser un prix existant, modifiez le service Stripe :

```typescript
// Dans backend-mister-api/src/services/stripe.service.ts
constructor(
  private readonly configService: ConfigService,
  // ... autres dépendances
) {
  const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  this.stripe = new Stripe(stripeKey, {
    apiVersion: '2025-06-30.basil',
  });
  
  // Utiliser l'ID de prix que vous avez créé
  this.premiumPriceId = this.configService.get('STRIPE_PREMIUM_PRICE_ID', 'price_votre_id_ici');
  
  // ID du produit premium
  this.premiumProductId = this.configService.get('STRIPE_PREMIUM_PRODUCT_ID', 'prod_votre_id_produit');
}
```

## Test de la Configuration

### 1. Redémarrer le Backend

```bash
cd backend-mister-api
npm run start:dev
```

### 2. Tester la Création de Session

```bash
curl -X POST http://localhost:3001/api/v1/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre_token_supabase" \
  -d '{
    "priceId": "price_votre_id_ici",
    "successUrl": "http://localhost:3000/dashboard?payment=success",
    "cancelUrl": "http://localhost:3000/payment?payment=cancelled"
  }'
```

### 3. Tester depuis le Frontend

1. Allez sur la page de paiement
2. Cliquez sur "Commencer l'abonnement Premium"
3. Vérifiez que la session se crée sans erreur

## Vérification des Prix Existants

Si vous voulez voir tous vos prix existants :

### Via l'API

```bash
curl -X GET http://localhost:3001/api/v1/payments/prices \
  -H "Authorization: Bearer votre_token_supabase"
```

### Via Stripe CLI

```bash
stripe prices list
```

## Structure Recommandée

### Produit Premium
- **Nom**: `Premium Plan`
- **Description**: `Plan Premium pour l'API Punchiline`
- **Métadonnées**: 
  - `type`: `premium`
  - `features`: `150k_calls_per_day,100_calls_per_minute,priority_support`

### Prix Mensuel
- **Montant**: `5.00 EUR`
- **Intervalle**: `Monthly`
- **Métadonnées**:
  - `plan_type`: `premium_monthly`
  - `features`: `all_premium_features`

## Dépannage

### Erreur "No such price"
- Vérifiez que l'ID de prix est correct
- Assurez-vous d'être en mode Test/Production approprié
- Vérifiez que le prix est actif dans Stripe

### Erreur "Invalid API key"
- Vérifiez votre `STRIPE_SECRET_KEY`
- Assurez-vous qu'elle correspond au mode (test/production)

### Erreur "Webhook signature verification failed"
- Vérifiez votre `STRIPE_WEBHOOK_SECRET`
- Assurez-vous que l'URL du webhook est correcte

## Prochaines Étapes

1. ✅ Créer le produit et prix dans Stripe
2. ✅ Configurer les variables d'environnement
3. ✅ Tester la création de session
4. ✅ Configurer les webhooks
5. ✅ Tester le flux de paiement complet

---

**Note**: N'oubliez pas de configurer les webhooks Stripe après avoir créé le prix pour que les mises à jour de base de données fonctionnent automatiquement. 