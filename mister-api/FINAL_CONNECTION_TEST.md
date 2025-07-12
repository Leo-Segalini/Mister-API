# Guide de Test Final - Connexion

## Résumé des Modifications

### ✅ Backend
- Configuration CORS permissive
- Cookies avec `domain: '.vercel.app'` et `sameSite: 'none'`
- Gestion des cookies httpOnly sécurisés

### ✅ Frontend
- Suppression des redirections automatiques
- Amélioration de la gestion des cookies
- Gestion des états de connexion

## Test Complet

### 1. Préparation
1. Vider le cache du navigateur
2. Supprimer tous les cookies existants
3. Supprimer localStorage et sessionStorage
4. Ouvrir les DevTools > Console

### 2. Test de Connexion
1. Aller sur `https://mister-api.vercel.app/login`
2. Saisir les identifiants :
   - Email : `leo.segalini@outlook.com`
   - Mot de passe : [votre mot de passe]
3. Cliquer sur "Se connecter"

### 3. Vérification des Logs
**Logs Attendus dans l'Ordre :**
```
🚀 Starting signin process...
🔐 Signin attempt with credentials: {email: 'leo.segalini@outlook.com'}
🌐 Making API request to: /api/backend/api/v1/auth/login
📡 Response status: 200
✅ Signin successful: {...}
📋 Fetching complete user profile...
✅ Complete profile data: {...}
👤 Complete user data with role: {...}
👤 User state updated with complete profile
🔄 Redirecting to dashboard...
```

### 4. Vérification des Cookies
Dans DevTools > Application > Cookies :
- ✅ `access_token` ou `sb-access-token` présent
- ✅ Domaine : `.vercel.app`
- ✅ SameSite : `None`
- ✅ HttpOnly : `true`
- ✅ Secure : `true`

### 5. Test de Persistance
1. Rafraîchir la page `/dashboard`
2. Vérifier que l'utilisateur reste connecté
3. Vérifier les logs :
```
🔐 Initializing authentication...
🍪 Session cookies: Found
🔍 Cookies found, validating session...
✅ Session valid, user data: {...}
✅ Valid session found, user authenticated
```

## Problèmes et Solutions

### ❌ Connexion Échoue
**Vérifier :**
- URL de l'API correcte
- Configuration CORS backend
- Logs d'erreur dans la console

### ❌ Cookies Non Définis
**Vérifier :**
- Configuration `domain` et `sameSite` backend
- HTTPS en production
- Headers de réponse

### ❌ Redirection vers /login
**Vérifier :**
- État `isSigningIn` dans useAuth
- Validation de session
- Logs d'initialisation

### ❌ Validation de Session Échoue
**Vérifier :**
- Endpoint `/profile` accessible
- Cookies envoyés avec les requêtes
- Logs backend

## Debug Avancé

### Test Manuel de l'API
```javascript
// Tester la connexion
fetch('/api/backend/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'leo.segalini@outlook.com',
    password: 'votre_mot_de_passe'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Tester le profil
fetch('/api/backend/api/v1/auth/profile', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Vérifier l'État Global
```javascript
// Dans la console
console.log('Cookies:', document.cookie);
console.log('LocalStorage:', Object.keys(localStorage));
console.log('SessionStorage:', Object.keys(sessionStorage));
```

## Validation Finale

### ✅ Connexion Réussie
- [ ] Connexion sans erreur
- [ ] Redirection vers `/dashboard`
- [ ] Cookies définis correctement
- [ ] Utilisateur connecté

### ✅ Persistance de Session
- [ ] Rafraîchissement de page OK
- [ ] Utilisateur reste connecté
- [ ] Pas de redirection vers `/login`

### ✅ Déconnexion
- [ ] Bouton déconnexion fonctionne
- [ ] Cookies supprimés
- [ ] Redirection vers `/login`

## Prochaines Étapes

Une fois la connexion stable :
1. **Réintégrer les rôles admin**
2. **Créer la page d'administration**
3. **Ajouter les fonctionnalités admin**
4. **Optimiser les performances**

## Support

Si le problème persiste :
1. Vérifier les logs backend sur Render
2. Vérifier les logs frontend dans la console
3. Tester avec les outils de debug fournis
4. Consulter les guides de débogage créés 