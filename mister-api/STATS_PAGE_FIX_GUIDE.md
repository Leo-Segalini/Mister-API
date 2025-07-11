# Guide de Test - Page des Statistiques Corrigée

## Problèmes Identifiés et Corrigés

### 1. Double Protection d'Authentification
**Problème** : La page utilisait `AuthGuard` ET `ProtectedRoute` en double
**Solution** : Suppression d'`AuthGuard`, conservation de `ProtectedRoute` uniquement

### 2. Gestion des Erreurs d'Authentification
**Problème** : Pas de gestion spécifique des erreurs 401/Unauthorized
**Solution** : Ajout de gestion spécifique avec redirection vers login

### 3. Types API Incorrects
**Problème** : `getApiKeyStats` retournait `any` au lieu de `ApiKeyUsageStats`
**Solution** : Correction du type de retour

## Modifications Apportées

### Frontend (`mister-api/app/stats/page.tsx`)

1. **Suppression du double AuthGuard** :
   ```typescript
   // AVANT
   <AuthGuard>
     <ProtectedRoute>
       <StatsContent />
     </ProtectedRoute>
   </AuthGuard>
   
   // APRÈS
   <ProtectedRoute>
     <StatsContent />
   </ProtectedRoute>
   ```

2. **Amélioration de la gestion d'état** :
   ```typescript
   const { user, isAuthenticated, isLoading: authLoading } = useAuth();
   const [error, setError] = useState<string | null>(null);
   ```

3. **Gestion spécifique des erreurs d'authentification** :
   ```typescript
   if (error.message && error.message.includes('401') || error.message.includes('Unauthorized')) {
     setError('Session expirée. Veuillez vous reconnecter.');
     showError('Erreur d\'authentification', 'Votre session a expiré. Veuillez vous reconnecter.');
     return;
   }
   ```

4. **Attente de l'authentification** :
   ```typescript
   useEffect(() => {
     const initializeData = async () => {
       if (authLoading) return;
       if (!isAuthenticated) return;
       await loadApiKeys();
       setIsLoading(false);
     };
     initializeData();
   }, [authLoading, isAuthenticated]);
   ```

### Service API (`mister-api/lib/api.ts`)

1. **Correction du type de retour** :
   ```typescript
   // AVANT
   async getApiKeyStats(apiKeyId: string): Promise<any>
   
   // APRÈS
   async getApiKeyStats(apiKeyId: string): Promise<ApiKeyUsageStats>
   ```

## Tests de Validation

### Test 1 : Accès Normal à la Page

1. **Connectez-vous** à l'application
2. **Naviguez vers** `http://localhost:3000/stats`
3. **Vérifiez** que :
   - La page se charge sans erreur
   - Les clés API sont affichées
   - Les statistiques se chargent pour la première clé

### Test 2 : Gestion des Erreurs d'Authentification

1. **Ouvrez la console du navigateur** (F12)
2. **Supprimez les cookies** d'authentification :
   ```javascript
   document.cookie.split(";").forEach(function(c) { 
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
   });
   ```
3. **Rechargez la page** `/stats`
4. **Vérifiez** que vous êtes redirigé vers `/login`

### Test 3 : Session Expirée

1. **Connectez-vous** normalement
2. **Allez sur la page stats**
3. **Simulez une session expirée** en modifiant le token dans les cookies
4. **Rechargez la page**
5. **Vérifiez** que vous obtenez le message "Session expirée"

### Test 4 : Changement de Clé API

1. **Sur la page stats**, sélectionnez une autre clé API
2. **Vérifiez** que :
   - Les statistiques se rechargent automatiquement
   - Les données changent selon la clé sélectionnée
   - Pas d'erreur dans la console

## Logs Attendus

### Logs Normaux
```
📊 [STATS] Chargement des clés API...
📊 [STATS] Clés API récupérées: 3
📊 [STATS] Chargement des statistiques pour la clé: pk_273654e0...
📊 [STATS] Clé API trouvée: {id: "...", name: "Animaux", ...}
📊 [STATS] Statistiques d'utilisation récupérées: {...}
```

### Logs en Cas d'Erreur d'Authentification
```
❌ [STATS] Erreur lors du chargement des clés API: Error: 401 Unauthorized
📊 [STATS] Utilisateur non authentifié, redirection...
```

## Vérification de la Correction

### 1. Vérifier les Imports
Ouvrez `mister-api/app/stats/page.tsx` et vérifiez que :
- `AuthGuard` n'est plus importé
- Seul `ProtectedRoute` est utilisé

### 2. Vérifier la Gestion d'État
Vérifiez que le composant utilise :
```typescript
const { user, isAuthenticated, isLoading: authLoading } = useAuth();
const [error, setError] = useState<string | null>(null);
```

### 3. Vérifier les Types
Ouvrez `mister-api/lib/api.ts` et vérifiez que :
```typescript
async getApiKeyStats(apiKeyId: string): Promise<ApiKeyUsageStats>
```

## Dépannage

### Si la page ne se charge toujours pas

1. **Vérifiez les logs du backend** :
   ```bash
   cd backend-mister-api
   npm run start:dev
   ```

2. **Vérifiez la console du navigateur** pour les erreurs JavaScript

3. **Testez l'API directement** :
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/v1/api-keys
   ```

### Si vous êtes toujours redirigé vers login

1. **Vérifiez que vous êtes bien connecté** sur `/dashboard`
2. **Vérifiez les cookies** dans les outils de développement
3. **Testez la connexion** avec l'API directement

### Si les statistiques ne s'affichent pas

1. **Vérifiez que vous avez des clés API** créées
2. **Vérifiez que les clés ont été utilisées** (sinon pas de stats)
3. **Testez l'endpoint des stats** directement

## Commandes de Test

```bash
# Redémarrer le frontend
cd mister-api
npm run dev

# Redémarrer le backend
cd backend-mister-api
npm run start:dev

# Tester l'API des clés
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/v1/api-keys

# Tester l'API des stats
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/v1/api-keys/KEY_ID/stats
```

## Résumé

La page des statistiques devrait maintenant :
- ✅ Se charger correctement sans redirection intempestive
- ✅ Gérer les erreurs d'authentification proprement
- ✅ Afficher les vraies données des clés API
- ✅ Permettre de changer de clé API
- ✅ Rediriger vers login si la session expire

**Testez maintenant la page `/stats` et vérifiez qu'elle fonctionne correctement !** 