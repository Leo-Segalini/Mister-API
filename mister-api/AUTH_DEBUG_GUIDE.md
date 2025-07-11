# Guide de Débogage - Problèmes de Connexion

## 🔍 Problème Identifié

Après les modifications du hook `useAuth`, les utilisateurs sont automatiquement redirigés vers la page de connexion même après une connexion réussie.

## 🛠️ Corrections Apportées

### 1. **Modification de la fonction `signin`**
- **Problème** : Tentative immédiate de récupération du profil complet après connexion
- **Solution** : Utilisation d'abord des données de base, puis récupération asynchrone du profil

```typescript
// AVANT (problématique)
const userProfile = await apiService.getProfile();
setUser(userProfile);

// APRÈS (corrigé)
setUser(response.data.user); // Données de base immédiatement
setTimeout(async () => {
  // Récupération du profil complet après 1 seconde
  const userProfile = await apiService.getProfile();
  setUser(userProfile);
}, 1000);
```

### 2. **Ajout de `/profile` aux pages protégées**
- **Problème** : La page profil n'était pas dans la liste des pages protégées
- **Solution** : Ajout de `/profile` à la liste des `protectedPaths`

## 🧪 Tests de Vérification

### Test 1 : Connexion Simple
1. **Vider le cache** du navigateur
2. **Aller sur** `/login`
3. **Se connecter** avec vos identifiants
4. **Vérifier** que vous êtes redirigé vers `/dashboard`
5. **Vérifier** dans la console les logs :
   ```
   🚀 Starting signin process...
   ✅ Signin successful: {...}
   👤 Utilisation des données de base de la connexion
   👤 Tentative de récupération du profil complet...
   ✅ Profil complet récupéré: {...}
   ```

### Test 2 : Vérification du Token
1. **Ouvrir F12** (Outils de développement)
2. **Aller dans l'onglet Application/Storage**
3. **Vérifier** que `access_token` est présent dans localStorage
4. **Vérifier** que le token n'est pas vide

### Test 3 : Test de Persistance
1. **Se connecter** avec succès
2. **Recharger la page** (F5)
3. **Vérifier** que vous restez connecté
4. **Vérifier** que vous n'êtes pas redirigé vers `/login`

### Test 4 : Test de la Page Profil
1. **Se connecter** avec succès
2. **Aller sur** `/profile`
3. **Vérifier** que la page s'affiche correctement
4. **Vérifier** que vous n'êtes pas redirigé vers `/login`

## 🔧 Débogage Avancé

### Vérification des Logs Backend
Dans les logs du backend, vous devriez voir :
```
[Nest] DEBUG [SupabaseAuthMiddleware] ✅ Token verified for user: ...
[Nest] DEBUG [SupabaseAuthMiddleware] ✅ User authenticated: ...
```

### Vérification des Logs Frontend
Dans la console du navigateur, vous devriez voir :
```
🔐 Initializing authentication...
🔑 Token in localStorage: Found
🔍 Token found, validating session...
✅ Session valid, user data: {...}
```

### Problèmes Courants

#### 1. **Token non stocké**
**Symptômes** : Redirection immédiate vers `/login`
**Solution** : Vérifier que `localStorage.setItem('access_token', token)` est appelé

#### 2. **Erreur 401 lors de la validation**
**Symptômes** : Connexion réussie mais redirection après validation
**Solution** : Vérifier que le token est bien envoyé dans les headers

#### 3. **Erreur réseau**
**Symptômes** : Timeout ou erreur de connexion
**Solution** : Vérifier que le backend est accessible

## 🚀 Étapes de Résolution

### Si le problème persiste :

1. **Vider complètement le cache** :
   ```javascript
   // Dans la console du navigateur
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Vérifier les cookies** :
   - Ouvrir F12 → Application → Cookies
   - Vérifier que les cookies d'authentification sont présents

3. **Tester en navigation privée** :
   - Ouvrir une fenêtre de navigation privée
   - Tester la connexion

4. **Vérifier les erreurs réseau** :
   - F12 → Network
   - Vérifier que les requêtes vers `/api/v1/auth/profile` retournent 200

## 📝 Logs Attendus

### Connexion Réussie
```
🚀 Starting signin process...
✅ Signin successful: {success: true, data: {...}}
👤 Utilisation des données de base de la connexion
👤 Tentative de récupération du profil complet...
✅ Profil complet récupéré: {id: '...', is_premium: true, ...}
```

### Validation de Session
```
🔐 Initializing authentication...
🔑 Token in localStorage: Found
🔍 Token found, validating session...
✅ Session valid, user data: {...}
🏁 Auth initialization complete
```

## 🔒 Sécurité

- Les tokens sont stockés dans `localStorage` avec `httpOnly: false`
- Les cookies sont configurés avec `sameSite: 'none'` pour le cross-origin
- La validation de session se fait côté serveur
- Les erreurs réseau ne déclenchent pas de déconnexion automatique

## 📞 Support

Si le problème persiste après ces corrections :
1. Vérifiez les logs complets (frontend + backend)
2. Testez avec un utilisateur différent
3. Vérifiez la configuration CORS du backend
4. Contactez le support avec les logs d'erreur 