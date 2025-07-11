# Debug du Problème de Déconnexion Automatique

## Problème identifié

Après la connexion, l'utilisateur est automatiquement déconnecté. Les logs montrent que la connexion réussit côté backend, mais il y a probablement un problème lors de la récupération du profil utilisateur qui cause une erreur 401.

## Modifications apportées pour le debug

### 1. Backend - Guard d'authentification (`supabase-auth.guard.ts`)
- ✅ Ajout de logs détaillés pour diagnostiquer le problème
- ✅ Gestion plus tolérante des erreurs de récupération de profil
- ✅ Fallback vers les données de base si le profil n'est pas trouvé
- ✅ Interface TypeScript pour le profil utilisateur

## Comment diagnostiquer

### 1. Redéployer le backend avec les logs de debug
```bash
# Dans le dossier backend-mister-api
git add .
git commit -m "Debug: Ajout de logs détaillés dans le guard d'authentification"
git push
```

### 2. Tester la connexion et observer les logs
1. Allez sur la page de connexion (`/login`)
2. Connectez-vous avec votre compte premium
3. Observez les logs du backend pour voir :
   - Si le guard est appelé
   - Si le token est trouvé et vérifié
   - Si la récupération du profil réussit ou échoue
   - Quelle erreur exacte se produit

### 3. Logs attendus dans le backend
```
[Nest] DEBUG [SupabaseAuthGuard] 🔍 [GUARD] Checking authentication for GET /api/v1/auth/profile
[Nest] DEBUG [SupabaseAuthGuard] 🔑 [GUARD] Token found, length: XXX
[Nest] DEBUG [SupabaseAuthGuard] 🔐 [GUARD] Verifying token with Supabase...
[Nest] DEBUG [SupabaseAuthGuard] ✅ [GUARD] Token verified for user: leo.segalini@outlook.com
[Nest] DEBUG [SupabaseAuthGuard] 📋 [GUARD] Fetching user profile for ID: c9782951-c33a-4d01-ad0b-b6f96d752c80
[Nest] DEBUG [SupabaseAuthGuard] ✅ [GUARD] User profile loaded: found (is_premium: true)
[Nest] DEBUG [SupabaseAuthGuard] ✅ [GUARD] Authentication successful for: leo.segalini@outlook.com (premium: true)
```

### 4. Logs d'erreur possibles
Si le profil n'est pas trouvé :
```
[Nest] WARN [SupabaseAuthGuard] ⚠️ [GUARD] Could not fetch user profile for c9782951-c33a-4d01-ad0b-b6f96d752c80: [erreur spécifique]
[Nest] DEBUG [SupabaseAuthGuard] 📋 [GUARD] Using basic auth user data as fallback
```

Si le token est invalide :
```
[Nest] DEBUG [SupabaseAuthGuard] ❌ [GUARD] Token verification failed
```

## Scénarios de test

### Scénario 1 : Connexion normale
1. Connectez-vous avec des identifiants valides
2. Vérifiez que vous êtes redirigé vers le dashboard
3. Vérifiez que le statut premium s'affiche
4. Rechargez la page pour tester la persistance

### Scénario 2 : Test de persistance
1. Connectez-vous
2. Rechargez la page du dashboard (F5)
3. Vérifiez que vous restez connecté
4. Vérifiez que le statut premium est toujours affiché

### Scénario 3 : Test de déconnexion
1. Connectez-vous
2. Cliquez sur "Déconnexion"
3. Vérifiez que vous êtes redirigé vers la page de connexion
4. Vérifiez que le token est supprimé du localStorage

## Points de vérification

### ✅ Connexion réussie
- Pas d'erreur 401 dans les logs du backend
- Token stocké dans le localStorage
- Redirection vers le dashboard

### ✅ Persistance de session
- Le statut premium reste affiché après rechargement
- Pas de redirection automatique vers la page de connexion
- Token toujours présent dans le localStorage

### ✅ Logs de debug
- Tous les logs du guard apparaissent dans l'ordre
- Pas d'erreur lors de la récupération du profil
- Statut premium correctement récupéré

## En cas de problème persistant

### Si la déconnexion automatique persiste :
1. **Vérifier les logs du backend** pour identifier l'erreur exacte
2. **Vérifier la base de données** pour s'assurer que le profil utilisateur existe
3. **Tester l'endpoint API directement** avec curl
4. **Vérifier les permissions Supabase** pour l'accès à la table `users`

### Si le profil n'est pas trouvé :
1. Vérifier que l'utilisateur existe dans la table `public.users`
2. Vérifier les permissions RLS (Row Level Security) sur Supabase
3. Vérifier que le trigger de création de profil fonctionne

### Si le token est invalide :
1. Vérifier la configuration Supabase
2. Vérifier que le token n'est pas expiré
3. Vérifier la synchronisation entre auth.users et public.users

## Commandes de test

### Test de l'endpoint profile directement
```bash
# Récupérer le token depuis le localStorage du navigateur
TOKEN="votre_token_ici"

curl -H "Authorization: Bearer $TOKEN" \
     https://mister-api.onrender.com/api/v1/auth/profile
```

### Vérification de la base de données
```sql
-- Vérifier que l'utilisateur existe dans public.users
SELECT id, email, is_premium, premium_expires_at 
FROM public.users 
WHERE id = 'c9782951-c33a-4d01-ad0b-b6f96d752c80';

-- Vérifier les permissions RLS
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## Logs de debug à surveiller

Dans la console du navigateur :
```
🔐 Initializing authentication...
🔑 Token in localStorage: Found
🔍 Token found, validating session...
✅ Session valid, user data: {id: '...', is_premium: true, ...}
```

Dans les logs du backend :
```
[Nest] DEBUG [SupabaseAuthGuard] 🔍 [GUARD] Checking authentication for GET /api/v1/auth/profile
[Nest] DEBUG [SupabaseAuthGuard] ✅ [GUARD] Authentication successful for: leo.segalini@outlook.com (premium: true)
``` 