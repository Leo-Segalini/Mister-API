# Guide de Test - Correction de l'Erreur Admin

## Problème Résolu
L'erreur `AuthApiError: User not allowed` avec le code `not_admin` était causée par l'utilisation de `getUserCompleteInfo()` qui nécessite des permissions d'administrateur.

## Solution Appliquée
- ✅ Suppression de l'appel `getUserCompleteInfo()` qui utilisait `supabase.auth.admin.getUserById()`
- ✅ Utilisation directe des informations de `req.user` (déjà disponibles via le guard)
- ✅ Récupération du profil via `getUserProfile()` (pas de permissions admin requises)
- ✅ Récupération du statut premium via `getUserRoleAndPremium()` (pas de permissions admin requises)

## Test de Validation

### 1. Test de Connexion
```bash
# Se connecter
POST /api/v1/auth/login
{
  "email": "leo.segalini@outlook.com",
  "password": "votre_mot_de_passe"
}
```

### 2. Test de l'endpoint /auth/me
```bash
# Récupérer les informations utilisateur
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Informations utilisateur récupérées avec succès",
  "data": {
    "id": "user-uuid",
    "email": "leo.segalini@outlook.com",
    "nom": "Segalini",
    "prenom": "Leo",
    "is_premium": true,
    "premium_expires_at": "2024-02-07T20:44:16.000Z",
    "role": "user",
    "created_at": "2024-01-07T20:44:16.000Z",
    "updated_at": "2024-01-07T20:44:16.000Z"
  }
}
```

### 3. Logs Attendus
Dans les logs du backend, vous devriez voir :
```
👤 Récupération des informations complètes pour: leo.segalini@outlook.com
✅ Informations utilisateur récupérées pour leo.segalini@outlook.com: {role: "user", isPremium: true, hasProfile: true}
```

**Plus d'erreur :**
- ❌ `AuthApiError: User not allowed`
- ❌ `code: 'not_admin'`

## Vérification Frontend

### 1. Connexion via l'interface
1. Aller sur `/login`
2. Se connecter avec vos identifiants
3. Vérifier la redirection vers `/dashboard`

### 2. Logs Console
Dans la console du navigateur :
```
🚀 Connexion en cours...
✅ Connexion réussie: leo.segalini@outlook.com {role: "user", isPremium: true}
🔄 Redirection vers dashboard...
```

### 3. État Utilisateur
Dans le dashboard, vérifier que :
- L'utilisateur est connecté
- Les informations sont affichées correctement
- Le statut premium est disponible

## Debugging

### Si l'erreur persiste
1. Vérifier que le service Supabase a les bonnes permissions sur la table `users`
2. Vérifier que l'utilisateur existe dans la table `public.users`
3. Vérifier les logs pour d'autres erreurs

### Si les données sont incomplètes
1. Vérifier que le profil utilisateur existe dans `public.users`
2. Vérifier que le champ `is_premium` est défini
3. Vérifier les permissions de lecture sur la table

## Validation Finale

### ✅ Checklist
- [ ] Connexion réussie sans erreur admin
- [ ] Endpoint `/auth/me` fonctionne
- [ ] Les informations utilisateur sont complètes
- [ ] Le statut premium est récupéré
- [ ] Le frontend affiche les bonnes informations
- [ ] Aucune erreur dans les logs

### 🎯 Résultat
L'utilisateur devrait maintenant pouvoir se connecter et accéder à toutes ses informations incluant le statut premium, sans erreur de permissions admin. 