# Guide de Test Postman - Appels API du Dashboard

## Appels API Effectués sur le Dashboard

Quand on arrive sur le dashboard, voici les appels API qui sont effectués dans l'ordre :

### 1. **Validation de Session (useAuth)**
- **Endpoint**: `GET /api/v1/auth/me`
- **Objectif**: Vérifier que l'utilisateur est authentifié et récupérer ses informations
- **Authentification**: Cookies de session

### 2. **Récupération des Clés API (DashboardInfo)**
- **Endpoint**: `GET /api/v1/api-keys`
- **Objectif**: Récupérer toutes les clés API de l'utilisateur
- **Authentification**: Cookies de session

## Tests Postman à Effectuer

### Test 1: Validation de Session
```http
GET https://mister-api.onrender.com/api/v1/auth/me
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Ou avec Cookies:**
```
Cookie: access_token=YOUR_ACCESS_TOKEN; sb-access-token=YOUR_ACCESS_TOKEN
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Utilisateur récupéré avec succès",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "nom": "Nom",
    "prenom": "Prénom",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Test 2: Récupération des Clés API
```http
GET https://mister-api.onrender.com/api/v1/api-keys
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Ou avec Cookies:**
```
Cookie: access_token=YOUR_ACCESS_TOKEN; sb-access-token=YOUR_ACCESS_TOKEN
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Clés API récupérées avec succès",
  "data": {
    "apiKeys": [
      {
        "id": "key-uuid",
        "name": "Clé API par défaut",
        "key": "sk_...",
        "type": "free",
        "table_name": "punchlines",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Configuration Postman

### 1. **Collection Postman**
Créez une collection "Mister API Dashboard" avec ces variables d'environnement :

**Variables:**
- `base_url`: `https://mister-api.onrender.com`
- `access_token`: `YOUR_ACCESS_TOKEN_HERE`

### 2. **Headers Globaux**
```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

### 3. **Tests Automatisés**

**Pour la validation de session (/auth/me):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has user data", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property('email');
    pm.expect(jsonData.data).to.have.property('role');
    pm.expect(jsonData.data).to.have.property('id');
});

pm.test("User data is valid", function () {
    const jsonData = pm.response.json();
    const user = jsonData.data;
    pm.expect(user.email).to.be.a('string');
    pm.expect(user.email).to.include('@');
    pm.expect(user.role).to.be.oneOf(['user', 'admin']);
});
```

**Pour les clés API:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has API keys", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property('apiKeys');
    pm.expect(jsonData.data.apiKeys).to.be.an('array');
});

pm.test("API keys structure is valid", function () {
    const jsonData = pm.response.json();
    const apiKeys = jsonData.data.apiKeys;
    
    if (apiKeys.length > 0) {
        const firstKey = apiKeys[0];
        pm.expect(firstKey).to.have.property('id');
        pm.expect(firstKey).to.have.property('name');
        pm.expect(firstKey).to.have.property('type');
        pm.expect(firstKey).to.have.property('table_name');
        pm.expect(firstKey).to.have.property('is_active');
    }
});
```

## Ordre d'Exécution

1. **Connexion** → Récupération du token
2. **Validation de session** → Vérification de l'authentification avec `/auth/me`
3. **Récupération des clés API** → Chargement des données du dashboard

## Erreurs Possibles

### 401 Unauthorized
- Token expiré ou invalide
- Cookies non transmis correctement

### 403 Forbidden
- Utilisateur non autorisé
- Permissions insuffisantes

### 500 Internal Server Error
- Erreur côté serveur
- Base de données indisponible

## Test de Déconnexion (Optionnel)

```http
POST https://mister-api.onrender.com/api/v1/auth/logout
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Test:**
```javascript
pm.test("Logout successful", function () {
    pm.response.to.have.status(200);
});
```

## Workflow de Test Complet

### 1. **Préparation**
- Obtenir un token d'accès valide via la connexion
- Configurer les variables d'environnement Postman

### 2. **Test de Validation de Session**
- Exécuter `GET /api/v1/auth/me`
- Vérifier que l'utilisateur est bien authentifié
- Vérifier que les données utilisateur sont complètes

### 3. **Test de Récupération des Clés API**
- Exécuter `GET /api/v1/api-keys`
- Vérifier que les clés API sont récupérées
- Vérifier la structure des données

### 4. **Test de Déconnexion (Optionnel)**
- Exécuter `POST /api/v1/auth/logout`
- Vérifier que la déconnexion fonctionne

## Indicateurs de Succès

### ✅ Succès Total
- [ ] Validation de session réussie (200)
- [ ] Données utilisateur complètes
- [ ] Récupération des clés API réussie (200)
- [ ] Structure des données correcte
- [ ] Déconnexion fonctionnelle (optionnel)

### ⚠️ Succès Partiel
- [ ] Validation de session réussie mais données incomplètes
- [ ] Clés API récupérées mais vides (nouvel utilisateur)

### ❌ Échec
- [ ] Erreur 401 (token invalide)
- [ ] Erreur 403 (permissions insuffisantes)
- [ ] Erreur 500 (serveur indisponible)
- [ ] Structure de réponse incorrecte

## Commandes de Debug

### Vérifier les Cookies
```javascript
// Dans la console du navigateur
console.log('Cookies:', document.cookie);
```

### Vérifier l'État d'Authentification
```javascript
// Dans la console du navigateur
// Accéder au contexte d'authentification
```

### Test Manuel de Redirection
```javascript
// Dans la console du navigateur
window.location.href = '/dashboard';
```

## Résultats Attendus

Après ces tests :
1. **Authentification Valide**: L'utilisateur est correctement identifié
2. **Données Complètes**: Toutes les informations utilisateur sont disponibles
3. **Clés API Accessibles**: Les clés API sont récupérées avec succès
4. **Dashboard Fonctionnel**: Toutes les données nécessaires sont chargées

Ces tests vous permettront de valider complètement le fonctionnement du dashboard et de diagnostiquer les éventuels problèmes d'authentification ou de récupération de données. 