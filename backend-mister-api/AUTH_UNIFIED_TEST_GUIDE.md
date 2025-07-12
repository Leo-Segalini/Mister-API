# Guide de Test du Système d'Authentification Unifié

## Objectif
Ce guide permet de tester le système d'authentification unifié avec les corrections apportées pour résoudre les problèmes de cookies cross-origin et les conflits de middleware.

## Corrections Apportées

### 1. **Réactivation du Middleware Next.js**
- **Fichier**: `mister-api/middleware.ts`
- **Changement**: Logique d'authentification simplifiée et réactivée
- **Impact**: Protection automatique des routes côté serveur

### 2. **Unification des Composants de Protection**
- **Fichier**: `mister-api/components/ProtectedRoute.tsx`
- **Changement**: Composant unifié remplaçant AuthGuard
- **Impact**: Logique centralisée et cohérente

### 3. **Simplification de useAuth**
- **Fichier**: `mister-api/hooks/useAuth.tsx`
- **Changement**: Logique simplifiée, suppression des conflits
- **Impact**: Authentification plus stable et prévisible

### 4. **Configuration Cookies Cross-Origin**
- **Fichiers**: 
  - `backend-mister-api/src/middleware/supabase-auth.middleware.ts`
  - `backend-mister-api/src/controllers/auth.controller.ts`
- **Changement**: Configuration unifiée pour cross-origin
- **Impact**: Cookies fonctionnels entre domaines différents

## Tests à Effectuer

### Phase 1: Test de Base
```bash
# 1. Démarrer le backend
cd backend-mister-api
npm run start:dev

# 2. Démarrer le frontend
cd mister-api
npm run dev
```

### Phase 2: Test d'Authentification

#### Test 1: Connexion Standard
1. Aller sur `http://localhost:3000/login`
2. Se connecter avec des identifiants valides
3. **Vérifier**: Redirection automatique vers `/dashboard`
4. **Vérifier**: Cookies définis dans les DevTools

#### Test 2: Protection des Routes
1. Aller directement sur `http://localhost:3000/dashboard` (sans connexion)
2. **Vérifier**: Redirection automatique vers `/login`
3. Se connecter
4. **Vérifier**: Retour automatique vers `/dashboard`

#### Test 3: Persistence de Session
1. Se connecter
2. Fermer et rouvrir le navigateur
3. Aller sur `http://localhost:3000/dashboard`
4. **Vérifier**: Accès direct sans nouvelle connexion

#### Test 4: Déconnexion
1. Se connecter
2. Cliquer sur déconnexion
3. **Vérifier**: Redirection vers `/login`
4. **Vérifier**: Cookies supprimés dans les DevTools

### Phase 3: Test Cross-Origin (Production)

#### Test 1: Cookies Cross-Origin
1. Déployer sur Vercel (frontend) et Render (backend)
2. Se connecter via `https://mister-api.vercel.app/login`
3. **Vérifier**: Cookies définis avec `SameSite=None; Secure`
4. **Vérifier**: Authentification persistante

#### Test 2: Fallback Headers
1. Si les cookies ne fonctionnent pas, vérifier les headers
2. Inspecter les requêtes dans Network tab
3. **Vérifier**: Headers `Authorization` et `X-Refresh-Token`

### Phase 4: Test des Endpoints API

#### Test 1: Diagnostic des Cookies
```bash
# Test avec curl
curl -X GET "https://mister-api.onrender.com/api/v1/cookie-diagnostic/test-cookies" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test de statut
curl -X GET "https://mister-api.onrender.com/api/v1/cookie-diagnostic/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test 2: Récupération des API Keys
```bash
# Test avec Postman
GET https://mister-api.onrender.com/api/v1/api-keys
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
```

## Indicateurs de Succès

### ✅ Succès Total
- [ ] Connexion fonctionne sans erreur
- [ ] Redirection automatique vers dashboard
- [ ] Protection des routes active
- [ ] Session persistante après fermeture navigateur
- [ ] Déconnexion nettoie correctement la session
- [ ] Cookies définis avec bonnes options
- [ ] API calls authentifiées fonctionnent

### ⚠️ Succès Partiel
- [ ] Connexion fonctionne mais cookies non transmis
- [ ] Fallback headers fonctionnent
- [ ] API calls réussissent via headers Authorization

### ❌ Échec
- [ ] Erreurs de connexion
- [ ] Boucles de redirection
- [ ] Sessions non persistantes
- [ ] API calls échouent

## Troubleshooting

### Problème: Boucle de Redirection
**Solution**: Vérifier que le middleware Next.js ne conflicte pas avec useAuth

### Problème: Cookies Non Transmis
**Solution**: Vérifier configuration CORS et SameSite=None

### Problème: Session Non Persistante
**Solution**: Vérifier durée des cookies et validation de session

### Problème: API Calls Échouent
**Solution**: Vérifier headers Authorization et configuration CORS

## Logs à Surveiller

### Frontend (Console)
```
✅ Connexion réussie: user@example.com
✅ Session valide: user@example.com
✅ ProtectedRoute: Accès autorisé à /dashboard
```

### Backend (Logs)
```
✅ Token verified for user: user@example.com
🍪 Cookies définis pour user@example.com avec durée de 4 heures
✅ API key validated successfully
```

## Commandes de Debug

### Vérifier les Cookies
```javascript
// Dans la console du navigateur
document.cookie.split(';').forEach(cookie => {
  console.log(cookie.trim());
});
```

### Vérifier les Headers
```javascript
// Dans Network tab des DevTools
// Chercher les headers Authorization et X-Refresh-Token
```

### Test Manuel API
```bash
# Tester le endpoint de diagnostic
curl -X GET "http://localhost:3001/api/v1/cookie-diagnostic/status" \
  -H "Cookie: access_token=YOUR_TOKEN"
```

## Résultats Attendus

Après ces corrections, le système d'authentification doit être:
1. **Unifié**: Une seule logique d'authentification
2. **Stable**: Pas de conflits entre middlewares
3. **Cross-Origin**: Cookies fonctionnels entre domaines
4. **Resilient**: Fallback automatique sur headers si besoin
5. **Sécurisé**: Protection appropriée des routes

## Prochaines Étapes

Une fois les tests validés:
1. Supprimer les anciens fichiers AuthGuard non utilisés
2. Nettoyer les logs de debug
3. Optimiser la performance des validations
4. Ajouter des tests automatisés
5. Documenter l'architecture finale 