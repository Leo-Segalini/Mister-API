# Guide de Test - Reconnexion Automatique

## Problème Résolu

L'erreur `ReferenceError: Cannot access 'attemptTokenRefresh' before initialization` a été corrigée en réorganisant l'ordre des fonctions dans le hook `useAuth`.

## Corrections Appliquées

### 1. Réorganisation des Fonctions dans useAuth

**Fichier** : `mister-api/hooks/useAuth.tsx`

**Problème** : La fonction `validateSession` utilisait `attemptTokenRefresh` avant qu'elle soit définie.

**Solution** : Déplacer `attemptTokenRefresh` avant `validateSession`.

```typescript
// AVANT (problématique)
const validateSession = useCallback(async (): Promise<boolean> => {
  // ... utilisait attemptTokenRefresh
}, [user, attemptTokenRefresh]);

const attemptTokenRefresh = useCallback(async (): Promise<boolean> => {
  // ... définie après
}, []);

// APRÈS (corrigé)
const attemptTokenRefresh = useCallback(async (): Promise<boolean> => {
  // ... définie en premier
}, []);

const validateSession = useCallback(async (): Promise<boolean> => {
  // ... peut maintenant utiliser attemptTokenRefresh
}, [user, attemptTokenRefresh]);
```

### 2. Amélioration de la Logique de Reconnexion

**Fonctionnalités ajoutées** :
- Vérification des cookies avant d'appeler l'API
- Gestion des erreurs réseau (ne déconnecte pas si erreur réseau)
- Tentative automatique de refresh du token
- Logs détaillés pour le débogage

### 3. Amélioration du Composant ProtectedRoute

**Fichier** : `mister-api/components/ProtectedRoute.tsx`

**Améliorations** :
- Attente de l'initialisation complète avant redirection
- Messages d'état plus clairs
- Gestion des permissions admin
- Interface utilisateur améliorée

## Tests de Validation

### Test 1 : Vérification de l'Erreur Corrigée

1. **Redémarrez le frontend** :
   ```bash
   cd mister-api
   npm run dev
   ```

2. **Vérifiez** qu'il n'y a plus d'erreur dans la console :
   ```
   ✅ Pas d'erreur "Cannot access 'attemptTokenRefresh' before initialization"
   ```

### Test 2 : Reconnexion Automatique

1. **Connectez-vous** avec vos identifiants
2. **Vérifiez** que vous êtes sur `/dashboard`
3. **Rechargez la page** (F5)
4. **Vérifiez** que vous restez connecté automatiquement

**Logs attendus** :
```
🔐 Initializing authentication...
🔍 Validating session...
🍪 Session cookies found, validating with backend...
✅ Session valid, user data: {user object}
✅ Valid session found, user authenticated
🏁 Auth initialization complete
```

### Test 3 : Test avec Cookies Existants

1. **Vérifiez** que vous avez les cookies :
   - `access_token` (présent)
   - `refresh_token` (présent)

2. **Ouvrez une nouvelle fenêtre** et allez sur `http://localhost:3000/dashboard`

3. **Vérifiez** que vous êtes automatiquement connecté

### Test 4 : Test de Refresh Token

1. **Attendez** que le token expire (ou simulez une expiration)
2. **Rechargez la page**
3. **Vérifiez** que le refresh automatique fonctionne

**Logs attendus** :
```
🔄 Token expired, attempting refresh...
🔄 Attempting token refresh...
✅ Token refreshed, user data: {user object}
✅ Token refreshed successfully
```

## Vérification des Cookies

### Dans les Outils de Développement

1. **Ouvrez** F12 > Application > Cookies > localhost:3000
2. **Vérifiez** la présence de :
   ```
   access_token: eyJhbGciOiJIUzI1NiIs...
   refresh_token: mqwf3n76i7h5
   ```

### Test Direct de l'API

**Dans la console du navigateur** :
```javascript
// Test de l'endpoint profile avec cookies
fetch('http://localhost:3001/api/v1/auth/profile', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log('Profile:', data))
.catch(error => console.error('Error:', error));
```

## Dépannage

### Si la reconnexion ne fonctionne pas

1. **Vérifiez les logs** dans la console du navigateur
2. **Vérifiez** que le backend répond sur `/health`
3. **Vérifiez** que les cookies sont bien présents
4. **Testez** l'API directement avec curl

### Si vous voyez encore des erreurs

1. **Videz le cache** du navigateur (Ctrl+Shift+R)
2. **Redémarrez** le frontend et le backend
3. **Vérifiez** les logs du backend pour les erreurs CORS

## Commandes de Test

```bash
# Test de l'endpoint health
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET

# Test de l'endpoint profile
Invoke-WebRequest -Uri "http://localhost:3001/api/v1/auth/profile" -Method GET

# Vérification des processus
netstat -ano | findstr :3001
```

## Résumé des Améliorations

✅ **Erreur de référence corrigée**  
✅ **Reconnexion automatique fonctionnelle**  
✅ **Gestion robuste des erreurs**  
✅ **Interface utilisateur améliorée**  
✅ **Logs détaillés pour le débogage**  

**La reconnexion automatique devrait maintenant fonctionner correctement !** 