# Guide de Résolution - Expiration Immédiate des Tokens JWT

## 🔍 Problème Identifié

Les tokens JWT expirent immédiatement après leur création, causant des erreurs d'authentification même avec des tokens valides.

## 📋 Diagnostic

### 1. Vérifier l'État des Tokens

Après déploiement, testez l'endpoint de diagnostic :

```bash
# Connectez-vous d'abord
curl -X POST https://mister-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email@example.com", "password": "votre-mot-de-passe"}' \
  -c cookies.txt

# Ensuite, diagnostiquez le token
curl -X GET https://mister-api.onrender.com/auth/diagnose-token \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### 2. Analyser les Logs

Vérifiez les logs pour identifier :
- Décalage d'horloge (`clockDrift`)
- Temps restant avant expiration (`timeUntilExpiry`)
- Informations de diagnostic détaillées

## 🔧 Solutions Implémentées

### 1. Service de Diagnostic des Tokens

- **Fichier** : `src/services/token-diagnostic.service.ts`
- **Fonction** : Analyse les tokens JWT et identifie les problèmes
- **Capacités** :
  - Décodage des claims JWT
  - Calcul du décalage d'horloge
  - Vérification de l'expiration
  - Recommandations automatiques

### 2. Gestion Automatique du Refresh

- **Fichier** : `src/services/supabase.service.ts`
- **Fonction** : Refresh automatique des tokens expirés
- **Fonctionnalités** :
  - Détection automatique des tokens expirés
  - Utilisation du refresh token pour renouveler
  - Mise à jour transparente des cookies

### 3. Middleware Amélioré

- **Fichier** : `src/middleware/supabase-auth.middleware.ts`
- **Améliorations** :
  - Diagnostic préalable des tokens
  - Tentative de refresh automatique
  - Logs détaillés pour le debugging

### 4. Gestion des Cookies Optimisée

- **Fichier** : `src/controllers/auth.controller.ts`
- **Améliorations** :
  - Stockage du refresh token (7 jours)
  - Gestion des domaines cross-origin
  - Configuration sécurisée des cookies

## 🧪 Tests à Effectuer

### 1. Test de Connexion

```bash
# Test de connexion basique
curl -X POST https://mister-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "leo.segalini@outlook.com", "password": "votre-mot-de-passe"}' \
  -v
```

### 2. Test de Diagnostic

```bash
# Test du diagnostic de token
curl -X GET https://mister-api.onrender.com/auth/diagnose-token \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

### 3. Test d'Accès API

```bash
# Test d'accès aux API keys
curl -X GET https://mister-api.onrender.com/api-keys \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

## 🔄 Mécanismes de Récupération

### 1. Refresh Automatique

Le système détecte automatiquement les tokens expirés et tente de les renouveler :

```typescript
// Le middleware vérifie automatiquement
if (!user && refreshToken) {
  // Tentative de refresh automatique
  const refreshResult = await this.supabaseService.refreshTokenIfNeeded(token, refreshToken);
  if (refreshResult.refreshed) {
    // Mise à jour des cookies
    // Nouvelle tentative de vérification
  }
}
```

### 2. Diagnostic Préventif

Avant chaque vérification de token :

```typescript
// Diagnostic préalable
const diagnostic = await this.diagnoseToken(token);
if (!diagnostic.isValid) {
  // Logs détaillés + recommandations
  // Tentative de récupération
}
```

## 🛠️ Configuration Requise

### Variables d'Environnement

Vérifiez que ces variables sont correctement configurées :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-anonyme
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service
NODE_ENV=production
```

### Cookies Configuration

```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const,
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
};
```

## 📊 Métriques à Surveiller

### 1. Temps de Réponse

- Latence de vérification des tokens
- Temps de refresh des tokens
- Performance générale des API

### 2. Taux d'Erreur

- Pourcentage de tokens expirés
- Succès du refresh automatique
- Erreurs d'authentification

### 3. Décalage d'Horloge

- Différence entre serveur et Supabase
- Drift temporel des tokens
- Synchronisation NTP

## 🚨 Résolution d'Urgence

Si le problème persiste après déploiement :

### 1. Vérification Immédiate

```bash
# Vérifier les logs en temps réel
curl -X GET https://mister-api.onrender.com/auth/diagnose-token \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
```

### 2. Forcer le Refresh

```bash
# Forcer une nouvelle connexion
curl -X POST https://mister-api.onrender.com/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Reconnexion
curl -X POST https://mister-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email", "password": "votre-mot-de-passe"}' \
  -c cookies.txt
```

### 3. Diagnostic Système

```bash
# Vérifier l'heure du serveur
curl -X GET https://mister-api.onrender.com/auth/diagnose-token \
  -b cookies.txt | jq '.data.systemInfo.serverTime'

# Comparer avec l'heure locale
date -u +"%Y-%m-%dT%H:%M:%S.%3NZ"
```

## 🔍 Points de Vérification

1. **Décalage d'horloge** : Vérifier que `clockDrift` < 60 secondes
2. **Expiration** : Vérifier que `timeUntilExpiry` > 0
3. **Refresh token** : Vérifier sa présence et validité
4. **Cookies** : Vérifier leur bon stockage et transmission
5. **Logs** : Surveiller les messages de diagnostic

## 📞 Support

Si le problème persiste, fournir :
- Logs complets du diagnostic
- Timestamp exact du problème
- Configuration des variables d'environnement
- Résultats des tests curl

---

**Note** : Ce guide couvre la résolution du problème d'expiration immédiate des tokens JWT identifié dans vos logs. Le système implémente désormais une gestion robuste avec diagnostic automatique et récupération transparente. 