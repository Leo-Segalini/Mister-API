# Guide de Test - Inscription avec Conditions Obligatoires

## Modifications Apportées

### Frontend (mister-api/)

1. **Types mis à jour** (`types/index.ts`) :
   - Ajout de `politique_confidentialite_acceptee: boolean`
   - Ajout de `conditions_generales_acceptees: boolean`

2. **Page d'inscription** (`app/register/page.tsx`) :
   - Ajout de checkboxes obligatoires pour les conditions
   - Validation côté client des acceptations
   - Aperçu des conditions dans des accordéons
   - Envoi des données au backend

### Backend (backend-mister-api/)

1. **DTO mis à jour** (`dto/auth.dto.ts`) :
   - Ajout des champs obligatoires dans `RegisterDto`
   - Validation avec `@IsNotEmpty()`

2. **Entité User** (`entities/user.entity.ts`) :
   - Colonnes déjà présentes pour les acceptations légales
   - Horodatage des acceptations

3. **Script SQL** (`sql/add_legal_acceptance_columns.sql`) :
   - Ajout des colonnes si elles n'existent pas

## Tests de Validation

### Test 1 : Inscription sans Accepter les Conditions

1. **Accédez à** `http://localhost:3000/register`
2. **Remplissez le formulaire** sans cocher les checkboxes
3. **Cliquez sur "Créer mon compte"**
4. **Vérifiez** que vous obtenez l'erreur :
   ```
   "Vous devez accepter la politique de confidentialité pour continuer"
   ```

### Test 2 : Inscription avec Conditions Acceptées

1. **Accédez à** `http://localhost:3000/register`
2. **Remplissez le formulaire** avec des données valides
3. **Cochez les deux checkboxes obligatoires** :
   - ✅ J'accepte la politique de confidentialité
   - ✅ J'accepte les conditions générales d'utilisation
4. **Cliquez sur "Créer mon compte"**
5. **Vérifiez** que l'inscription réussit

### Test 3 : Vérification en Base de Données

**Connectez-vous à votre base de données et exécutez** :
```sql
SELECT 
    email,
    nom,
    prenom,
    conditions_generales_acceptees,
    date_acceptation_conditions,
    politique_confidentialite_acceptee,
    date_acceptation_politique,
    created_at
FROM users 
WHERE email = 'votre-email@test.com'
ORDER BY created_at DESC;
```

**Vous devriez voir** :
- `conditions_generales_acceptees: true`
- `politique_confidentialite_acceptee: true`
- `date_acceptation_conditions: [timestamp]`
- `date_acceptation_politique: [timestamp]`

### Test 4 : Test de l'API Directement

**Avec curl ou Postman** :
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "nom": "Test",
    "prenom": "User",
    "politique_confidentialite_acceptee": true,
    "conditions_generales_acceptees": true
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "nom": "Test",
      "prenom": "User",
      "conditions_generales_acceptees": true,
      "politique_confidentialite_acceptee": true,
      "date_acceptation_conditions": "2025-07-10T...",
      "date_acceptation_politique": "2025-07-10T..."
    }
  }
}
```

## Fonctionnalités Ajoutées

### Interface Utilisateur

1. **Checkboxes obligatoires** avec design moderne
2. **Aperçu des conditions** dans des accordéons dépliables
3. **Validation en temps réel** avec messages d'erreur
4. **Design cohérent** avec le reste de l'application

### Validation

1. **Côté client** : Vérification des checkboxes avant envoi
2. **Côté serveur** : Validation DTO avec `@IsNotEmpty()`
3. **Base de données** : Stockage des acceptations avec horodatage

### Sécurité

1. **Traçabilité** : Horodatage des acceptations
2. **Conformité RGPD** : Stockage des consentements
3. **Validation stricte** : Impossible de s'inscrire sans accepter

## Dépannage

### Si les colonnes n'existent pas en base

**Exécutez le script SQL** :
```bash
cd backend-mister-api
psql -d votre_base_de_donnees -f sql/add_legal_acceptance_columns.sql
```

### Si l'inscription échoue

**Vérifiez les logs du backend** :
```bash
cd backend-mister-api
npm run start:dev
```

**Vérifiez la console du navigateur** pour les erreurs JavaScript.

### Si les checkboxes ne s'affichent pas

**Vérifiez que le frontend est redémarré** :
```bash
cd mister-api
npm run dev
```

## Prochaines Étapes

1. **Tester l'inscription** avec différents scénarios
2. **Vérifier la conformité RGPD** des conditions
3. **Ajouter des tests automatisés** pour la validation
4. **Créer des pages dédiées** pour les conditions complètes
5. **Implémenter la gestion des consentements** (modification/rétractation)

## Résumé

L'inscription nécessite maintenant obligatoirement l'acceptation de :
- ✅ La politique de confidentialité
- ✅ Les conditions générales d'utilisation

Ces acceptations sont stockées en base de données avec horodatage pour la conformité légale. 