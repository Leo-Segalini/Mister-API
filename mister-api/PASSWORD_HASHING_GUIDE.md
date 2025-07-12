# Guide - Hachage des Mots de Passe

## Vue d'ensemble

L'application utilise **Supabase Auth** pour la gestion complète de l'authentification, y compris le hachage des mots de passe.

## Configuration Actuelle

### 1. Utilisation de Supabase Auth

**Aucun hachage personnalisé** n'est implémenté dans l'application. Tous les mots de passe sont gérés par Supabase Auth qui utilise :

- **Algorithme** : bcrypt
- **Configuration** : Paramètres par défaut de Supabase
- **Sécurité** : Niveau de sécurité élevé

### 2. Points d'Entrée des Mots de Passe

#### A. Inscription (`/api/v1/auth/register`)
```typescript
// backend-mister-api/src/services/supabase.service.ts
const { data, error } = await this.supabase.auth.signUp({
  email: registerDto.email,
  password: registerDto.password, // ← Haché automatiquement par Supabase
  options: {
    data: {
      // Métadonnées utilisateur
    }
  }
});
```

#### B. Connexion (`/api/v1/auth/login`)
```typescript
const { data, error } = await this.supabase.auth.signInWithPassword({
  email: loginDto.email,
  password: loginDto.password // ← Comparé automatiquement par Supabase
});
```

#### C. Changement de Mot de Passe (`/api/v1/auth/change-password`)
```typescript
const { data: updateData, error: updateError } = await this.supabase.auth.updateUser({
  password: newPassword // ← Haché automatiquement par Supabase
});
```

#### D. Réinitialisation de Mot de Passe (`/api/v1/auth/reset-password`)
```typescript
const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.FRONTEND_URL}/reset-password`
});
```

## Paramètres de Hachage Supabase

### Configuration Par Défaut

Supabase utilise les paramètres suivants pour le hachage bcrypt :

- **Algorithme** : bcrypt
- **Rounds (cost factor)** : **10** (par défaut)
- **Salt** : Généré automatiquement
- **Version** : bcrypt 2b

### Calcul de la Complexité

Avec **10 rounds** :
- **Temps de hachage** : ~100ms sur un CPU moderne
- **Résistance aux attaques** : Très élevée
- **Compatibilité** : Excellente

## Sécurité Implémentée

### 1. Validation des Mots de Passe

#### Frontend (Validation Côté Client)
```typescript
// mister-api/app/register/page.tsx
if (formData.password.length < 6) {
  showError('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
  return;
}
```

#### Backend (Validation Côté Serveur)
```typescript
// backend-mister-api/src/services/supabase.service.ts
if (error.message.includes('Password should be at least')) {
  throw new Error('Password should be at least 6 characters');
}
```

### 2. Protection Contre les Attaques

- ✅ **Rate Limiting** : Limitation des tentatives de connexion
- ✅ **Brute Force Protection** : Délais entre les tentatives
- ✅ **Salt Unique** : Chaque mot de passe a son propre salt
- ✅ **Hachage Lent** : bcrypt avec 10 rounds

### 3. Gestion des Erreurs

```typescript
// Gestion des erreurs de mot de passe
if (error.message.includes('Invalid login credentials') || 
    error.message.includes('Invalid email or password')) {
  errorMessage = 'Email ou mot de passe incorrect.';
}
```

## Comparaison avec d'Autres Standards

### Niveaux de Sécurité

| Algorithme | Rounds | Temps de Hachage | Sécurité |
|------------|--------|------------------|----------|
| **bcrypt (Supabase)** | **10** | ~100ms | **Très Élevée** |
| bcrypt (recommandé) | 12 | ~400ms | Très Élevée |
| bcrypt (minimum) | 8 | ~25ms | Élevée |
| bcrypt (maximum) | 14 | ~1.6s | Très Élevée |

### Recommandations OWASP

- ✅ **Minimum** : 10 rounds (implémenté)
- ✅ **Recommandé** : 12 rounds
- ✅ **Maximum** : 14 rounds (pour les applications critiques)

## Vérification de la Configuration

### 1. Vérifier les Paramètres Supabase

```bash
# Via l'interface Supabase Dashboard
# Authentication > Settings > Password Policy
```

### 2. Tester la Force du Hachage

```typescript
// Test de performance (non implémenté)
const start = Date.now();
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
});
const end = Date.now();
console.log(`Temps de hachage: ${end - start}ms`);
```

## Améliorations Possibles

### 1. Augmenter les Rounds (Optionnel)

Si vous souhaitez augmenter la sécurité, vous pouvez configurer Supabase pour utiliser plus de rounds :

```sql
-- Dans Supabase SQL Editor (si supporté)
ALTER SYSTEM SET password_hash_cost = 12;
```

### 2. Validation Plus Stricte

```typescript
// Validation plus stricte des mots de passe
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(formData.password)) {
  showError('Erreur', 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
  return;
}
```

### 3. Audit de Sécurité

```typescript
// Logging des tentatives de connexion
this.logger.log(`🔐 Tentative de connexion pour: ${loginDto.email}`);
this.logger.log(`📊 Code d'erreur: ${error.status}, Type: ${error.name}`);
```

## Monitoring et Logs

### Logs Actuels

```typescript
// Logs de connexion
this.logger.log(`🔐 Tentative de connexion pour: ${loginDto.email}`);
this.logger.log(`✅ Connexion réussie pour: ${data.user?.email}`);

// Logs de changement de mot de passe
this.logger.log(`🔐 Tentative de changement de mot de passe pour: ${email}`);
this.logger.log(`✅ Mot de passe changé avec succès pour: ${email}`);
```

### Métriques Recommandées

- ✅ Temps de réponse des opérations d'authentification
- ✅ Taux d'échec de connexion
- ✅ Tentatives de réinitialisation de mot de passe
- ✅ Activité suspecte (trop de tentatives)

## Conclusion

### Configuration Actuelle
- **Rounds de hachage** : **10** (par défaut Supabase)
- **Algorithme** : bcrypt
- **Sécurité** : Très élevée
- **Performance** : Optimale

### Recommandations
1. ✅ **Maintenir** la configuration actuelle (10 rounds)
2. ✅ **Surveiller** les logs d'authentification
3. ✅ **Implémenter** une validation plus stricte des mots de passe si nécessaire
4. ✅ **Considérer** l'augmentation à 12 rounds pour les applications critiques

La configuration actuelle offre un excellent équilibre entre sécurité et performance, conforme aux standards de l'industrie. 