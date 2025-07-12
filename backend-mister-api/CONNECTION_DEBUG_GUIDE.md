# Guide de Diagnostic - Problème de Déconnexion Automatique

## 🚨 Problème Identifié
Après une connexion réussie, l'utilisateur est automatiquement déconnecté.

## 🔍 Causes Possibles

### 1. **Conflit de Middleware**
Le `SupabaseAuthMiddleware` traite toutes les requêtes et peut interférer avec la gestion des cookies.

### 2. **Configuration CORS**
Les cookies peuvent ne pas être correctement transmis entre le frontend et le backend.

### 3. **Configuration des Cookies**
Les options des cookies peuvent ne pas être compatibles avec l'environnement.

### 4. **Token Expiré ou Invalide**
Le token Supabase peut expirer rapidement ou être invalide.

## 🛠️ Solutions à Tester

### Solution 1: Désactiver Temporairement le Middleware
```typescript
// Dans app.module.ts, commenter temporairement le middleware
configure(consumer: MiddlewareConsumer) {
  // consumer
  //   .apply(SupabaseAuthMiddleware)
  //   .exclude(...)
  //   .forRoutes('*');
}
```

### Solution 2: Modifier la Configuration des Cookies
```typescript
// Dans auth.controller.ts, modifier les options des cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // Changer de 'none' à 'lax'
  maxAge: 4 * 60 * 60 * 1000, // 4 heures
  path: '/',
  domain: undefined, // Laisser undefined pour le domaine actuel
};
```

### Solution 3: Vérifier la Configuration CORS
```typescript
// Dans main.ts, s'assurer que credentials est activé
app.enableCors({
  origin: true, // Ou spécifier les origines autorisées
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
});
```

### Solution 4: Ajouter des Logs de Debug
```typescript
// Dans auth.controller.ts, ajouter des logs détaillés
this.logger.log(`🍪 Cookie access_token défini: ${session.access_token ? 'Oui' : 'Non'}`);
this.logger.log(`🍪 Cookie options:`, cookieOptions);
this.logger.log(`🌐 NODE_ENV: ${process.env.NODE_ENV}`);
```

## 🧪 Tests à Effectuer

### Test 1: Vérifier les Cookies dans le Navigateur
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet Application/Storage
3. Vérifier que les cookies `access_token` et `sb-access-token` sont présents
4. Vérifier leur durée de vie et leurs propriétés

### Test 2: Vérifier les Headers de Requête
1. Dans les DevTools, onglet Network
2. Effectuer une connexion
3. Vérifier que les cookies sont envoyés dans les requêtes suivantes

### Test 3: Test avec Postman/Insomnia
1. Effectuer une requête de connexion
2. Vérifier la réponse et les cookies
3. Effectuer une requête authentifiée avec les cookies

## 🔧 Corrections Recommandées

### 1. Modifier le Middleware pour être moins intrusif
```typescript
// Dans supabase-auth.middleware.ts
async use(req: Request, res: Response, next: NextFunction) {
  // Ne traiter que les routes qui nécessitent une authentification
  if (req.path.startsWith('/auth/') || req.path === '/') {
    return next();
  }
  
  // Reste du code...
}
```

### 2. Améliorer la Gestion des Erreurs
```typescript
// Dans supabase.service.ts, méthode verifyToken
async verifyToken(token: string): Promise<User | null> {
  try {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    
    if (error) {
      this.logger.warn(`Token invalide: ${error.message}`);
      return null;
    }

    return user;
  } catch (error) {
    this.logger.error('Erreur lors de la vérification du token:', error);
    return null;
  }
}
```

### 3. Vérifier la Configuration Supabase
```typescript
// S'assurer que les variables d'environnement sont correctes
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📋 Checklist de Diagnostic

- [ ] Vérifier les logs du backend lors de la connexion
- [ ] Vérifier les cookies dans le navigateur
- [ ] Tester avec Postman/Insomnia
- [ ] Vérifier la configuration CORS
- [ ] Vérifier les variables d'environnement Supabase
- [ ] Tester sans le middleware d'authentification
- [ ] Vérifier la durée de vie des tokens Supabase

## 🚀 Prochaines Étapes

1. **Tester la Solution 1** (désactiver le middleware)
2. **Si ça fonctionne**, modifier le middleware pour être moins intrusif
3. **Si ça ne fonctionne pas**, tester la Solution 2 (modifier les cookies)
4. **Ajouter des logs** pour identifier le point exact du problème
5. **Vérifier la configuration** Supabase et CORS

---

**Note**: Le problème vient probablement du fait que le middleware traite toutes les requêtes et peut interférer avec la gestion des cookies de session. 