# Guide de Test - Page Profil & Paramètres

## 🎯 Fonctionnalités implémentées

### 1. **Page Profil Complète**
- ✅ Interface moderne avec design sombre
- ✅ Affichage des informations utilisateur
- ✅ Mode édition pour modifier le profil
- ✅ Validation des formulaires
- ✅ Gestion des états de chargement

### 2. **Gestion du Profil**
- ✅ Modification des informations personnelles
- ✅ Champs modifiables : nom, prénom, téléphone, date de naissance, adresse
- ✅ Email en lecture seule (non modifiable)
- ✅ Sauvegarde automatique des modifications

### 3. **Sécurité**
- ✅ Changement de mot de passe
- ✅ Validation du mot de passe actuel
- ✅ Critères de sécurité (minimum 8 caractères)
- ✅ Confirmation du nouveau mot de passe
- ✅ Affichage/masquage des mots de passe

### 4. **Statut Premium**
- ✅ Affichage du statut premium
- ✅ Date d'expiration du premium
- ✅ ID client Stripe
- ✅ Badge premium visible

### 5. **Navigation**
- ✅ Accès via le menu utilisateur dans le header
- ✅ Bouton de retour au dashboard
- ✅ Protection de route (authentification requise)

## 🔧 Backend - Endpoints ajoutés

### 1. **PUT /api/v1/auth/profile**
```typescript
// Mise à jour du profil utilisateur
async updateProfile(
  @Req() req: AuthenticatedRequest,
  @Body() updateProfileDto: any
): Promise<ApiResponse<any>>
```

**Champs autorisés :**
- `nom`, `prenom`, `telephone`, `date_naissance`
- `adresse_postale`, `code_postal`, `ville`, `pays`

### 2. **POST /api/v1/auth/change-password**
```typescript
// Changement de mot de passe
async changePassword(
  @Req() req: AuthenticatedRequest,
  @Body() changePasswordDto: { current_password: string; new_password: string }
): Promise<ApiResponse<any>>
```

### 3. **Service Supabase - Méthodes ajoutées**
```typescript
// Mise à jour du profil
async updateUserProfile(userId: string, userData: any)

// Changement de mot de passe
async changePassword(email: string, currentPassword: string, newPassword: string)
```

## 🎨 Frontend - Composants

### 1. **Page Profil (`/app/profile/page.tsx`)**
- Interface responsive avec Tailwind CSS
- Animations avec Framer Motion
- Gestion d'état avec React hooks
- Intégration avec le système de toast

### 2. **Service API (`/lib/api.ts`)**
```typescript
// Mise à jour du profil
async updateProfile(userData: Partial<User>): Promise<User>

// Changement de mot de passe
async changePassword(currentPassword: string, newPassword: string): Promise<void>
```

## 🧪 Tests à effectuer

### 1. **Test de Navigation**
```bash
# 1. Se connecter à l'application
# 2. Cliquer sur l'avatar utilisateur dans le header
# 3. Sélectionner "Profil" dans le menu déroulant
# 4. Vérifier que la page s'affiche correctement
```

### 2. **Test de Modification du Profil**
```bash
# 1. Cliquer sur "Modifier" dans la section "Informations Personnelles"
# 2. Modifier quelques champs (prénom, téléphone, adresse)
# 3. Cliquer sur "Sauvegarder"
# 4. Vérifier que les modifications sont sauvegardées
# 5. Vérifier que l'email reste en lecture seule
```

### 3. **Test de Changement de Mot de Passe**
```bash
# 1. Cliquer sur "Changer le mot de passe" dans la section "Sécurité"
# 2. Saisir le mot de passe actuel
# 3. Saisir un nouveau mot de passe (minimum 8 caractères)
# 4. Confirmer le nouveau mot de passe
# 5. Cliquer sur "Modifier"
# 6. Vérifier que le mot de passe est changé
# 7. Se déconnecter et se reconnecter avec le nouveau mot de passe
```

### 4. **Test de Validation**
```bash
# 1. Tester avec un mot de passe trop court (< 8 caractères)
# 2. Tester avec des mots de passe qui ne correspondent pas
# 3. Tester avec un mot de passe actuel incorrect
# 4. Vérifier que les messages d'erreur s'affichent correctement
```

### 5. **Test du Statut Premium**
```bash
# 1. Vérifier que le badge "Premium" s'affiche si l'utilisateur est premium
# 2. Vérifier que la date d'expiration s'affiche correctement
# 3. Vérifier que l'ID client Stripe s'affiche
```

### 6. **Test de Responsive**
```bash
# 1. Tester sur mobile (menu hamburger)
# 2. Tester sur tablette
# 3. Tester sur desktop
# 4. Vérifier que l'interface s'adapte correctement
```

## 🔍 Points de vérification

### 1. **Sécurité**
- ✅ Authentification requise pour accéder à la page
- ✅ Validation côté client et serveur
- ✅ Protection contre les injections
- ✅ Gestion sécurisée du changement de mot de passe

### 2. **UX/UI**
- ✅ Interface intuitive et moderne
- ✅ Feedback visuel pour les actions
- ✅ États de chargement
- ✅ Messages d'erreur clairs
- ✅ Animations fluides

### 3. **Performance**
- ✅ Chargement rapide de la page
- ✅ Optimisation des requêtes API
- ✅ Gestion du cache

### 4. **Accessibilité**
- ✅ Labels appropriés pour les champs
- ✅ Navigation au clavier
- ✅ Contraste des couleurs
- ✅ Messages d'erreur accessibles

## 🚀 Déploiement

### 1. **Backend (Render)**
```bash
# Les modifications sont automatiquement déployées
# Vérifier que les nouveaux endpoints fonctionnent
```

### 2. **Frontend (Vercel)**
```bash
# Les modifications sont automatiquement déployées
# Vérifier que la page profil est accessible
```

## 📝 Notes importantes

1. **Email non modifiable** : L'email est affiché en lecture seule car il est géré par Supabase Auth
2. **Validation des mots de passe** : Minimum 8 caractères requis
3. **Sécurité** : Le changement de mot de passe vérifie d'abord l'ancien mot de passe
4. **Statut Premium** : Affiché automatiquement si l'utilisateur a un abonnement actif
5. **Responsive** : L'interface s'adapte à tous les écrans

## 🔧 Dépannage

### Problèmes courants :
1. **Erreur 401** : Vérifier que l'utilisateur est connecté
2. **Erreur de validation** : Vérifier les critères de mot de passe
3. **Données non mises à jour** : Vérifier la connexion à la base de données
4. **Problème d'affichage** : Vérifier les données utilisateur dans le hook useAuth

### Logs utiles :
- Backend : Vérifier les logs dans Render
- Frontend : Vérifier la console du navigateur
- API : Vérifier les requêtes dans l'onglet Network 