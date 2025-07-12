# Guide de Résolution - Cookies Cross-Origin

## 🔍 Problème Identifié

Les cookies ne sont pas transmis entre le frontend (mister-api.vercel.app) et le backend (mister-api.onrender.com), causant des échecs d'authentification.

## 🧪 Diagnostic - Endpoints de Test

### 1. Informations CORS

```bash
# Vérifier la configuration CORS
curl -X GET https://mister-api.onrender.com/cookie-diagnostic/cors-info \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Content-Type: application/json" \
  -v
```

### 2. Test des Cookies

```bash
# Étape 1: Définir des cookies de test
curl -X POST https://mister-api.onrender.com/cookie-diagnostic/set-test-cookie \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -v

# Étape 2: Vérifier la réception des cookies
curl -X GET https://mister-api.onrender.com/cookie-diagnostic/check-cookies \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

### 3. Test d'Authentification

```bash
# Connexion avec les nouvelles configurations
curl -X POST https://mister-api.onrender.com/auth/login \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email": "leo.segalini@outlook.com", "password": "votre-mot-de-passe"}' \
  -c cookies.txt \
  -v

# Vérifier l'accès aux API avec cookies
curl -X GET https://mister-api.onrender.com/api-keys \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

## 🔧 Solutions Implémentées

### 1. Configuration des Cookies Cross-Origin

**Fichier** : `src/controllers/auth.controller.ts`

```typescript
// Configuration spéciale pour cross-origin
const crossOriginCookieOptions = {
  httpOnly: true,
  secure: true, // Obligatoire avec sameSite='none'
  sameSite: 'none' as const, // Nécessaire pour cross-origin
  domain: undefined, // Pas de restriction de domaine
  path: '/',
  maxAge: 4 * 60 * 60 * 1000, // 4 heures
};

// Fallback avec headers
res.header('Authorization', `Bearer ${session.access_token}`);
res.header('X-Refresh-Token', session.refresh_token);
```

### 2. Middleware avec Fallback sur Headers

**Fichier** : `src/middleware/supabase-auth.middleware.ts`

```typescript
// Récupération depuis cookies ou headers
let token = req.cookies['access_token'] || req.cookies['sb-access-token'];

// Fallback sur headers Authorization
if (!token && req.headers.authorization) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
}
```

### 3. Configuration CORS Optimisée

**Fichier** : `src/main.ts`

```typescript
const allowedOrigins = [
  'https://mister-api.vercel.app',
  'http://localhost:3000',
  // autres origines...
];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // ESSENTIEL pour les cookies
  exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Refresh-Token'],
});
```

### 4. Contrôleur de Diagnostic

**Fichier** : `src/controllers/cookie-diagnostic.controller.ts`

- **`/cookie-diagnostic/set-test-cookie`** : Définit des cookies de test
- **`/cookie-diagnostic/check-cookies`** : Vérifie la réception des cookies
- **`/cookie-diagnostic/cors-info`** : Informations sur la configuration CORS

## 🎯 Configurations Côté Frontend

### 1. Fetch avec Credentials

```javascript
// Inclure les cookies dans les requêtes
fetch('https://mister-api.onrender.com/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://mister-api.vercel.app'
  },
  credentials: 'include', // ESSENTIEL pour les cookies
  body: JSON.stringify({
    email: 'leo.segalini@outlook.com',
    password: 'votre-mot-de-passe'
  })
})
```

### 2. Axios avec Credentials

```javascript
// Configuration axios pour les cookies
axios.defaults.withCredentials = true;

// Ou pour une requête spécifique
axios.post('https://mister-api.onrender.com/auth/login', {
  email: 'leo.segalini@outlook.com',
  password: 'votre-mot-de-passe'
}, {
  withCredentials: true
})
```

### 3. Fallback sur Headers

```javascript
// Si les cookies ne fonctionnent pas, utiliser les headers
const response = await fetch('https://mister-api.onrender.com/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(credentials)
});

// Récupérer les tokens depuis les headers
const accessToken = response.headers.get('Authorization');
const refreshToken = response.headers.get('X-Refresh-Token');

// Stocker et utiliser dans les requêtes suivantes
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);

// Utiliser dans les requêtes suivantes
fetch('https://mister-api.onrender.com/api-keys', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'X-Refresh-Token': refreshToken
  }
})
```

## 📋 Checklist de Vérification

### Côté Backend (Render)
- [ ] Cookies définis avec `sameSite: 'none'` et `secure: true`
- [ ] Headers CORS correctement configurés
- [ ] `credentials: true` dans la configuration CORS
- [ ] Headers Authorization et X-Refresh-Token exposés
- [ ] Middleware fallback sur headers implémenté

### Côté Frontend (Vercel)
- [ ] `credentials: 'include'` dans toutes les requêtes
- [ ] Headers Origin correctement définis
- [ ] Gestion des tokens depuis headers si cookies échouent
- [ ] Stockage local des tokens comme fallback

## 🚨 Diagnostic en Cas de Problème

### 1. Vérifier les Headers de Réponse

```bash
# Vérifier les headers Set-Cookie
curl -X POST https://mister-api.onrender.com/auth/login \
  -H "Origin: https://mister-api.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email", "password": "votre-mot-de-passe"}' \
  -v 2>&1 | grep -E "(Set-Cookie|Authorization|X-Refresh-Token)"
```

### 2. Test des Cookies de Navigation

```bash
# Utiliser un navigateur pour tester
# Ouvrir les DevTools > Network > voir les cookies dans les requêtes
```

### 3. Vérifier les Logs Backend

```bash
# Chercher dans les logs:
# - "🍪 Cookies définis pour..."
# - "🍪 Available cookies:"
# - "🔄 Token récupéré depuis Authorization header"
```

## 💡 Solutions Alternatives

### 1. Utilisation Exclusive des Headers

Si les cookies ne fonctionnent absolument pas :

```javascript
// Côté frontend - stocker les tokens
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
});

const data = await loginResponse.json();
localStorage.setItem('access_token', data.data.session.access_token);
localStorage.setItem('refresh_token', data.data.session.refresh_token);

// Utiliser dans toutes les requêtes
const token = localStorage.getItem('access_token');
fetch('/api-keys', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. Sous-domaine Unifié

Pour éviter les problèmes cross-origin :
- Utiliser `api.mister-api.com` pour le backend
- Utiliser `app.mister-api.com` pour le frontend
- Cookies partagés sur `.mister-api.com`

## 🔍 Validation

### Tests de Réussite

1. **Cookies transmis** : `/cookie-diagnostic/check-cookies` retourne des cookies
2. **Authentification** : `/auth/login` puis `/api-keys` fonctionne
3. **Headers fallback** : Fonctionne même sans cookies

### Métriques à Surveiller

- Taux de réussite des cookies cross-origin
- Utilisation des headers fallback
- Temps de réponse des requêtes d'authentification

---

**Note** : Cette solution implémente un système hybride cookies + headers pour une compatibilité maximale avec les configurations cross-origin. 