# Guide de Correction de l'Authentification par Cookies

## 🎯 Problème Résolu
Synchronisation de l'authentification entre le frontend et le backend en utilisant uniquement les cookies HTTP-only.

## 🔧 Modifications Apportées

### 1. **Frontend (`mister-api/lib/api.ts`)**
- ✅ **Suppression de localStorage** : Plus de stockage de token dans localStorage
- ✅ **Utilisation des cookies** : `credentials: 'include'` pour envoyer automatiquement les cookies
- ✅ **Gestion des erreurs** : Amélioration de la gestion des erreurs 401
- ✅ **Logs détaillés** : Activation des logs pour le debugging

### 2. **Frontend (`mister-api/hooks/useAuth.tsx`)**
- ✅ **Vérification des cookies** : Remplacement de localStorage par vérification des cookies
- ✅ **Validation de session** : Utilisation des cookies pour valider la session
- ✅ **Nettoyage des cookies** : Suppression correcte des cookies en cas d'expiration

### 3. **Backend (`backend-mister-api/src/guards/supabase-auth.guard.ts`)**
- ✅ **Extraction depuis cookies** : Priorité aux cookies, fallback sur headers
- ✅ **Compatibilité** : Support des deux méthodes d'authentification

### 4. **Backend (`backend-mister-api/src/middleware/supabase-auth.middleware.ts`)**
- ✅ **Déjà configuré** : Utilise déjà les cookies `access_token` et `sb-access-token`

## 🧪 Tests à Effectuer

### Test 1: Connexion Simple
```bash
# 1. Aller sur http://localhost:3000/login
# 2. Se connecter avec un compte existant
# 3. Vérifier dans les DevTools > Application > Cookies :
#    - access_token présent
#    - sb-access-token présent
# 4. Vérifier que la redirection vers /dashboard fonctionne
```

### Test 2: Persistance de Session
```bash
# 1. Se connecter
# 2. Recharger la page (F5)
# 3. Vérifier que l'utilisateur reste connecté
# 4. Vérifier dans la console les logs :
#    - "🍪 Session cookies: Found"
#    - "✅ Session valid, user data:"
```

### Test 3: Déconnexion
```bash
# 1. Se connecter
# 2. Cliquer sur "Déconnexion"
# 3. Vérifier que les cookies sont supprimés
# 4. Vérifier la redirection vers /login
```

### Test 4: Session Expirée
```bash
# 1. Se connecter
# 2. Supprimer manuellement les cookies dans DevTools
# 3. Recharger la page
# 4. Vérifier la redirection vers /login
```

## 🔍 Vérifications dans la Console

### Frontend (Navigateur)
```javascript
// Vérifier les cookies
console.log('Cookies:', document.cookie);

// Vérifier localStorage (doit être vide)
console.log('localStorage:', localStorage.getItem('access_token'));
```

### Backend (Terminal)
```bash
# Vérifier les logs de connexion
[Nest] LOG [AuthController] 🚀 Début de la connexion pour: email@example.com
[Nest] LOG [AuthController] 🍪 Cookies définis pour email@example.com
[Nest] LOG [AuthController] ✅ Connexion réussie pour: email@example.com

# Vérifier les logs de middleware
[Nest] DEBUG [SupabaseAuthMiddleware] 🍪 Available cookies: access_token, sb-access-token
[Nest] DEBUG [SupabaseAuthMiddleware] ✅ User authenticated: email@example.com
```

## 🚨 Problèmes Courants

### Problème 1: Cookies non envoyés
**Symptôme**: Erreur 401 malgré une connexion réussie
**Solution**: Vérifier que `credentials: 'include'` est présent dans les requêtes

### Problème 2: CORS avec cookies
**Symptôme**: Erreur CORS lors des requêtes
**Solution**: Vérifier la configuration CORS côté backend avec `credentials: true`

### Problème 3: Cookies non persistants
**Symptôme**: Déconnexion après rechargement
**Solution**: Vérifier les options des cookies (httpOnly, secure, sameSite)

## ✅ Checklist de Validation

- [ ] Connexion réussie avec redirection vers /dashboard
- [ ] Cookies présents dans DevTools > Application > Cookies
- [ ] Persistance de session après rechargement
- [ ] Déconnexion fonctionnelle avec suppression des cookies
- [ ] Redirection automatique vers /login si non authentifié
- [ ] Logs backend montrent la réception des cookies
- [ ] Pas d'erreurs CORS dans la console
- [ ] Rôle utilisateur correctement récupéré

## 🔧 Configuration CORS Vérifiée

Le backend est configuré avec :
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'https://mister-api.vercel.app'],
  credentials: true, // Important pour les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
});
```

## 🎉 Résultat Attendu

Après ces modifications, l'authentification devrait fonctionner de manière stable avec :
- ✅ Connexion persistante via cookies HTTP-only
- ✅ Pas de déconnexion automatique
- ✅ Gestion correcte des rôles utilisateur
- ✅ Sécurité renforcée (pas de token dans localStorage) 