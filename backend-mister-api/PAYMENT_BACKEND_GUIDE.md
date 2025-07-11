# Guide de Test - Backend Paiement Stripe

## 🎯 Objectif
Ce guide vous aide à tester les modifications du backend de paiement qui filtrent maintenant les prix pour ne retourner que le produit premium `prod_Sda9wzmw1dgIFG`.

## 📋 Prérequis
- Backend NestJS démarré sur `http://localhost:3001`
- Variables d'environnement Stripe configurées
- Produit Stripe `prod_Sda9wzmw1dgIFG` existant avec des prix actifs

## 🔧 Configuration des Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Produit et Prix Premium (optionnel, valeurs par défaut)
STRIPE_PREMIUM_PRODUCT_ID=prod_Sda9wzmw1dgIFG
STRIPE_PREMIUM_PRICE_ID=price_1OqX9w2dgIFG
```

## 🚀 Étapes de Test

### 1. Vérification de l'Endpoint des Prix
Testez l'endpoint pour vérifier qu'il ne retourne que le produit premium :

```bash
# Test avec curl
curl -X GET http://localhost:3001/api/v1/payments/prices

# Test avec Postman
GET http://localhost:3001/api/v1/payments/prices
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Prix récupérés avec succès",
  "data": [
    {
      "id": "price_...",
      "nickname": "Premium Mensuel",
      "currency": "eur",
      "unit_amount": 500,
      "recurring": {
        "interval": "month",
        "interval_count": 1
      },
      "metadata": {
        "features": "150,000 appels API par jour,100 appels par minute,Support prioritaire",
        "popular": "true"
      },
      "product": {
        "id": "prod_Sda9wzmw1dgIFG",
        "name": "Premium Plan",
        "description": "Plan premium avec quotas illimités"
      }
    }
  ]
}
```

### 2. Vérification des Logs Backend
Vérifiez les logs du backend pour confirmer le filtrage :

```bash
# Dans le terminal du backend, vous devriez voir :
[StripeService] Prix filtrés: 1 prix trouvés pour le produit premium (prod_Sda9wzmw1dgIFG)
```

### 3. Test de l'Endpoint de Création de Session
Testez la création d'une session de paiement :

```bash
# Test avec Postman
POST http://localhost:3001/api/v1/payments/create-checkout-session
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "successUrl": "http://localhost:3000/dashboard?success=true",
  "cancelUrl": "http://localhost:3000/payment?canceled=true"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Session de paiement créée avec succès",
  "data": {
    "sessionId": "cs_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

### 4. Test de l'Endpoint du Portail Client
Testez la création d'une session du portail client :

```bash
# Test avec Postman
POST http://localhost:3001/api/v1/payments/create-portal-session
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "returnUrl": "http://localhost:3000/dashboard"
}
```

## 🔍 Vérifications Importantes

### 1. Filtrage des Prix
- ✅ Seul le produit `prod_Sda9wzmw1dgIFG` est retourné
- ✅ Les autres produits Stripe sont filtrés
- ✅ Le prix affiché correspond à 5€/mois (500 centimes)

### 2. Variables d'Environnement
- ✅ `STRIPE_PREMIUM_PRODUCT_ID` est configuré
- ✅ `STRIPE_PREMIUM_PRICE_ID` est configuré
- ✅ Les valeurs par défaut fonctionnent si non configurées

### 3. Logs et Monitoring
- ✅ Les logs indiquent le nombre de prix filtrés
- ✅ Les erreurs sont correctement loggées
- ✅ Les sessions de paiement sont tracées

## 🐛 Problèmes Courants

### 1. Erreur 404 sur `/api/v1/payments/prices`
**Cause :** Guard global encore actif
**Solution :** Vérifiez que le guard global a bien été supprimé du controller

### 2. Aucun prix retourné
**Cause :** Produit Stripe inexistant ou inactif
**Solution :** 
- Vérifiez que `prod_Sda9wzmw1dgIFG` existe dans Stripe
- Vérifiez que le produit a des prix actifs
- Vérifiez la variable `STRIPE_PREMIUM_PRODUCT_ID`

### 3. Erreur d'authentification Stripe
**Cause :** Clé API Stripe invalide
**Solution :** Vérifiez `STRIPE_SECRET_KEY` dans les variables d'environnement

### 4. Tous les prix sont retournés
**Cause :** Le filtre ne fonctionne pas
**Solution :** Vérifiez que la méthode `getPrices()` a bien été modifiée

## 📊 Tests de Performance

### 1. Temps de Réponse
```bash
# Test de performance
time curl -X GET http://localhost:3001/api/v1/payments/prices
```

**Résultat attendu :** < 500ms

### 2. Charge
```bash
# Test de charge simple
for i in {1..10}; do
  curl -X GET http://localhost:3001/api/v1/payments/prices &
done
wait
```

## ✅ Checklist de Validation

- [ ] L'endpoint `/api/v1/payments/prices` est accessible sans authentification
- [ ] Seul le produit `prod_Sda9wzmw1dgIFG` est retourné
- [ ] Le prix affiché correspond à 5€/mois
- [ ] Les logs indiquent le filtrage correct
- [ ] L'endpoint de création de session fonctionne
- [ ] L'endpoint du portail client fonctionne
- [ ] Les variables d'environnement sont configurées
- [ ] Les erreurs sont correctement gérées

## 🎉 Succès
Si tous les tests passent, le backend de paiement est correctement configuré et filtré !

## 📝 Notes
- Le filtrage se fait côté backend pour plus de sécurité
- Les variables d'environnement permettent la flexibilité
- Les logs facilitent le débogage
- Le code est prêt pour la production

## 🔄 Prochaines Étapes
1. Tester l'intégration complète avec le frontend
2. Configurer les webhooks Stripe
3. Tester les paiements réels
4. Ajouter des tests unitaires
5. Configurer le monitoring 