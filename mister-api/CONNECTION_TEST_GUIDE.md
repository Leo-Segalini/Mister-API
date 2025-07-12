# Guide de Test de Connexion

## Modifications Effectuées

### 1. Suppression des Fichiers Admin
- ✅ `hooks/useAdmin.tsx` supprimé
- ✅ `components/AdminGuard.tsx` supprimé
- ✅ `app/admin/page.tsx` supprimé
- ✅ `app/gestion-administrateur-login/page.tsx` supprimé

### 2. Configuration CORS Backend
- ✅ Configuration CORS plus permissive
- ✅ Middleware CORS supplémentaire
- ✅ Headers autorisés étendus

### 3. Proxy Next.js
- ✅ Proxy configuré dans `next.config.ts`
- ✅ API service modifié pour utiliser le proxy en production

## Tests à Effectuer

### 1. Test de Connexion Basique
1. Aller sur `https://mister-api.vercel.app/login`
2. Saisir les identifiants :
   - Email : `leo.segalini@outlook.com`
   - Mot de passe : [votre mot de passe]
3. Cliquer sur "Se connecter"
4. Vérifier que la redirection vers `/dashboard` fonctionne

### 2. Vérification des Logs
Dans la console du navigateur, vérifier :
```
🚀 ApiService initialized with baseUrl: /api/backend
🔐 Signin attempt with credentials: {email: 'leo.segalini@outlook.com'}
🌐 Making API request to: /api/backend/api/v1/auth/login
📡 Response status: 200
🍪 Session cookies set automatically by browser
```

### 3. Vérification des Cookies
Dans les DevTools > Application > Cookies, vérifier que :
- Les cookies d'authentification sont présents
- Les cookies ont le bon domaine
- Les cookies ne sont pas supprimés automatiquement

### 4. Test de Persistance
1. Se connecter avec succès
2. Rafraîchir la page
3. Vérifier que l'utilisateur reste connecté
4. Vérifier que la redirection vers `/dashboard` fonctionne

### 5. Test de Déconnexion
1. Cliquer sur "Déconnexion"
2. Vérifier que les cookies sont supprimés
3. Vérifier la redirection vers `/login`

## Problèmes Possibles et Solutions

### 1. Erreur CORS Persistante
**Symptôme** : Erreur CORS dans la console
**Solution** : Vérifier que le proxy Next.js fonctionne

### 2. Cookies Non Définis
**Symptôme** : Connexion réussie mais redirection vers `/login`
**Solution** : Vérifier la configuration des cookies côté backend

### 3. Boucle de Redirection
**Symptôme** : Redirection infinie entre `/login` et `/dashboard`
**Solution** : Vérifier la logique d'authentification dans `useAuth`

### 4. Proxy Non Fonctionnel
**Symptôme** : Erreur 404 sur `/api/backend`
**Solution** : Vérifier la configuration `next.config.ts`

## Logs de Débogage

### Frontend (Console Navigateur)
```javascript
// Vérifier l'URL de l'API
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);

// Vérifier les cookies
console.log('Cookies:', document.cookie);

// Tester la requête manuellement
fetch('/api/backend/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Backend (Logs Render)
- Requêtes reçues sur `/api/v1/auth/login`
- Headers CORS envoyés
- Cookies définis correctement

## Étapes de Validation

1. **Déploiement** : S'assurer que les modifications sont déployées sur Vercel
2. **Cache** : Vider le cache du navigateur
3. **Cookies** : Supprimer tous les cookies existants
4. **Test** : Effectuer une connexion complète
5. **Vérification** : Confirmer que l'utilisateur reste connecté

## Prochaines Étapes

Une fois la connexion de base fonctionnelle :
1. Réimplémenter la gestion des rôles admin
2. Créer la page d'administration
3. Ajouter les fonctionnalités admin
4. Tester la gestion des permissions 