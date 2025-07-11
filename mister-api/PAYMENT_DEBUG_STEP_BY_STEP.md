# Débogage étape par étape - Problème de paiement

## Problème identifié
- Backend : ✅ Authentification fonctionne (cookies reçus, token vérifié)
- Frontend : ❌ Erreur "session expirée"
- Logs backend : Requête arrive sur `/` au lieu de `/api/v1/payments/create-checkout-session`

## Tests à effectuer

### 1. Test de l'URL de base
```javascript
// Dans la console du navigateur (F12)
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

**Résultat attendu :** `https://mister-api.onrender.com`

### 2. Test de construction de l'URL
```javascript
// Dans la console du navigateur (F12)
const baseUrl = 'https://mister-api.onrender.com';
const endpoint = '/api/v1/payments/create-checkout-session';
const url = `${baseUrl}${endpoint}`;
console.log('URL construite:', url);
```

**Résultat attendu :** `https://mister-api.onrender.com/api/v1/payments/create-checkout-session`

### 3. Test de la requête complète
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
  console.log('URL finale:', r.url);
  console.log('Headers:', Object.fromEntries(r.headers.entries()));
  return r.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### 4. Test de l'API service
```javascript
// Dans la console du navigateur (F12)
// Simuler l'appel de l'API service
const apiService = {
  baseUrl: 'https://mister-api.onrender.com',
  async createCheckoutSession(priceId) {
    const url = `${this.baseUrl}/api/v1/payments/create-checkout-session`;
    console.log('🌐 Making API request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/payment?payment=cancelled`
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response URL:', response.url);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    return data;
  }
};

// Tester
apiService.createCheckoutSession('price_1RiIyuQQFSQSRXWkrY9vgZa1');
```

## Analyse des résultats

### Si l'URL est correcte mais la requête arrive sur `/`
- Problème de redirection côté backend
- Vérifier les logs backend pour voir la route exacte

### Si l'URL est incorrecte
- Problème de construction de l'URL dans l'API service
- Vérifier la variable d'environnement `NEXT_PUBLIC_API_URL`

### Si la requête échoue avec 404
- L'endpoint n'existe pas
- Vérifier que le contrôleur PaymentController est bien enregistré

### Si la requête échoue avec 401
- Problème d'authentification
- Vérifier les cookies envoyés

## Logs à surveiller

### Frontend (Console)
```
🌐 Making API request to: https://mister-api.onrender.com/api/v1/payments/create-checkout-session
📡 Response status: 200
📦 Response data: { success: true, data: { url: "..." } }
```

### Backend (Render)
```
[PaymentController] Création de session de paiement
[StripeService] Session créée
```

## Solutions possibles

### 1. Problème d'URL
Si l'URL est mal construite, vérifier :
```typescript
// Dans lib/api.ts
constructor() {
  this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mister-api.onrender.com';
  console.log('🚀 ApiService initialized with baseUrl:', this.baseUrl);
}
```

### 2. Problème de redirection
Si la requête est redirigée, vérifier :
- Configuration CORS
- Middleware de routage
- Variables d'environnement

### 3. Problème d'authentification
Si l'authentification échoue, vérifier :
- Cookies envoyés
- Configuration du middleware
- Headers de la requête

## Prochaines étapes

1. Exécuter les tests ci-dessus
2. Analyser les résultats
3. Identifier le problème exact
4. Appliquer la solution appropriée 