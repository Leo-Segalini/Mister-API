# Guide de Vérification du Rôle Admin

Ce guide explique comment tester la nouvelle fonctionnalité de vérification du rôle admin dans la table `public.users`.

## 🎯 Objectif

Vérifier que l'utilisateur a bien le rôle `admin` dans la table `public.users` avant de lui donner accès au dashboard administrateur.

## 🔧 Fonctionnement

### **Côté Frontend (Next.js)**
- Le hook `useAdmin` fait un appel API vers `/api/v1/auth/check-admin-role`
- L'API vérifie le rôle dans la table `public.users`
- Si le rôle n'est pas `admin`, l'utilisateur est redirigé

### **Côté Backend (NestJS)**
- Endpoint : `GET /api/v1/auth/check-admin-role`
- Vérifie le rôle dans la table `public.users` via `supabaseService.getUserRole()`
- Retourne `{ isAdmin: boolean, role: string }`

## 🧪 Tests de la Fonctionnalité

### 1. **Test avec un Utilisateur Admin**

#### Étape 1 : Vérifier le rôle dans Supabase
```sql
-- Dans l'éditeur SQL de Supabase
SELECT id, email, role FROM public.users WHERE email = 'leo@iroko.io';
-- Doit retourner : role = 'admin'
```

#### Étape 2 : Tester la connexion admin
1. **Aller sur** : `https://mister-api.vercel.app/gestion-administrateur-login`
2. **Se connecter** avec `leo@iroko.io`
3. **Vérifier** que vous êtes redirigé vers `/admin`

#### Étape 3 : Vérifier les logs backend
```bash
# Dans les logs du backend, vous devriez voir :
🔍 Vérification du rôle admin pour: leo@iroko.io
🔍 Résultat de la vérification admin pour leo@iroko.io: isAdmin=true, role=admin
```

### 2. **Test avec un Utilisateur Non-Admin**

#### Étape 1 : Vérifier le rôle dans Supabase
```sql
-- Dans l'éditeur SQL de Supabase
SELECT id, email, role FROM public.users WHERE email = 'user@example.com';
-- Doit retourner : role = 'user' ou NULL
```

#### Étape 2 : Tester la connexion admin
1. **Aller sur** : `https://mister-api.vercel.app/gestion-administrateur-login`
2. **Se connecter** avec un utilisateur non-admin
3. **Vérifier** que vous êtes redirigé vers `/dashboard` (pas `/admin`)

#### Étape 3 : Vérifier les logs backend
```bash
# Dans les logs du backend, vous devriez voir :
🔍 Vérification du rôle admin pour: user@example.com
🔍 Résultat de la vérification admin pour user@example.com: isAdmin=false, role=user
```

### 3. **Test de l'API Directement**

#### Test avec curl
```bash
# Remplacer YOUR_ACCESS_TOKEN par un vrai token
curl -X GET "https://mister-api.onrender.com/api/v1/auth/check-admin-role" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Réponse attendue pour un admin
```json
{
  "success": true,
  "message": "Rôle vérifié avec succès",
  "data": {
    "isAdmin": true,
    "role": "admin"
  }
}
```

#### Réponse attendue pour un user
```json
{
  "success": true,
  "message": "Rôle vérifié avec succès",
  "data": {
    "isAdmin": false,
    "role": "user"
  }
}
```

## 🔍 Debugging

### **Vérifier les Logs Frontend**
Ouvrir la console du navigateur et chercher :
```
🔍 Checking admin role in public.users...
🔍 Admin role check result: { isAdmin: true, role: "admin" }
```

### **Vérifier les Logs Backend**
Dans les logs du serveur, chercher :
```
🔍 Vérification du rôle admin pour: email@example.com
🔍 Résultat de la vérification admin pour email@example.com: isAdmin=true, role=admin
```

### **Vérifier la Base de Données**
```sql
-- Vérifier que l'utilisateur existe dans public.users
SELECT id, email, role, created_at 
FROM public.users 
WHERE email = 'leo@iroko.io';

-- Vérifier tous les utilisateurs admin
SELECT id, email, role 
FROM public.users 
WHERE role = 'admin';
```

## 🛠️ Attribution Manuelle du Rôle Admin

Si vous devez attribuer le rôle admin à un utilisateur :

```sql
-- Dans l'éditeur SQL de Supabase
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## 🚨 Problèmes Courants

### **Erreur "Utilisateur non authentifié"**
- Vérifier que le token d'authentification est valide
- Vérifier que l'utilisateur est bien connecté

### **Erreur "Rôle non trouvé"**
- Vérifier que l'utilisateur existe dans `public.users`
- Vérifier que la colonne `role` existe

### **Redirection incorrecte**
- Vérifier que le hook `useAdmin` fonctionne correctement
- Vérifier que les routes sont bien configurées

## 📝 Notes Importantes

1. **Sécurité** : La vérification se fait côté serveur, pas côté client
2. **Performance** : L'appel API est fait à chaque vérification d'accès admin
3. **Cache** : Pas de cache pour le moment, chaque vérification est en temps réel
4. **Logs** : Toutes les vérifications sont loggées pour audit

## 🎉 Résultat Attendu

Après implémentation, le système devrait :
- ✅ Vérifier le rôle dans `public.users` avant d'accorder l'accès admin
- ✅ Rediriger les utilisateurs non-admin vers le dashboard
- ✅ Logger toutes les tentatives d'accès admin
- ✅ Fonctionner de manière sécurisée et fiable

Votre système de vérification du rôle admin est maintenant opérationnel ! 