# Guide de Diagnostic et Correction CORS

## Problème Identifié
```
Access to fetch at 'https://mister-api.onrender.com/api/v1/auth/login' from origin 'https://mister-api.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Analyse du Problème

### 1. **Erreur CORS Preflight**
- Le navigateur envoie une requête OPTIONS avant la requête POST
- Le serveur ne répond pas correctement aux requêtes OPTIONS
- Les headers CORS ne sont pas présents dans la réponse

### 2. **Origines Concernées**
- **Frontend**: `https://mister-api.vercel.app`
- **Backend**: `https://mister-api.onrender.com`

## Corrections Apportées

### 1. **Configuration CORS Améliorée**
```typescript
// main.ts - Configuration CORS optimisée
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://mister-api.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origine autorisée: ${origin}`);
      return callback(null, true);
    }
    
    console.log(`❌ CORS: Origine refusée: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-api-key', 
    'Cookie', 
    'Origin', 
    'Accept',
    'X-Requested-With',
    'X-Refresh-Token'
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Refresh-Token'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

### 2. **Middleware CORS Supplémentaire**
```typescript
// Gestion spécifique des requêtes OPTIONS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, Cookie, X-Refresh-Token');
  
  if (req.method === 'OPTIONS') {
    console.log('🔧 OPTIONS preflight request handled for:', req.url);
    res.status(204).end();
    return;
  }
  
  next();
});
```

### 3. **Endpoint /auth/me Ajouté**
```typescript
@Get('me')
@ApiOperation({
  summary: 'Récupérer les informations de l\'utilisateur connecté',
  description: 'Récupère les informations de l\'utilisateur actuellement authentifié'
})
async getMe(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
  return {
    success: true,
    message: 'Informations utilisateur récupérées avec succès',
    data: req.user
  };
}
```

## Tests de Diagnostic

### Test 1: Vérification CORS avec curl
```bash
# Test de la requête OPTIONS (preflight)
curl -X OPTIONS \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v https://mister-api.onrender.com/api/v1/auth/login
```

**Réponse attendue:**
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://mister-api.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, Cookie, X-Refresh-Token
```

### Test 2: Test de Connexion avec curl
```bash
# Test de la requête POST de connexion
curl -X POST \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v https://mister-api.onrender.com/api/v1/auth/login
```

### Test 3: Test avec Postman
1. **Requête OPTIONS:**
   ```
   Method: OPTIONS
   URL: https://mister-api.onrender.com/api/v1/auth/login
   Headers:
     Origin: https://mister-api.vercel.app
     Access-Control-Request-Method: POST
     Access-Control-Request-Headers: Content-Type,Authorization
   ```

2. **Requête POST:**
   ```
   Method: POST
   URL: https://mister-api.onrender.com/api/v1/auth/login
   Headers:
     Origin: https://mister-api.vercel.app
     Content-Type: application/json
   Body:
     {
       "email": "test@example.com",
       "password": "password123"
     }
   ```

## Logs à Surveiller

### Backend (Console)
```
🔧 Configuration CORS...
✅ CORS: Origine autorisée: https://mister-api.vercel.app
🔧 OPTIONS preflight request handled for: /api/v1/auth/login
🚀 Début de la connexion pour: user@example.com
```

### Frontend (Console)
```
🚀 Début de la connexion...
🔐 Signin attempt with credentials: {email: 'user@example.com'}
🌐 Making API request to: https://mister-api.onrender.com/api/v1/auth/login
📡 Response status: 201 for https://mister-api.onrender.com/api/v1/auth/login
✅ Connexion réussie: user@example.com
```

## Troubleshooting

### Problème: CORS toujours bloqué
**Solutions:**
1. Vérifier que le backend est redémarré
2. Vérifier les logs CORS dans la console
3. Tester avec curl pour isoler le problème

### Problème: Cookies non transmis
**Solutions:**
1. Vérifier `credentials: true` dans la configuration CORS
2. Vérifier `sameSite: 'none'` dans les cookies
3. Vérifier `secure: true` en production

### Problème: Headers manquants
**Solutions:**
1. Vérifier la liste `allowedHeaders`
2. Vérifier la liste `exposedHeaders`
3. Vérifier le middleware CORS supplémentaire

## Configuration de Production

### Variables d'Environnement
```env
# Backend (.env)
NODE_ENV=production
CORS_ORIGINS=https://mister-api.vercel.app,http://localhost:3000
COOKIE_SECRET=your-secret-key
```

### Headers de Sécurité
```typescript
// Helmet configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
```

## Tests de Validation

### 1. **Test de Connexion**
- [ ] Requête OPTIONS réussie (204)
- [ ] Requête POST réussie (201)
- [ ] Cookies définis correctement
- [ ] Headers CORS présents

### 2. **Test de Session**
- [ ] Validation avec `/auth/me` réussie
- [ ] Cookies transmis correctement
- [ ] Données utilisateur récupérées

### 3. **Test de Dashboard**
- [ ] Récupération des clés API réussie
- [ ] Session persistante
- [ ] Pas d'erreurs CORS

## Résultats Attendus

Après ces corrections :
1. **CORS Fonctionnel**: Plus d'erreurs de preflight
2. **Authentification Stable**: Connexion et session fonctionnelles
3. **Cookies Transmis**: Cross-origin avec `sameSite: 'none'`
4. **Dashboard Accessible**: Toutes les données chargées

## Prochaines Étapes

Une fois CORS corrigé :
1. Tester la connexion complète
2. Valider la redirection vers le dashboard
3. Tester la persistance de session
4. Optimiser les performances 