# Test - Stockage du token dans localStorage

## Problème identifié
Le token d'authentification n'était pas stocké dans le localStorage car la structure de la réponse du backend ne correspondait pas au type attendu.

## Corrections apportées

### 1. Correction du type AuthResponse
- **Avant** : `data: { user: User; access_token: string; }`
- **Après** : `data: { user: User; session: { access_token: string; ... }; legalStatus?: {...} }`

### 2. Correction de l'accès au token
- **Avant** : `response.data.access_token`
- **Après** : `response.data.session.access_token`

## Test à effectuer

### 1. Connexion
1. Allez sur la page de connexion : https://mister-api.vercel.app/login
2. Connectez-vous avec vos identifiants
3. Ouvrez la console du navigateur (F12)

### 2. Vérification des logs
Vous devriez voir ces logs dans la console :
```
🚀 Starting signin process...
🔐 Signin attempt with credentials: {email: 'leo.segalini@outlook.com'}
🔧 Request details: {baseUrl: 'https://mister-api.onrender.com', endpoint: '/api/v1/auth/login', ...}
🌐 Making API request to: https://mister-api.onrender.com/api/v1/auth/login
✅ Signin successful: {success: true, message: 'Connexion réussie', data: {...}}
🔐 Token stocké dans localStorage
```

### 3. Vérification du localStorage
Dans la console du navigateur, tapez :
```javascript
console.log('Token dans localStorage:', localStorage.getItem('access_token'));
```

**Résultat attendu** : Une chaîne de caractères commençant par `eyJ...` (token JWT)

### 4. Test de l'authentification
Dans la console du navigateur, tapez :
```javascript
fetch('https://mister-api.onrender.com/api/v1/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": "c9782951-c33a-4d01-ad0b-b6f96d752c80",
    "email": "leo.segalini@outlook.com",
    "is_premium": false
  }
}
```

## Si le test échoue

### Problème 1 : Token non stocké
**Symptôme** : `localStorage.getItem('access_token')` retourne `null`
**Solution** : Vérifiez que la réponse du backend contient bien `session.access_token`

### Problème 2 : Erreur 401
**Symptôme** : L'appel à `/api/v1/auth/profile` retourne 401
**Solution** : Vérifiez que le token est bien envoyé dans le header Authorization

### Problème 3 : Erreur de type
**Symptôme** : Erreur TypeScript dans la console
**Solution** : Vérifiez que le type `AuthResponse` correspond à la réponse réelle du backend

## Prochaines étapes
Une fois le token correctement stocké, testez la page de paiement pour vérifier que l'authentification fonctionne. 