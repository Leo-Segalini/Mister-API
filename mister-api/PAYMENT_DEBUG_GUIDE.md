# Guide de débogage - Page de paiement

## Problème : Déconnexion lors du clic sur le bouton de paiement

### 1. Vérifications à effectuer

#### 1.1 Console du navigateur
Ouvrez la console du navigateur (F12) et vérifiez les logs :

```javascript
// Logs attendus lors du chargement de la page
🔍 [PAYMENT] État de l'authentification: {
  user: { id: "...", email: "...", is_premium: false },
  authLoading: false,
  isAuthenticated: true
}

// Logs lors du clic sur le bouton
🚀 [PAYMENT] Création de la session de paiement Premium...
🚀 [PAYMENT] Prix utilisé: price_1RiIyuQQFSQSRXWkrY9vgZa1
🚀 [PAYMENT] Utilisateur: c9782951-c33a-4d01-ad0b-b6f96d752c80
```

#### 1.2 Cookies
Vérifiez que les cookies d'authentification sont présents :

```javascript
// Dans la console du navigateur
console.log('Cookies:', document.cookie);
```

Vous devriez voir :
- `access_token=...`
- `sb-access-token=...`

#### 1.3 Requête réseau
Dans l'onglet Network de la console, vérifiez la requête vers `/api/v1/payments/create-checkout-session` :

- **Status** : 200 ou 401
- **Headers** : Vérifiez que `Cookie` est envoyé
- **Response** : Vérifiez le contenu de la réponse

### 2. Causes possibles

#### 2.1 Cookies non envoyés
**Symptôme** : Erreur 401 "Non authentifié"
**Solution** : Vérifiez que `credentials: 'include'` est configuré

#### 2.2 Session expirée
**Symptôme** : Erreur 401 "Session expirée"
**Solution** : Reconnectez-vous

#### 2.3 CORS
**Symptôme** : Erreur CORS dans la console
**Solution** : Vérifiez la configuration CORS du backend

#### 2.4 Problème de timing
**Symptôme** : L'utilisateur semble connecté mais la requête échoue
**Solution** : Attendez que l'authentification soit complètement initialisée

### 3. Tests à effectuer

#### 3.1 Test de l'authentification
```javascript
// Dans la console du navigateur
fetch('https://mister-api.onrender.com/api/v1/auth/profile', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

#### 3.2 Test de création de session
```javascript
// Dans la console du navigateur
fetch('https://mister-api.onrender.com/api/v1/payments/create-checkout-session', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_1RiIyuQQFSQSRXWkrY9vgZa1',
    successUrl: 'https://mister-api.vercel.app/dashboard?payment=success',
    cancelUrl: 'https://mister-api.vercel.app/payment?payment=cancelled'
  })
}).then(r => r.json()).then(console.log);
```

### 4. Solutions

#### 4.1 Si les cookies ne sont pas envoyés
Vérifiez la configuration de l'API service :

```typescript
// Dans lib/api.ts, méthode request
const config: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    ...options.headers,
  },
  credentials: 'include', // Important !
  ...options,
};
```

#### 4.2 Si la session expire
Ajoutez une vérification de session avant le paiement :

```typescript
// Dans la page de paiement
const handleUpgradeToPremium = async () => {
  try {
    // Vérifier la session d'abord
    await apiService.getProfile();
    
    // Continuer avec le paiement...
  } catch (error) {
    // Rediriger vers la connexion
    router.push('/login');
  }
};
```

#### 4.3 Si le problème persiste
Ajoutez des logs supplémentaires :

```typescript
// Dans lib/api.ts, méthode request
console.log('🌐 Making API request to:', url, {
  method: config.method || 'GET',
  headers: config.headers,
  credentials: config.credentials,
  body: config.body ? 'present' : 'none',
  cookies: document.cookie
});
```

### 5. Logs à surveiller

#### 5.1 Backend (Render)
Vérifiez les logs du backend pour voir si la requête arrive :

```bash
# Dans les logs Render, cherchez :
[PaymentController] Création de session de paiement
[StripeService] Session créée
```

#### 5.2 Frontend (Console)
Vérifiez les logs du frontend :

```javascript
// Logs attendus
🔍 [PAYMENT] État de l'authentification: {...}
🚀 [PAYMENT] Création de la session de paiement Premium...
✅ [PAYMENT] Session créée: {...}
```

### 6. Configuration à vérifier

#### 6.1 Variables d'environnement
- `NEXT_PUBLIC_API_URL` : https://mister-api.onrender.com
- `STRIPE_WEBHOOK_SECRET` : whsec_PVX6GpB0hsrAFdOdrIf4cit1kOcnRTv0

#### 6.2 CORS (Backend)
Vérifiez que l'origine frontend est autorisée :

```typescript
// Dans main.ts
const corsOrigins = [
  'https://mister-api.vercel.app',
  'https://*.vercel.app',
];
```

### 7. Test de régression

Pour tester si le problème est résolu :

1. Connectez-vous
2. Allez sur `/payment`
3. Vérifiez les logs de la console
4. Cliquez sur le bouton de paiement
5. Vérifiez que Stripe s'ouvre
6. Annulez le paiement
7. Vérifiez que vous restez connecté

### 8. Contact

Si le problème persiste, fournissez :
- Les logs de la console du navigateur
- Les logs du backend (Render)
- La réponse de la requête réseau
- Les cookies présents 