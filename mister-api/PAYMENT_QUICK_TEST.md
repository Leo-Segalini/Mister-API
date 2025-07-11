# Test rapide - Problème de paiement

## Problème identifié
- Backend : ✅ Authentification fonctionne (cookies reçus, token vérifié)
- Frontend : ❌ Erreur "session expirée"
- Webhook : ❌ URL incorrecte

## Tests à effectuer

### 1. Test de l'authentification
```javascript
// Dans la console du navigateur (F12)
fetch('https://mister-api.onrender.com/api/v1/auth/profile', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 2. Test de création de session
```javascript
// Dans la console du navigateur (F12)
fetch('https://mister-api.onrender.com/api/v1/payments/create-checkout-session', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    priceId: 'price_1RiIyuQQFSQSRXWkrY9vgZa1',
    successUrl: 'https://mister-api.vercel.app/dashboard?payment=success',
    cancelUrl: 'https://mister-api.vercel.app/payment?payment=cancelled'
  })
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', Object.fromEntries(r.headers.entries()));
  return r.json();
})
.then(console.log)
.catch(console.error);
```

### 3. Vérification des cookies
```javascript
// Dans la console du navigateur (F12)
console.log('Cookies:', document.cookie);
```

## Résultats attendus

### Test 1 (Authentification)
```json
{
  "success": true,
  "data": {
    "id": "c9782951-c33a-4d01-ad0b-b6f96d752c80",
    "email": "leo.segalini@outlook.com",
    "is_premium": false
  }
}
```

### Test 2 (Création de session)
```json
{
  "success": true,
  "message": "Session de paiement créée avec succès",
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

### Test 3 (Cookies)
```
access_token=...; sb-access-token=...
```

## Corrections apportées

1. ✅ **Webhook URL corrigée** : `/api/v1/payments/webhook`
2. ✅ **Logs de débogage ajoutés** dans l'API service
3. ✅ **Middleware corrigé** pour capturer le body brut

## Prochaines étapes

1. Redéployez le backend avec les corrections
2. Testez les requêtes ci-dessus
3. Vérifiez les logs dans la console du navigateur
4. Testez le bouton de paiement sur la page `/payment`

## Si le problème persiste

Fournissez :
- Les résultats des tests ci-dessus
- Les logs de la console du navigateur
- Les logs du backend (Render) 