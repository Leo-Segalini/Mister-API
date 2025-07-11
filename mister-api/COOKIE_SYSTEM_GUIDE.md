# Guide - Système de Gestion des Cookies

## 🍪 Système implémenté

### 1. **Bannière de cookies conforme RGPD**
- ✅ Affichage automatique pour les nouveaux visiteurs
- ✅ Options d'acceptation/refus/paramétrage
- ✅ Interface moderne et responsive
- ✅ Sauvegarde des préférences

### 2. **Types de cookies gérés**
- ✅ **Cookies nécessaires** : Session, authentification, sécurité (toujours actifs)
- ✅ **Cookies analytiques** : Google Analytics, statistiques
- ✅ **Cookies de marketing** : Publicités, tracking
- ✅ **Cookies de préférences** : Langue, thème, paramètres

### 3. **Fonctionnalités**
- ✅ Sauvegarde dans localStorage
- ✅ Application automatique des préférences
- ✅ Possibilité de modifier les choix
- ✅ Conformité RGPD complète

## 🧪 Tests à effectuer

### 1. **Test de la bannière initiale**
```bash
# 1. Ouvrir le site dans un navigateur privé
# 2. Vérifier que la bannière apparaît en bas de page
# 3. Tester les trois boutons : "Accepter tout", "Refuser tout", "Personnaliser"
# 4. Vérifier que la bannière disparaît après choix
```

### 2. **Test des paramètres détaillés**
```bash
# 1. Cliquer sur "Personnaliser"
# 2. Vérifier que les 4 types de cookies sont affichés
# 3. Tester les checkboxes (sauf "nécessaires" qui est désactivé)
# 4. Cliquer sur "Enregistrer mes choix"
# 5. Vérifier que les préférences sont sauvegardées
```

### 3. **Test de persistance**
```bash
# 1. Faire un choix de cookies
# 2. Fermer et rouvrir le navigateur
# 3. Vérifier que la bannière ne réapparaît pas
# 4. Vérifier que les préférences sont conservées
```

### 4. **Test de modification**
```bash
# 1. Aller dans le footer
# 2. Cliquer sur "Gérer les cookies"
# 3. Vérifier que la bannière réapparaît
# 4. Modifier les préférences
# 5. Vérifier que les nouveaux choix sont appliqués
```

### 5. **Test de conformité RGPD**
```bash
# 1. Vérifier que les cookies nécessaires sont toujours actifs
# 2. Vérifier que les autres cookies ne sont pas déposés sans consentement
# 3. Tester le refus de tous les cookies optionnels
# 4. Vérifier que le site fonctionne toujours
```

## 🔧 Configuration

### 1. **Intégration Google Analytics**
```typescript
// Dans hooks/useCookies.tsx, décommentez et configurez :
function enableGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  
  // Ajouter votre ID Google Analytics
  window.gtag('consent', 'update', {
    'analytics_storage': 'granted'
  });
  
  // Initialiser Google Analytics
  window.gtag('config', 'GA_MEASUREMENT_ID');
}
```

### 2. **Ajout de nouveaux types de cookies**
```typescript
// 1. Étendre l'interface CookiePreferences
interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  // Ajouter votre nouveau type
  custom: boolean;
}

// 2. Ajouter la gestion dans useCookies
if (preferences.custom) {
  enableCustomCookies();
} else {
  disableCustomCookies();
}
```

### 3. **Personnalisation de la bannière**
```typescript
// Dans CookieBanner.tsx, modifier :
- Les couleurs et styles
- Le texte des descriptions
- Les icônes utilisées
- L'ordre des options
```

## 📋 Checklist de validation

### Bannière de cookies :
- [ ] Apparaît pour les nouveaux visiteurs
- [ ] Disparaît après choix
- [ ] Interface responsive
- [ ] Animations fluides
- [ ] Liens vers politique de confidentialité

### Types de cookies :
- [ ] Cookies nécessaires (toujours actifs)
- [ ] Cookies analytiques (optionnels)
- [ ] Cookies de marketing (optionnels)
- [ ] Cookies de préférences (optionnels)

### Fonctionnalités :
- [ ] Sauvegarde des préférences
- [ ] Application automatique
- [ ] Possibilité de modification
- [ ] Persistance entre sessions

### Conformité RGPD :
- [ ] Consentement explicite requis
- [ ] Possibilité de refuser
- [ ] Choix granulaire
- [ ] Information claire
- [ ] Accès facile aux paramètres

## 🚀 Déploiement

### 1. **Frontend (Vercel)**
```bash
# Les modifications sont automatiquement déployées
# Vérifier que la bannière apparaît sur le site en production
```

### 2. **Configuration Google Analytics**
```bash
# 1. Créer un compte Google Analytics
# 2. Obtenir l'ID de mesure
# 3. Configurer le consentement mode
# 4. Tester l'intégration
```

## 🔧 Dépannage

### Problèmes courants :
1. **Bannière ne s'affiche pas** : Vérifier localStorage et console
2. **Préférences non sauvegardées** : Vérifier les erreurs localStorage
3. **Google Analytics ne fonctionne pas** : Vérifier l'ID et la configuration
4. **Bannière réapparaît** : Vérifier la logique de persistance

### Logs utiles :
- Console navigateur : Vérifier les logs de cookies
- localStorage : Vérifier les données sauvegardées
- Network : Vérifier les requêtes Google Analytics

## 📝 Notes importantes

### Conformité RGPD :
- Les cookies nécessaires sont toujours actifs
- Le consentement est requis pour les autres types
- Les préférences sont sauvegardées pendant 13 mois
- L'utilisateur peut modifier ses choix à tout moment

### Performance :
- La bannière ne bloque pas le chargement de la page
- Les préférences sont chargées de manière asynchrone
- Les cookies non autorisés ne sont pas déposés

### Accessibilité :
- Navigation au clavier possible
- Contraste des couleurs approprié
- Labels et descriptions clairs
- Compatible avec les lecteurs d'écran 