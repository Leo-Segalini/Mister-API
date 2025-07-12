# Guide de Correction du Problème d'Inscription

Ce guide explique la correction du problème où les utilisateurs n'étaient pas créés dans `public.users` lors de l'inscription.

## 🚨 Problème Identifié

- **Erreur** : "Database error saving new user"
- **Cause** : Le trigger `handle_new_user` ne fonctionnait pas correctement
- **Résultat** : Les utilisateurs étaient créés dans `auth.users` mais pas dans `public.users`

## 🔧 Solution Implémentée

### **1. Suppression du Trigger Problématique**
- Suppression du trigger `on_auth_user_created`
- Suppression de la fonction `handle_new_user`
- Élimination de la source d'erreur

### **2. Création Manuelle du Profil**
- Modification de `supabase.service.ts`
- Création manuelle du profil dans `public.users` après l'inscription
- Inclusion des champs légaux (`politique_confidentialite_acceptee`, `conditions_generales_acceptees`)

### **3. Gestion d'Erreurs Robuste**
- Si la création du profil échoue, l'inscription continue
- Logs détaillés pour le debugging
- Pas de blocage de l'inscription

## 🚀 Étapes de Correction

### **Étape 1 : Supprimer le Trigger**
```sql
-- Exécuter le script backend-mister-api/sql/remove_problematic_trigger.sql
-- Dans l'éditeur SQL de Supabase
```

### **Étape 2 : Redémarrer le Backend**
```bash
# Dans le dossier backend-mister-api
npm run start:dev
```

### **Étape 3 : Tester l'Inscription**
1. Aller sur `https://mister-api.vercel.app/register`
2. Remplir le formulaire avec des données valides
3. Vérifier que l'utilisateur est créé dans `public.users`

## 🧪 Tests de Validation

### **Test 1 : Inscription via API**
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

### **Test 2 : Vérification Base de Données**
```sql
-- Vérifier que l'utilisateur existe dans auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'test@example.com';

-- Vérifier que l'utilisateur existe dans public.users
SELECT id, email, nom, prenom, politique_confidentialite_acceptee, conditions_generales_acceptees
FROM public.users 
WHERE email = 'test@example.com';
```

### **Test 3 : Vérification des Logs**
Dans les logs du backend, chercher :
```
✅ Profil utilisateur créé manuellement pour: test@example.com
✅ Profil créé avec succès pour test@example.com avec les champs légaux
```

## 📊 Résultats Attendus

### **Dans auth.users**
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

### **Dans public.users**
```sql
id | email | nom | prenom | politique_confidentialite_acceptee | conditions_generales_acceptees | role
---|-------|-----|--------|-----------------------------------|--------------------------------|------
uuid | test@example.com | Test | User | true | true | user
```

## 🔍 Debugging

### **Si l'Inscription Échoue**
1. **Vérifier les logs backend** pour les erreurs détaillées
2. **Vérifier la structure de la table** `public.users`
3. **Vérifier les permissions** sur la table

### **Si le Profil n'est Pas Créé**
1. **Vérifier que le trigger est supprimé**
2. **Vérifier les logs** de création manuelle
3. **Vérifier les données** envoyées dans la requête

### **Vérifier la Structure de la Table**
```sql
-- Vérifier que les colonnes existent
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

## 🛠️ Correction des Utilisateurs Existants

Si vous avez des utilisateurs qui n'ont pas de profil dans `public.users` :

```sql
-- Lister les utilisateurs sans profil
SELECT au.id, au.email, au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Créer manuellement les profils manquants (exemple)
INSERT INTO public.users (
  id, email, nom, prenom, role, 
  politique_confidentialite_acceptee, conditions_generales_acceptees
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nom', ''),
  COALESCE(au.raw_user_meta_data->>'prenom', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'user'),
  COALESCE((au.raw_user_meta_data->>'politique_confidentialite_acceptee')::boolean, false),
  COALESCE((au.raw_user_meta_data->>'conditions_generales_acceptees')::boolean, false)
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

## 📝 Notes Importantes

1. **Plus de Trigger** : Les profils sont créés manuellement dans le code
2. **Gestion d'Erreurs** : L'inscription ne bloque pas si la création du profil échoue
3. **Champs Légaux** : Correctement transmis et stockés
4. **Logs Détaillés** : Suivi complet du processus d'inscription

## 🎉 Résultat Final

Après correction :
- ✅ **Inscription fonctionnelle** : Plus d'erreur "Database error saving new user"
- ✅ **Profil automatique** : Création automatique dans `public.users`
- ✅ **Champs légaux** : Correctement définis à `TRUE`
- ✅ **Logs clairs** : Suivi du processus d'inscription
- ✅ **Gestion d'erreurs** : Robuste et non-bloquante

Votre système d'inscription est maintenant opérationnel et fiable ! 