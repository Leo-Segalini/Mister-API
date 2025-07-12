# Guide de Configuration des Champs Légaux

Ce guide explique comment configurer les champs `politique_confidentialite_acceptee` et `conditions_generales_acceptees` pour qu'ils soient automatiquement définis à `TRUE` lors de l'inscription.

## 🎯 Problème Résolu

Lors de l'inscription, les champs légaux ne sont pas correctement transmis à la table `public.users` et restent à `FALSE` ou `NULL`.

## 🔧 Solution Implémentée

### **1. Modification du Service Supabase**
- Les champs légaux sont maintenant inclus dans les métadonnées utilisateur lors de l'inscription
- Transmission automatique au trigger de création de profil

### **2. Trigger SQL Automatique**
- Création d'un trigger `handle_new_user()` qui s'exécute après chaque insertion dans `auth.users`
- Extraction automatique des champs légaux depuis `raw_user_meta_data`
- Conversion en boolean et insertion dans `public.users`

## 🚀 Étapes de Configuration

### **Étape 1 : Exécuter le Script SQL**

1. **Ouvrir l'éditeur SQL de Supabase**
   - Connectez-vous à votre projet Supabase
   - Allez dans la section "SQL Editor"
   - Cliquez sur "New query"

2. **Exécuter le script de trigger**
   - Ouvrir le fichier `backend-mister-api/sql/create_user_profile_trigger.sql`
   - Copier tout le contenu
   - Collez-le dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" pour exécuter le script

### **Étape 2 : Vérifier l'Exécution**

Vous devriez voir ces messages dans la console :
```
NOTICE: ✅ Profil utilisateur créé automatiquement pour: user@example.com (ID: uuid)
NOTICE: 📋 Champs légaux: politique_confidentialite_acceptee=true, conditions_generales_acceptees=true
NOTICE: 🎉 Trigger de création automatique du profil utilisateur configuré avec succès!
```

## 🧪 Tests de la Fonctionnalité

### **Test 1 : Inscription d'un Nouvel Utilisateur**

#### Étape 1 : Inscription via l'API
```bash
curl -X POST "https://mister-api.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "nom": "Test",
    "prenom": "User",
    "politique_confidentialite_acceptee": true,
    "conditions_generales_acceptees": true
  }'
```

#### Étape 2 : Vérifier dans Supabase
```sql
-- Vérifier que le profil a été créé avec les champs légaux
SELECT 
  id,
  email,
  nom,
  prenom,
  politique_confidentialite_acceptee,
  conditions_generales_acceptees,
  role,
  created_at
FROM public.users 
WHERE email = 'test@example.com';
```

#### Résultat attendu :
```
id | email | nom | prenom | politique_confidentialite_acceptee | conditions_generales_acceptees | role | created_at
---|-------|-----|--------|-----------------------------------|--------------------------------|------|-----------
uuid | test@example.com | Test | User | true | true | user | 2024-01-01 12:00:00
```

### **Test 2 : Vérifier les Métadonnées**

```sql
-- Vérifier les métadonnées dans auth.users
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'test@example.com';
```

#### Résultat attendu :
```json
{
  "id": "uuid",
  "email": "test@example.com",
  "raw_user_meta_data": {
    "nom": "Test",
    "prenom": "User",
    "politique_confidentialite_acceptee": true,
    "conditions_generales_acceptees": true,
    "role": "user"
  }
}
```

### **Test 3 : Test via l'Interface Frontend**

1. **Aller sur** : `https://mister-api.vercel.app/register`
2. **Remplir le formulaire** avec :
   - Email : `test2@example.com`
   - Mot de passe : `Password123!`
   - Nom : `Test2`
   - Prénom : `User2`
   - **Cocher** les cases "Politique de confidentialité" et "Conditions générales"
3. **Cliquer sur "S'inscrire"**
4. **Vérifier** dans Supabase que les champs sont à `TRUE`

## 🔍 Debugging

### **Vérifier le Trigger**
```sql
-- Vérifier que le trigger existe
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

### **Vérifier la Fonction**
```sql
-- Vérifier que la fonction existe
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### **Vérifier les Logs**
Dans les logs du backend, chercher :
```
✅ Profil utilisateur créé automatiquement pour: email@example.com
📋 Champs légaux: politique_confidentialite_acceptee=true, conditions_generales_acceptees=true
```

## 🛠️ Correction des Utilisateurs Existants

Si vous avez des utilisateurs existants avec des champs légaux à `FALSE`, vous pouvez les corriger :

```sql
-- Mettre à jour tous les utilisateurs existants
UPDATE public.users 
SET 
  politique_confidentialite_acceptee = true,
  conditions_generales_acceptees = true
WHERE 
  politique_confidentialite_acceptee = false 
  OR conditions_generales_acceptees = false
  OR politique_confidentialite_acceptee IS NULL 
  OR conditions_generales_acceptees IS NULL;

-- Vérifier le résultat
SELECT 
  email,
  politique_confidentialite_acceptee,
  conditions_generales_acceptees
FROM public.users 
ORDER BY created_at DESC;
```

## 🚨 Problèmes Courants

### **Champs toujours à FALSE**
- Vérifier que le trigger a été créé correctement
- Vérifier que les métadonnées contiennent les bonnes valeurs
- Vérifier les logs du trigger

### **Erreur "function does not exist"**
- Relancer le script SQL de création du trigger
- Vérifier que la fonction `handle_new_user` existe

### **Profil non créé**
- Vérifier que le trigger s'exécute bien
- Vérifier les permissions sur la table `public.users`

## 📝 Notes Importantes

1. **Automatisation** : Le trigger s'exécute automatiquement pour tous les nouveaux utilisateurs
2. **Conversion** : Les valeurs string sont converties en boolean automatiquement
3. **Logs** : Toutes les créations de profil sont loggées
4. **Rétrocompatibilité** : Les utilisateurs existants ne sont pas affectés

## 🎉 Résultat Final

Après configuration, le système devrait :
- ✅ Créer automatiquement le profil utilisateur lors de l'inscription
- ✅ Définir `politique_confidentialite_acceptee = true`
- ✅ Définir `conditions_generales_acceptees = true`
- ✅ Logger toutes les créations de profil
- ✅ Fonctionner pour tous les nouveaux utilisateurs

Votre système de gestion des champs légaux est maintenant opérationnel ! 