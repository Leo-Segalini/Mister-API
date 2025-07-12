# Guide de Débogage - Problème de Connexion Admin

## Problème Identifié

L'utilisateur se connecte avec `leo@iroko.io` mais le système essaie de récupérer le profil de `leo.segalini@outlook.com`.

## Logs d'Erreur

```
[Nest] 130  - 07/12/2025, 8:04:29 AM     LOG [AuthController] 🚀 Début de la connexion pour: leo@iroko.io
[Nest] 130  - 07/12/2025, 8:04:29 AM     LOG [SupabaseService] 🔐 Tentative de connexion pour: leo@iroko.io
[Nest] 130  - 07/12/2025, 8:04:29 AM     LOG [SupabaseService] ✅ Profil trouvé dans public.users - ID: 0ca57006-fad4-43cd-9216-8fcd08594f91, Rôle: admin
[Nest] 130  - 07/12/2025, 8:04:29 AM    WARN [SupabaseService] ⚠️ Vérification auth.users échouée: User not allowed
[Nest] 130  - 07/12/2025, 8:04:29 AM     LOG [SupabaseService] 🔑 Tentative de connexion avec Supabase Auth...
[Nest] 130  - 07/12/2025, 8:04:30 AM     LOG [SupabaseService] ✅ Connexion réussie pour: leo@iroko.io
[Nest] 130  - 07/12/2025, 8:04:30 AM     LOG [SupabaseService] 🆔 User ID: 0ca57006-fad4-43cd-9216-8fcd08594f91
[Nest] 130  - 07/12/2025, 8:04:30 AM     LOG [AuthController] 👤 Récupération du profil pour: leo.segalini@outlook.com
```

## Analyse du Problème

### 1. Connexion Réussie
- ✅ L'utilisateur `leo@iroko.io` se connecte avec succès
- ✅ L'ID utilisateur est correct : `0ca57006-fad4-43cd-9216-8fcd08594f91`
- ✅ Le rôle admin est confirmé

### 2. Problème de Récupération du Profil
- ❌ Le système essaie de récupérer le profil de `leo.segalini@outlook.com` au lieu de `leo@iroko.io`
- ❌ Cela suggère une incohérence entre `auth.users` et `public.users`

## Causes Possibles

### 1. Incohérence dans la Base de Données
```sql
-- Vérifier les données dans auth.users
SELECT id, email FROM auth.users WHERE id = '0ca57006-fad4-43cd-9216-8fcd08594f91';

-- Vérifier les données dans public.users
SELECT id, email FROM public.users WHERE id = '0ca57006-fad4-43cd-9216-8fcd08594f91';
```

### 2. Problème de Token
- Le token pourrait contenir des informations d'un autre utilisateur
- Problème de cache ou de session

### 3. Problème dans le Guard
- Le guard pourrait récupérer les mauvaises informations depuis le token

## Solutions Implémentées

### 1. Correction du Guard
```typescript
// backend-mister-api/src/controllers/auth.controller.ts
@Get('check-admin-role')
@UseGuards(SupabaseAuthGuard) // ← Changé de AuthGuard à SupabaseAuthGuard
```

### 2. Ajout de Logs de Débogage
```typescript
// backend-mister-api/src/guards/supabase-auth.guard.ts
console.log(`🔍 [GUARD] Auth user from token: ${authUser.email} (ID: ${authUser.id})`);
console.log(`🔍 [GUARD] Profile from public.users: ${userProfile?.email} (ID: ${userProfile?.id})`);
```

## Tests à Effectuer

### Test 1 : Vérification de la Base de Données
```sql
-- Vérifier la cohérence des emails
SELECT 
  au.id,
  au.email as auth_email,
  pu.email as public_email,
  pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.id = '0ca57006-fad4-43cd-9216-8fcd08594f91';
```

### Test 2 : Test de Connexion avec Postman
1. **Connexion** : `POST /api/v1/auth/login`
   ```json
   {
     "email": "leo@iroko.io",
     "password": "votre_mot_de_passe"
   }
   ```

2. **Récupération du Profil** : `GET /api/v1/auth/profile`
   - Headers : `Authorization: Bearer <token>`

3. **Vérification du Rôle Admin** : `GET /api/v1/auth/check-admin-role`
   - Headers : `Authorization: Bearer <token>`

### Test 3 : Test de la Page Admin
1. Aller sur `https://mister-api.vercel.app/admin-login`
2. Se connecter avec `leo@iroko.io`
3. Vérifier les logs dans la console du navigateur
4. Vérifier les logs du backend

## Commandes de Débogage

### 1. Vérifier les Logs du Backend
```bash
# Dans le terminal du backend
npm run start:dev
# Puis observer les logs lors de la connexion
```

### 2. Vérifier les Cookies
```javascript
// Dans la console du navigateur
console.log('Cookies:', document.cookie);
console.log('LocalStorage:', localStorage);
```

### 3. Vérifier les Requêtes Réseau
- Ouvrir les DevTools du navigateur
- Aller dans l'onglet Network
- Effectuer une connexion admin
- Vérifier les requêtes vers `/api/v1/auth/profile`

## Solutions de Contournement

### Solution Temporaire 1 : Utiliser l'Endpoint `/me`
```typescript
// Au lieu de getProfile(), utiliser getMe()
const userData = await apiService.getMe();
```

### Solution Temporaire 2 : Désactiver la Récupération du Profil
```typescript
// Dans useAuth.tsx, commenter temporairement
// const profileData = await apiService.getProfile();
```

## Prochaines Étapes

### 1. Vérification Immédiate
- ✅ Tester la connexion avec les nouveaux logs
- ✅ Vérifier la cohérence des données en base
- ✅ Identifier la source de l'incohérence

### 2. Correction Permanente
- 🔄 Corriger l'incohérence dans la base de données si nécessaire
- 🔄 Améliorer la gestion des tokens
- 🔄 Ajouter des validations supplémentaires

### 3. Tests de Validation
- 🔄 Tester la connexion admin complète
- 🔄 Vérifier que le bon profil est récupéré
- 🔄 Confirmer que l'accès admin fonctionne

## Logs Attendus Après Correction

```
🔍 [GUARD] Auth user from token: leo@iroko.io (ID: 0ca57006-fad4-43cd-9216-8fcd08594f91)
🔍 [GUARD] Profile from public.users: leo@iroko.io (ID: 0ca57006-fad4-43cd-9216-8fcd08594f91)
👤 Récupération du profil pour: leo@iroko.io (ID: 0ca57006-fad4-43cd-9216-8fcd08594f91)
```

## Conclusion

Le problème semble être une incohérence entre les tables `auth.users` et `public.users`. Les corrections apportées devraient résoudre le problème de récupération du profil et permettre une connexion admin fonctionnelle. 