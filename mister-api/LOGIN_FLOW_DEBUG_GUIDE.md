# Guide de Débogage du Flux de Connexion

## Problème Identifié
Connexion réussie côté backend, mais redirection vers `/login` et nettoyage des cookies côté frontend.

## Modifications Effectuées

### 1. Suppression des Redirections Automatiques
- ✅ Suppression des redirections automatiques dans `useAuth`
- ✅ Désactivation du nettoyage automatique des cookies
- ✅ Amélioration de la gestion des états de connexion

### 2. Configuration des Cookies Backend
- ✅ `domain: '.vercel.app'` pour cross-origin
- ✅ `sameSite: 'none'` pour HTTPS
- ✅ `httpOnly: true` pour la sécurité

## Tests de Diagnostic

### 1. Test de Connexion Complet
1. Ouvrir les DevTools > Console
2. Aller sur `https://mister-api.vercel.app/login`
3. Se connecter avec les identifiants
4. Surveiller les logs dans l'ordre :

**Logs Attendus :**
```
🚀 Starting signin process...
🔐 Signin attempt with credentials: {email: 'leo.segalini@outlook.com'}
🌐 Making API request to: /api/backend/api/v1/auth/login
📡 Response status: 200
✅ Signin successful: {...}
📋 Fetching complete user profile...
✅ Complete profile data: {...}
👤 Complete user data with role: {...}
👤 User state updated with complete profile
🔄 Redirecting to dashboard...
```

### 2. Vérification des Cookies
Après connexion, dans DevTools > Application > Cookies :
- Vérifier la présence de `access_token` ou `sb-access-token`
- Vérifier le domaine : `.vercel.app`
- Vérifier SameSite : `None`

### 3. Test de Persistance
1. Se connecter avec succès
2. Rafraîchir la page `/dashboard`
3. Vérifier que l'utilisateur reste connecté
4. Vérifier les logs :
```
🔐 Initializing authentication...
🍪 Session cookies: Found
🔍 Cookies found, validating session...
✅ Session valid, user data: {...}
✅ Valid session found, user authenticated
```

## Problèmes Possibles

### 1. Conflit d'Initialisation
**Symptôme** : Connexion réussie puis redirection vers `/login`
**Cause** : L'initialisation se déclenche après la connexion
**Solution** : Vérifier l'état `isSigningIn`

### 2. Cookies Non Récupérés
**Symptôme** : Pas de cookies dans les DevTools
**Cause** : Configuration `domain` ou `sameSite` incorrecte
**Solution** : Vérifier la configuration backend

### 3. Validation de Session Échouée
**Symptôme** : Cookies présents mais validation échoue
**Cause** : Problème avec l'endpoint `/profile`
**Solution** : Vérifier les logs backend

## Debug Avancé

### Vérifier l'État de Connexion
```javascript
// Dans la console du navigateur
console.log('Auth State:', {
  isSigningIn: window.__AUTH_STATE__?.isSigningIn,
  isAuthenticated: window.__AUTH_STATE__?.isAuthenticated,
  user: window.__AUTH_STATE__?.user,
  cookies: document.cookie
});
```

### Test Manuel de l'API
```javascript
// Tester la récupération du profil
fetch('/api/backend/api/v1/auth/profile', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => {
  console.log('Profile Response Status:', r.status);
  console.log('Profile Response Headers:', Object.fromEntries(r.headers.entries()));
  return r.json();
})
.then(data => console.log('Profile Data:', data))
.catch(error => console.error('Profile Error:', error));
```

### Vérifier les Cookies Manuellement
```javascript
// Afficher tous les cookies
console.log('All Cookies:', document.cookie);

// Parser les cookies
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=');
  acc[key] = value;
  return acc;
}, {});

console.log('Parsed Cookies:', cookies);
console.log('Session Cookies:', {
  accessToken: cookies['access_token'],
  sbAccessToken: cookies['sb-access-token'],
  hasAny: !!(cookies['access_token'] || cookies['sb-access-token'])
});
```

## Logs à Surveiller

### Backend (Render)
```
🍪 Cookies définis pour leo.segalini@outlook.com avec durée de 4 heures
🍪 Cookie options: { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 14400000, domain: '.vercel.app' }
✅ Connexion réussie pour: leo.segalini@outlook.com
```

### Frontend (Console)
```
🚀 Starting signin process...
✅ Signin successful: {...}
📋 Fetching complete user profile...
✅ Complete profile data: {...}
👤 User state updated with complete profile
🔄 Redirecting to dashboard...
```

## Étapes de Validation

1. **Nettoyer l'environnement** :
   - Vider le cache du navigateur
   - Supprimer tous les cookies
   - Supprimer localStorage et sessionStorage

2. **Tester la connexion** :
   - Se connecter avec les identifiants
   - Vérifier les logs dans l'ordre
   - Confirmer la redirection vers `/dashboard`

3. **Tester la persistance** :
   - Rafraîchir la page
   - Vérifier que l'utilisateur reste connecté
   - Confirmer l'absence de redirection vers `/login`

## Solutions Alternatives

### Si le problème persiste, essayer :

1. **Configuration plus permissive** :
```typescript
// Backend - Configuration alternative
const cookieOptions = {
  httpOnly: false, // Permettre l'accès JavaScript
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: customExpiresIn * 1000,
  path: '/',
  // Pas de domaine spécifique
};
```

2. **Utiliser localStorage** :
```typescript
// Frontend - Stockage alternatif
localStorage.setItem('access_token', session.access_token);
```

3. **Désactiver l'initialisation automatique** :
```typescript
// Frontend - Initialisation manuelle
const [skipInitialization, setSkipInitialization] = useState(false);
```

## Prochaines Étapes

Une fois le problème résolu :
1. Tester la déconnexion
2. Vérifier la gestion des erreurs
3. Réintégrer les fonctionnalités admin
4. Optimiser les performances 