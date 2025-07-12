# Guide de Débogage CORS

## Problème Identifié
Erreur CORS lors de la connexion depuis `https://mister-api.vercel.app` vers `https://mister-api.onrender.com`

## Tests à Effectuer

### 1. Test de Connectivité Backend
```bash
# Test direct du backend
curl -X POST https://mister-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://mister-api.vercel.app" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. Test CORS Preflight
```bash
# Test de la requête OPTIONS
curl -X OPTIONS https://mister-api.onrender.com/api/v1/auth/login \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### 3. Vérification des Headers CORS
```bash
# Vérifier les headers de réponse
curl -I https://mister-api.onrender.com/api/v1/auth/login \
  -H "Origin: https://mister-api.vercel.app"
```

### 4. Test Frontend Simplifié
```javascript
// Test dans la console du navigateur
fetch('https://mister-api.onrender.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Solutions Possibles

### 1. Configuration CORS Backend
La configuration CORS a été mise à jour pour être plus permissive :
- `origin: true` (autorise toutes les origines)
- Headers supplémentaires ajoutés
- Middleware CORS supplémentaire

### 2. Variables d'Environnement Frontend
Vérifier que `NEXT_PUBLIC_API_URL` est correctement configuré :
```bash
# Dans Vercel, vérifier les variables d'environnement
NEXT_PUBLIC_API_URL=https://mister-api.onrender.com
```

### 3. Configuration Helmet
Helmet peut bloquer les requêtes CORS. Vérifier la configuration :
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
```

### 4. Test avec Proxy
Si le problème persiste, utiliser un proxy Next.js :
```typescript
// next.config.ts
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://mister-api.onrender.com/api/v1/:path*',
      },
    ];
  },
};
```

## Étapes de Diagnostic

1. **Vérifier les logs backend** : Regarder les logs de Render pour voir si les requêtes arrivent
2. **Tester avec Postman** : Vérifier que l'API fonctionne sans CORS
3. **Vérifier les variables d'environnement** : S'assurer que l'URL est correcte
4. **Tester en local** : Vérifier si le problème existe en développement

## Logs à Surveiller

### Backend (Render)
- Requêtes OPTIONS reçues
- Headers CORS envoyés
- Erreurs de validation

### Frontend (Vercel)
- Erreurs CORS dans la console
- Échec des requêtes fetch
- Cookies non définis

## Solution Temporaire

Si le problème persiste, utiliser un proxy Next.js pour contourner CORS :

```typescript
// lib/api.ts
constructor() {
  // Utiliser le proxy local au lieu de l'URL directe
  this.baseUrl = process.env.NODE_ENV === 'production' 
    ? '/api/backend'  // Proxy Next.js
    : 'http://localhost:3001';  // Backend local
}
``` 