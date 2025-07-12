# Guide de Configuration des Rôles Supabase

Ce guide explique comment configurer les rôles "admin" et "user" dans Supabase pour votre application Punchiline API.

## 🎯 Objectif

Configurer un système de rôles complet avec :
- **Rôle "user"** : Utilisateurs standard avec permissions limitées
- **Rôle "admin"** : Administrateurs avec accès complet
- **Attribution automatique** : Tous les nouveaux utilisateurs reçoivent le rôle "user" par défaut

## 📋 Prérequis

- Accès à votre projet Supabase
- Permissions d'administrateur sur la base de données
- Connaissance de base de SQL

## 🚀 Étapes de Configuration

### 1. Exécution du Script SQL

1. **Ouvrir l'éditeur SQL de Supabase**
   - Connectez-vous à votre projet Supabase
   - Allez dans la section "SQL Editor"
   - Cliquez sur "New query"

2. **Copier et exécuter le script**
   - Ouvrez le fichier `backend-mister-api/sql/create_admin_role.sql`
   - Copiez tout le contenu
   - Collez-le dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" pour exécuter le script

### 2. Vérification de l'Exécution

Le script va automatiquement :
- ✅ Créer les rôles "user" et "admin"
- ✅ Créer les fonctions de vérification des rôles
- ✅ Configurer le trigger pour attribuer automatiquement le rôle "user"
- ✅ Mettre à jour les utilisateurs existants sans rôle
- ✅ Configurer les politiques RLS (Row Level Security)
- ✅ Attribuer les permissions appropriées

### 3. Messages de Confirmation

Vous devriez voir ces messages dans la console :
```
NOTICE: Rôle "user" créé avec succès
NOTICE: Rôle "admin" créé avec succès
NOTICE: Rôle "user" attribué automatiquement à l'utilisateur [UUID]
NOTICE: Configuration des rôles terminée avec succès!
NOTICE: Tous les nouveaux utilisateurs auront automatiquement le rôle "user"
NOTICE: Les utilisateurs existants sans rôle ont été mis à jour avec le rôle "user"
```

## 🔧 Fonctionnalités Créées

### Rôles
- **"user"** : Rôle par défaut pour tous les utilisateurs
- **"admin"** : Rôle pour les administrateurs

### Fonctions Utilitaires
- `is_admin(user_id)` : Vérifie si un utilisateur est admin
- `is_user(user_id)` : Vérifie si un utilisateur a le rôle user
- `get_user_role(user_id)` : Récupère le rôle d'un utilisateur
- `set_default_user_role()` : Fonction trigger pour attribution automatique

### Trigger Automatique
- **Nom** : `set_default_user_role_trigger`
- **Action** : Attribue automatiquement le rôle "user" aux nouveaux utilisateurs
- **Déclencheur** : Avant l'insertion dans `auth.users`

### Politiques RLS
- **Lecture publique** : Punchlines, animaux, pays
- **Gestion utilisateur** : Clés API, logs, paiements, newsletter
- **Accès admin complet** : Toutes les tables

## 🧪 Test de la Configuration

### 1. Vérifier les Rôles Créés
```sql
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin 
FROM pg_roles 
WHERE rolname IN ('user', 'admin');
```

### 2. Vérifier les Fonctions
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_user', 'get_user_role', 'set_default_user_role');
```

### 3. Vérifier le Trigger
```sql
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'set_default_user_role_trigger';
```

### 4. Vérifier les Utilisateurs
```sql
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as role,
    created_at
FROM auth.users 
ORDER BY created_at DESC;
```

## 🔄 Attribution Manuelle des Rôles

### Pour Attribuer le Rôle Admin
```sql
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

### Pour Attribuer le Rôle User
```sql
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "user"}'::jsonb
WHERE email = 'user@example.com';
```

## 🛡️ Sécurité

### Politiques RLS Configurées
- **Utilisateurs** : Accès limité à leurs propres données
- **Admins** : Accès complet à toutes les données
- **Public** : Lecture seule sur les données publiques

### Permissions par Rôle
- **"user"** : Lecture publique + gestion de ses propres données
- **"admin"** : Accès complet à toutes les tables et fonctions

## 🔍 Dépannage

### Erreur "role does not exist"
- Vérifiez que le script a été exécuté complètement
- Relancez le script si nécessaire

### Utilisateur sans rôle
- Le trigger devrait attribuer automatiquement le rôle "user"
- Vérifiez que le trigger existe : `SELECT * FROM pg_trigger WHERE tgname = 'set_default_user_role_trigger';`

### Problèmes de permissions
- Vérifiez les politiques RLS : `SELECT * FROM pg_policies;`
- Vérifiez les permissions : `SELECT * FROM information_schema.table_privileges WHERE grantee = 'user';`

## 📝 Notes Importantes

1. **Nouveaux utilisateurs** : Reçoivent automatiquement le rôle "user"
2. **Utilisateurs existants** : Ont été mis à jour avec le rôle "user" s'ils n'en avaient pas
3. **Sécurité** : Les politiques RLS protègent les données selon le rôle
4. **Performance** : Les fonctions sont optimisées pour les vérifications fréquentes

## 🎉 Résultat Final

Après l'exécution du script, votre système aura :
- ✅ Un système de rôles complet et sécurisé
- ✅ Attribution automatique du rôle "user" par défaut
- ✅ Politiques RLS appropriées pour chaque rôle
- ✅ Fonctions utilitaires pour vérifier les rôles
- ✅ Tous les utilisateurs existants avec un rôle défini

Votre application peut maintenant utiliser les fonctions `is_admin()`, `is_user()`, et `get_user_role()` pour gérer les permissions côté backend. 