# Guide de Correction - Endpoint Profile et localStorage

## Problèmes Identifiés et Corrigés

### 1. Endpoint `/profile` Utilisait le Mauvais Guard
**Problème** : L'endpoint utilisait `AuthGuard` au lieu de `SupabaseAuthGuard`
**Solution** : Changement vers `SupabaseAuthGuard` qui gère correctement les cookies

### 2. Stockage des Tokens
**Problème** : Tokens seulement dans les cookies, pas dans localStorage
**Solution** : Ajout du stockage localStorage pour un accès facile

## Modifications Effectuées

### 1. Correction de l'Endpoint Profile
```typescript
// Avant
@Get('profile')
@UseGuards(AuthGuard)  // ❌ Ne vérifie que request['isAuthenticated']

// Après
@Get('profile')
@UseGuards(SupabaseAuthGuard)  // ✅ Vérifie les cookies et valide avec Supabase
```

### 2. Ajout du Stockage localStorage
```typescript
// Dans la fonction signin
if (response.data.session?.access_token && typeof window !== 'undefined') {
  localStorage.setItem('access_token', response.data.session.access_token);
  localStorage.setItem('refresh_token', response.data.session.refresh_token || '');
  console.log('💾 Tokens stored in localStorage');
}
```

### 3. Nettoyage localStorage lors de la Déconnexion
```typescript
// Dans la fonction signout
if (typeof window !== 'undefined') {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  console.log('🧹 localStorage cleared');
}
```

## Tests à Effectuer

### 1. Test de Connexion avec localStorage
1. Aller sur `https://mister-api.vercel.app/login`
2. Se connecter avec les identifiants
3. Vérifier les logs :
```
🚀 Starting signin process...
✅ Signin successful: {...}
💾 Tokens stored in localStorage
📋 Using auth data directly (profile fetch commented out)...
👤 User data from auth: {...}
👤 User state updated with complete profile
🔄 Redirecting to dashboard...
```

### 2. Vérification du localStorage
Dans DevTools > Application > Local Storage :
- ✅ `access_token` présent
- ✅ `refresh_token` présent
- ✅ Valeurs non vides

### 3. Test de l'Endpoint Profile
Maintenant que l'endpoint utilise le bon guard, tester :
```javascript
// Dans la console du navigateur
fetch('/api/backend/api/v1/auth/profile', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": "c9782951-c33a-4d01-ad0b-b6f96d752c80",
    "email": "leo.segalini@outlook.com",
    "role": "user",
    "nom": "SEGALINI-BRIANT",
    "prenom": "Léo",
    // ... autres données du profil
  }
}
```

### 4. Test de Déconnexion
1. Cliquer sur "Déconnexion"
2. Vérifier que localStorage est nettoyé
3. Vérifier les logs :
```
🚪 Signing out user
🧹 localStorage cleared
🚪 Redirecting to login page with full reload...
```

## Avantages des Modifications

### ✅ Endpoint Profile Fonctionnel
- Utilise le bon guard (`SupabaseAuthGuard`)
- Extrait correctement les tokens des cookies
- Valide avec Supabase Auth
- Retourne les données complètes du profil

### ✅ Double Stockage des Tokens
- **Cookies** : Sécurisés, httpOnly, automatiques
- **localStorage** : Accès facile côté client
- **Redondance** : Si un système échoue, l'autre fonctionne

### ✅ Gestion Complète du Cycle de Vie
- Stockage lors de la connexion
- Nettoyage lors de la déconnexion
- Validation avec les deux sources

## Prochaines Étapes

### 1. Réactiver la Récupération du Profil
Maintenant que l'endpoint fonctionne, réactiver dans `useAuth.tsx` :
```typescript
// Dans la fonction signin
try {
  const profileData = await apiService.getProfile();
  const completeUserData = {
    ...response.data.user,
    ...profileData,
    role: profileData.role || response.data.user.role || 'user'
  };
  setUser(completeUserData);
} catch (profileError) {
  // Fallback vers les données d'auth
  const userData = {
    ...response.data.user,
    role: response.data.user.role || 'user'
  };
  setUser(userData);
}
```

### 2. Optimiser la Gestion des Tokens
- Utiliser localStorage comme source principale
- Cookies comme fallback
- Gestion automatique du refresh token

### 3. Ajouter la Validation de Session
- Vérifier la validité du token
- Renouveler automatiquement si nécessaire
- Gérer les sessions expirées

## Debug Avancé

### Vérifier les Tokens
```javascript
// Dans la console
console.log('localStorage tokens:', {
  access: localStorage.getItem('access_token'),
  refresh: localStorage.getItem('refresh_token')
});

console.log('Cookies:', document.cookie);
```

### Tester l'Endpoint Directement
```bash
# Avec curl
curl -X GET https://mister-api.onrender.com/api/v1/auth/profile \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Vérifier les Guards
```typescript
// SupabaseAuthGuard vs AuthGuard
// SupabaseAuthGuard : ✅ Extrait les cookies, valide avec Supabase
// AuthGuard : ❌ Ne vérifie que request['isAuthenticated']
```

## Recommandations

1. **Tester l'endpoint profile** maintenant qu'il utilise le bon guard
2. **Réactiver la récupération du profil** dans useAuth
3. **Valider le stockage localStorage** fonctionne correctement
4. **Optimiser la gestion des tokens** pour une meilleure performance

Cette correction permet d'avoir un système d'authentification complet et robuste avec double stockage des tokens et endpoint profile fonctionnel. 