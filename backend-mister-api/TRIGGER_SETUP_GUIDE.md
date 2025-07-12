# Guide de Configuration du Trigger Automatique

## 🎯 Objectif
Configurer un trigger SQL qui crée automatiquement un profil utilisateur dans `public.users` lors de l'inscription via Supabase Auth.

## 📋 Prérequis
- Accès à la base de données Supabase
- Permissions d'exécution de scripts SQL

## 🚀 Installation

### 1. Exécuter le Script SQL
```sql
-- Exécuter le fichier: backend-mister-api/sql/create_optimized_user_profile_trigger.sql
```

### 2. Vérification
Le script va automatiquement :
- ✅ Supprimer les anciens triggers et fonctions
- ✅ Créer la fonction `handle_new_user()`
- ✅ Créer le trigger `on_auth_user_created`
- ✅ Créer la fonction `fix_missing_profiles()`
- ✅ Afficher les messages de confirmation

## 🔧 Fonctions Disponibles

### `handle_new_user()`
- **Rôle**: Fonction trigger principale
- **Action**: Crée automatiquement le profil utilisateur
- **Gestion d'erreurs**: Ne bloque pas l'inscription en cas d'erreur

### `fix_missing_profiles()`
- **Rôle**: Réparer les profils manquants
- **Usage**: `SELECT * FROM fix_missing_profiles();`
- **Retour**: Liste des profils créés ou en erreur

## 🧪 Test

### 1. Test d'Inscription
1. Créer un nouvel utilisateur via l'API
2. Vérifier que le profil est créé dans `public.users`
3. Vérifier les champs légaux (`politique_confidentialite_acceptee`, `conditions_generales_acceptees`)

### 2. Vérification des Logs
```sql
-- Vérifier les triggers actifs
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Vérifier la fonction
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### 3. Réparer les Profils Manquants
```sql
-- Exécuter pour créer les profils manquants
SELECT * FROM fix_missing_profiles();
```

## 🛠️ Dépannage

### Erreur "Database error saving new user"
- ✅ Le trigger gère les erreurs et ne bloque pas l'inscription
- ✅ Les erreurs sont loggées avec `RAISE WARNING`

### Profil non créé
- ✅ Vérifier que le trigger est actif
- ✅ Utiliser `fix_missing_profiles()` pour réparer
- ✅ Vérifier les logs Supabase

### Champs légaux manquants
- ✅ Le trigger convertit automatiquement les valeurs string en boolean
- ✅ Valeurs par défaut : `false` si non spécifiées

## 📝 Avantages de cette Solution

1. **Automatique**: Pas de code backend nécessaire
2. **Robuste**: Gestion d'erreurs intégrée
3. **Simple**: Noms de fonctions clairs (`handle_new_user`, `fix_missing_profiles`)
4. **Sécurisé**: `SECURITY DEFINER` pour les permissions
5. **Maintenable**: Logs détaillés et fonction de réparation

## 🔄 Prochaines Étapes

1. Tester l'inscription d'un nouvel utilisateur
2. Vérifier la création automatique du profil
3. Tester la fonction `fix_missing_profiles()` si nécessaire
4. Surveiller les logs pour détecter d'éventuelles erreurs

---

**✅ Configuration terminée !** Le système créera automatiquement les profils utilisateurs lors de l'inscription. 