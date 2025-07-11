# Guide de Débogage - Authentification

## Problème Résolu

Le problème de déconnexion lors du rechargement de page a été corrigé. Voici les améliorations apportées :

## Corrections Appliquées

### 1. Hook useAuth (`mister-api/hooks/useAuth.tsx`)

**Problème** : La page d'accueil `/` était considérée comme publique et sautait la vérification d'authentification.

**Solution** :
- Retiré `/` de la liste des pages publiques
- Amélioré la logique de détection des pages publiques
- Amélioré la gestion des erreurs dans `validateSession`

```typescript
// Avant
const publicPaths = ['/login', '/register', '/register/success', '/', '/docs', '/pricing'];

// Après
const publicPaths = ['/login', '/register', '/register/success', '/docs', '/pricing'];
```

### 2. Composant ProtectedRoute (`mister-api/components/ProtectedRoute.tsx`)

**Problème** : Redirections prématurées avant l'initialisation complète.

**Solution** :
- Ajouté un délai d'initialisation pour éviter les redirections prématurées
- Amélioré la gestion de l'état de chargement

## Tests de Validation

### Test 1 : Connexion et Rechargement

1. **Connectez-vous** à l'application
2. **Rechargez la page** (F5 ou Ctrl+R)
3. **Vérifiez** que vous restez connecté

**Résultat attendu** : Vous devriez rester connecté et voir votre dashboard.

### Test 2 : Navigation entre Pages

1. **Connectez-vous** à l'application
2. **Naviguez** vers `/stats`
3. **Rechargez la page**
4. **Naviguez** vers `/dashboard`

**Résultat attendu** : Vous devriez rester connecté sur toutes les pages.

### Test 3 : Déconnexion et Reconnexion

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous**
3. **Rechargez la page**

**Résultat attendu** : Vous devriez rester connecté après reconnexion.

## Vérification des Logs

### Logs Attendus lors du Rechargement

```
🔐 Initializing authentication...
🔍 Checking authentication status...
🔍 Validating session...
✅ Session valid, user data: {user object}
✅ Valid session found, user authenticated
🏁 Auth initialization complete
```

### Logs en Cas d'Erreur

```
🔐 Initializing authentication...
🔍 Checking authentication status...
🔍 Validating session...
❌ Session validation failed: {error}
🔒 Session expired (401)
📭 No valid session found
🔄 Redirecting to login page
```

## Débogage Avancé

### 1. Vérifier les Cookies

Ouvrez les outils de développement (F12) et allez dans l'onglet **Application** > **Cookies** :

```javascript
// Dans la console du navigateur
console.log('Cookies:', document.cookie);
```

### 2. Vérifier l'État d'Authentification

```javascript
// Dans la console du navigateur
// Accéder au contexte d'authentification
const authContext = document.querySelector('[data-auth-context]');
console.log('Auth state:', authContext);
```

### 3. Tester l'API Directement

```bash
# Tester l'endpoint de profil
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  --cookie "your-cookies-here"
```

## Problèmes Courants

### Problème : Toujours redirigé vers /login

**Cause possible** : Le serveur backend n'est pas démarré

**Solution** :
```bash
cd backend-mister-api
npm run start:dev
```

### Problème : Cookies non envoyés

**Cause possible** : Configuration CORS incorrecte

**Vérification** :
```javascript
// Dans la console
fetch('http://localhost:3001/api/v1/auth/profile', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### Problème : Session expirée

**Cause possible** : Token JWT expiré

**Solution** : Se reconnecter ou vérifier la configuration JWT

## Commandes de Test

### Test Complet d'Authentification

```bash
# 1. Démarrer le backend
cd backend-mister-api
npm run start:dev

# 2. Démarrer le frontend (nouveau terminal)
cd mister-api
npm run dev

# 3. Tester l'API
curl http://localhost:3001/api/v1/health
```

### Test des Routes Protégées

```bash
# Tester l'accès aux routes protégées
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  --cookie "access_token=your-token"
```

## Monitoring en Temps Réel

### 1. Logs du Backend

Surveillez les logs du serveur NestJS pour voir les requêtes d'authentification :

```
[AuthController] Login attempt for user@example.com
[AuthController] Login successful
[AuthController] Profile request for user@example.com
```

### 2. Logs du Frontend

Surveillez la console du navigateur pour voir les logs d'authentification :

```
🔐 Initializing authentication...
🔍 Checking authentication status...
✅ Session valid, user data: {...}
```

## Résolution de Problèmes

### Si le problème persiste

1. **Vérifiez les logs** du backend et du frontend
2. **Testez l'API** directement avec curl
3. **Vérifiez les cookies** dans les outils de développement
4. **Redémarrez** les serveurs backend et frontend
5. **Nettoyez le cache** du navigateur

### Contact Support

Si le problème persiste après avoir suivi ce guide, fournissez :
- Les logs du backend
- Les logs de la console du navigateur
- Les cookies présents
- Les étapes pour reproduire le problème 