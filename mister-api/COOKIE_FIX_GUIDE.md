# Guide de Correction des Cookies

## Problème Identifié
Le backend définit correctement les cookies, mais le frontend ne les récupère pas à cause de la configuration `sameSite` et `domain`.

## Modifications Effectuées

### 1. Configuration Backend (AuthController)
```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const, // Pour cross-origin en HTTPS
  maxAge: customExpiresIn * 1000, // 4 heures
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined, // Domaine pour cross-origin
};
```

### 2. Amélioration Frontend (useAuth)
- ✅ Fonction `getSessionCookies()` pour extraire proprement les cookies
- ✅ Vérification améliorée de la présence des cookies
- ✅ Nettoyage des cookies avec tous les domaines possibles

## Tests à Effectuer

### 1. Test de Connexion
1. Aller sur `https://mister-api.vercel.app/login`
2. Se connecter avec les identifiants
3. Vérifier dans la console :
```
🍪 Session cookies: Found
🍪 Session cookies found: { hasAccessToken: true, cookieLength: 1234 }
✅ Session valid, user data: {...}
```

### 2. Vérification des Cookies
Dans les DevTools > Application > Cookies, vérifier :
- **Nom** : `access_token` ou `sb-access-token`
- **Domaine** : `.vercel.app` (en production)
- **Path** : `/`
- **HttpOnly** : ✅
- **Secure** : ✅
- **SameSite** : `None`

### 3. Test de Persistance
1. Se connecter avec succès
2. Rafraîchir la page
3. Vérifier que l'utilisateur reste connecté
4. Vérifier que la redirection vers `/dashboard` fonctionne

### 4. Test de Déconnexion
1. Cliquer sur "Déconnexion"
2. Vérifier que les cookies sont supprimés
3. Vérifier la redirection vers `/login`

## Debug des Cookies

### Vérifier les Cookies dans la Console
```javascript
// Afficher tous les cookies
console.log('All cookies:', document.cookie);

// Vérifier les cookies de session
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=');
  acc[key] = value;
  return acc;
}, {});

console.log('Session cookies:', {
  accessToken: cookies['access_token'],
  sbAccessToken: cookies['sb-access-token'],
  hasAny: !!(cookies['access_token'] || cookies['sb-access-token'])
});
```

### Test Manuel de l'API
```javascript
// Tester la récupération du profil
fetch('/api/backend/api/v1/auth/profile', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Problèmes Possibles

### 1. Cookies Non Définis
**Symptôme** : Pas de cookies dans les DevTools
**Cause** : Problème de configuration `domain` ou `sameSite`
**Solution** : Vérifier les logs backend pour la configuration des cookies

### 2. Cookies Non Récupérés
**Symptôme** : Cookies présents mais non détectés par le frontend
**Cause** : Problème de parsing des cookies
**Solution** : Utiliser la fonction `getSessionCookies()` améliorée

### 3. Erreur CORS Persistante
**Symptôme** : Erreur CORS malgré le proxy
**Cause** : Configuration CORS incorrecte
**Solution** : Vérifier la configuration CORS du backend

## Logs à Surveiller

### Backend (Render)
```
🍪 Cookies définis pour leo.segalini@outlook.com avec durée de 4 heures
⏰ Durée du token: 14400 secondes (4 heures)
🍪 Cookie options: { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 14400000, domain: '.vercel.app' }
```

### Frontend (Console)
```
🍪 Session cookies: Found
🍪 Session cookies found: { hasAccessToken: true, cookieLength: 1234 }
✅ Session valid, user data: {...}
```

## Étapes de Validation

1. **Déploiement** : S'assurer que les modifications backend sont déployées
2. **Cache** : Vider le cache du navigateur
3. **Cookies** : Supprimer tous les cookies existants
4. **Test** : Effectuer une connexion complète
5. **Vérification** : Confirmer la persistance de session

## Configuration Alternative

Si le problème persiste, essayer une configuration plus permissive :

```typescript
// Backend - Configuration alternative
const cookieOptions = {
  httpOnly: false, // Permettre l'accès JavaScript
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // Plus permissif
  maxAge: customExpiresIn * 1000,
  path: '/',
  // Pas de domaine spécifique
};
```

## Prochaines Étapes

Une fois les cookies fonctionnels :
1. Tester la persistance de session
2. Vérifier la gestion des rôles
3. Réimplémenter les fonctionnalités admin
4. Optimiser les performances 