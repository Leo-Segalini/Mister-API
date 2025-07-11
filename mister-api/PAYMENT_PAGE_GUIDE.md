# Guide de Test - Page de Paiement Premium

## 🎯 Objectif
Ce guide vous aide à tester la page de paiement mise à jour qui redirige maintenant vers `/payment` au lieu de `/pricing` et utilise les vraies données de l'API Stripe.

## 📋 Prérequis
- Backend NestJS démarré sur `http://localhost:3001`
- Frontend Next.js démarré sur `http://localhost:3000`
- Compte utilisateur connecté (non premium)
- Configuration Stripe active dans le backend

## 🚀 Étapes de Test

### 1. Vérification du Lien Dashboard
1. Connectez-vous à votre compte utilisateur
2. Allez sur le dashboard (`/dashboard`)
3. **Vérifiez** : Le bouton "Passer Premium" doit rediriger vers `/payment` (pas `/pricing`)

### 2. Test de la Page de Paiement
1. Cliquez sur "Passer Premium" dans le dashboard
2. **Vérifiez** : Vous êtes redirigé vers `/payment`
3. **Vérifiez** : La page affiche un loader pendant le chargement des prix
4. **Vérifiez** : Les plans de paiement s'affichent correctement

### 3. Test des Plans de Paiement
1. **Vérifiez** : Deux plans sont affichés (Mensuel et Annuel)
2. **Vérifiez** : Le plan annuel est marqué comme "Plus populaire"
3. **Vérifiez** : Les prix et fonctionnalités sont corrects
4. **Vérifiez** : Les économies sont calculées pour le plan annuel

### 4. Test de Sélection de Plan
1. Cliquez sur un plan
2. **Vérifiez** : Le plan est sélectionné (bordure jaune)
3. **Vérifiez** : Le bouton change en "Sélectionné"
4. **Vérifiez** : Le récapitulatif apparaît en bas

### 5. Test du Processus de Paiement
1. Sélectionnez un plan
2. Cliquez sur "Payer X€"
3. **Vérifiez** : Le bouton affiche "Traitement en cours..."
4. **Vérifiez** : Vous êtes redirigé vers Stripe Checkout

### 6. Test des Cas d'Erreur
1. **Test utilisateur déjà premium** :
   - Connectez-vous avec un compte premium
   - Allez sur `/payment`
   - **Vérifiez** : Message "Vous êtes déjà Premium !"

2. **Test erreur de chargement des prix** :
   - Arrêtez le backend
   - Rechargez la page de paiement
   - **Vérifiez** : Les plans par défaut s'affichent

## 🔧 Configuration Backend

### Vérification des Endpoints
Assurez-vous que ces endpoints fonctionnent :

```bash
# Récupérer les prix Stripe
GET http://localhost:3001/api/v1/payments/prices

# Créer une session de checkout
POST http://localhost:3001/api/v1/payments/create-checkout-session
Content-Type: application/json
{
  "priceId": "price_premium_monthly"
}
```

### Configuration Stripe
Vérifiez que les variables d'environnement sont configurées :

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📊 Logs à Surveiller

### Frontend (Console Browser)
```
💰 [PAYMENT] Chargement des prix Stripe...
💰 [PAYMENT] Prix Stripe reçus: [...]
💰 [PAYMENT] Plans convertis: [...]
💳 [PAYMENT] Début du processus de paiement pour le plan: price_...
💳 [PAYMENT] Session de checkout créée: {url: "..."}
```

### Backend (Terminal)
```
[PaymentController] Getting prices
[StripeService] Fetching prices from Stripe
[PaymentController] Creating checkout session
[StripeService] Creating checkout session for price: price_...
```

## 🐛 Problèmes Courants

### 1. Erreur 401 Unauthorized
**Cause** : Token d'authentification expiré
**Solution** : Reconnectez-vous

### 2. Erreur "Impossible de charger les plans de paiement"
**Cause** : Backend non démarré ou erreur Stripe
**Solution** : 
- Vérifiez que le backend est démarré
- Vérifiez la configuration Stripe
- Consultez les logs du backend

### 3. Plans par défaut affichés
**Cause** : Aucun prix configuré dans Stripe
**Solution** : 
- Créez les prix dans le dashboard Stripe
- Ajoutez les métadonnées (features, popular)

### 4. Redirection vers Stripe échoue
**Cause** : URL de checkout invalide
**Solution** : 
- Vérifiez les logs du backend
- Vérifiez la configuration Stripe
- Testez avec Postman

## ✅ Checklist de Validation

- [ ] Le lien "Passer Premium" redirige vers `/payment`
- [ ] La page charge les prix depuis l'API Stripe
- [ ] Les plans s'affichent correctement avec les prix
- [ ] La sélection de plan fonctionne
- [ ] Le récapitulatif s'affiche
- [ ] Le bouton de paiement redirige vers Stripe
- [ ] Les erreurs sont gérées gracieusement
- [ ] Les utilisateurs premium sont redirigés

## 🎉 Succès
Si tous les tests passent, la page de paiement est correctement configurée et fonctionnelle !

## 📝 Notes
- La page utilise des plans par défaut en cas d'erreur
- Les prix sont convertis de centimes vers euros
- Les métadonnées Stripe permettent de personnaliser les fonctionnalités
- Le processus de paiement est sécurisé via Stripe Checkout 