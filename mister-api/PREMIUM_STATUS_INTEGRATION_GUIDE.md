# Guide de Test - Intégration du Statut Premium

## Objectif
Vérifier que l'endpoint `/auth/me` récupère correctement toutes les informations utilisateur incluant le statut `is_premium`.

## Modifications Apportées

### Backend (backend-mister-api/src/controllers/auth.controller.ts)
- ✅ Correction de la duplication de l'endpoint `/auth/me`
- ✅ Modification pour récupérer les informations complètes utilisateur
- ✅ Intégration du statut premium via `getUserRoleAndPremium()`
- ✅ Combinaison des informations d'authentification et de profil

### Frontend (mister-api/hooks/useAuth.tsx)
- ✅ Mise à jour de `validateSession()` pour récupérer `is_premium`
- ✅ Mise à jour de `signin()` pour récupérer les informations complètes après connexion
- ✅ Ajout de la propriété `isPremium` dans l'interface `AuthContextType`
- ✅ Logs détaillés pour le debugging

## Tests à Effectuer

### 1. Test de Connexion et Récupération des Données

#### Étape 1 : Connexion
```bash
# Se connecter avec un utilisateur
POST /api/v1/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Étape 2 : Vérifier l'endpoint /auth/me
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
    "email": "test@example.com",
    "nom": "Doe",
    "prenom": "John",
    "is_premium": true,
    "premium_expires_at": "2024-02-07T20:44:16.000Z",
    "role": "user",
    "created_at": "2024-01-07T20:44:16.000Z",
    "updated_at": "2024-01-07T20:44:16.000Z",
    "telephone": "+33123456789",
    "adresse_postale": "123 Rue de la Paix",
    "code_postal": "75001",
    "ville": "Paris",
    "pays": "France"
  }
}
```

### 2. Test Frontend - Dashboard

#### Étape 1 : Connexion via l'interface
1. Aller sur `/login`
2. Se connecter avec un utilisateur
3. Vérifier la redirection vers `/dashboard`

#### Étape 2 : Vérifier les logs console
Dans la console du navigateur, vous devriez voir :
```
🚀 Connexion en cours...
✅ Connexion réussie: test@example.com {role: "user", isPremium: true}
🔄 Redirection vers dashboard...
```

#### Étape 3 : Vérifier l'état utilisateur
Dans le dashboard, l'utilisateur devrait avoir accès à :
- Son nom et email
- Son statut premium (visible dans l'interface)
- Ses clés API

### 3. Test avec Postman

#### Collection Postman
```json
{
  "info": {
    "name": "Test Premium Status",
    "description": "Tests pour vérifier l'intégration du statut premium"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/v1/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "auth", "login"]
        }
      }
    },
    {
      "name": "Get User Info",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/v1/auth/me",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "auth", "me"]
        }
      }
    }
  ]
}
```

### 4. Vérification des Données

#### Champs obligatoires dans la réponse `/auth/me` :
- ✅ `id` : UUID de l'utilisateur
- ✅ `email` : Email de l'utilisateur
- ✅ `nom` : Nom de famille
- ✅ `prenom` : Prénom
- ✅ `is_premium` : Statut premium (boolean)
- ✅ `premium_expires_at` : Date d'expiration premium
- ✅ `role` : Rôle utilisateur
- ✅ `created_at` : Date de création
- ✅ `updated_at` : Date de mise à jour

#### Champs optionnels :
- ✅ `telephone` : Numéro de téléphone
- ✅ `adresse_postale` : Adresse
- ✅ `code_postal` : Code postal
- ✅ `ville` : Ville
- ✅ `pays` : Pays

## Debugging

### Logs Backend
Vérifier les logs du backend pour s'assurer que :
```
👤 Récupération des informations complètes pour: test@example.com
✅ Informations utilisateur récupérées pour test@example.com: {role: "user", isPremium: true, hasProfile: true}
```

### Logs Frontend
Vérifier les logs du navigateur pour s'assurer que :
```
🔍 Validation de session...
✅ Session valide: test@example.com {role: "user", isPremium: true}
```

## Problèmes Potentiels

### 1. Erreur 401 sur /auth/me
- Vérifier que le token est valide
- Vérifier que les cookies sont bien transmis
- Vérifier la configuration CORS

### 2. Données manquantes
- Vérifier que l'utilisateur a un profil dans `public.users`
- Vérifier que le champ `is_premium` est bien défini
- Vérifier les permissions de la base de données

### 3. Erreur de type TypeScript
- Vérifier que le type `User` inclut `is_premium: boolean`
- Vérifier que l'interface `AuthContextType` inclut `isPremium: boolean`

## Validation Finale

### ✅ Checklist
- [ ] Endpoint `/auth/me` retourne toutes les informations utilisateur
- [ ] Le champ `is_premium` est présent et correct
- [ ] La connexion frontend récupère les informations complètes
- [ ] L'état utilisateur contient `isPremium`
- [ ] Les logs montrent les bonnes informations
- [ ] Aucune erreur dans la console
- [ ] Le dashboard affiche correctement les informations utilisateur

### 🎯 Résultat Attendu
Après connexion, l'utilisateur devrait avoir accès à toutes ses informations incluant son statut premium, et l'interface devrait pouvoir utiliser `user.is_premium` ou `isPremium` pour afficher le statut approprié. 