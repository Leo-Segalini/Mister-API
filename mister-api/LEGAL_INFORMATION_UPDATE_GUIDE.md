# Guide de Test - Mise à Jour des Informations Légales

## Informations Mises à Jour

### Données de l'Entreprise (Source : Pappers.fr)
- **Raison sociale** : SEGALINI-BRIANT Léo
- **SIRET** : 98341117400010
- **Forme juridique** : Entreprise individuelle
- **Adresse** : 37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France
- **Email** : leo.segalini@outlook.com
- **Téléphone** : +33 6 70 96 33 71
- **Représentant légal** : Léo SEGALINI-BRIANT

## Pages Mises à Jour

### 1. Mentions Légales (/mentions-legales)
- ✅ Raison sociale mise à jour
- ✅ SIRET ajouté
- ✅ Email mis à jour
- ✅ Téléphone mis à jour
- ✅ Adresse confirmée
- ✅ Liens de contact mis à jour

### 2. Politique de Confidentialité (/politique-confidentialite)
- ✅ Identité mise à jour
- ✅ SIRET ajouté
- ✅ Email mis à jour
- ✅ Téléphone mis à jour
- ✅ Adresse confirmée
- ✅ Contact pour exercice des droits mis à jour

### 3. Page Contact (/contact)
- ✅ Email principal mis à jour
- ✅ Email support mis à jour
- ✅ Téléphone mis à jour
- ✅ Adresse mise à jour
- ✅ Informations cohérentes

### 4. Page d'Inscription (/register)
- ✅ Contact privacy mis à jour
- ✅ Références cohérentes

### 5. Métadonnées du Site (layout.tsx)
- ✅ Auteur mis à jour
- ✅ Créateur mis à jour
- ✅ Éditeur mis à jour

## Tests à Effectuer

### 1. Test des Mentions Légales

#### Étape 1 : Accès à la page
1. Aller sur `/mentions-legales`
2. Vérifier l'affichage correct

#### Étape 2 : Vérification des informations
**Section "Éditeur du Site" :**
- [ ] Raison sociale : "SEGALINI-BRIANT Léo"
- [ ] SIRET : "98341117400010"
- [ ] Email : "leo.segalini@outlook.com"
- [ ] Téléphone : "+33 6 70 96 33 71"
- [ ] Adresse : "37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France"

**Section "Contact" :**
- [ ] Email cliquable : leo.segalini@outlook.com
- [ ] Téléphone cliquable : +33 6 70 96 33 71
- [ ] Adresse correcte

### 2. Test de la Politique de Confidentialité

#### Étape 1 : Accès à la page
1. Aller sur `/politique-confidentialite`
2. Vérifier l'affichage correct

#### Étape 2 : Vérification des informations
**Section "Responsable du Traitement" :**
- [ ] Identité : "SEGALINI-BRIANT Léo"
- [ ] SIRET : "98341117400010"
- [ ] Email : leo.segalini@outlook.com
- [ ] Téléphone : +33 6 70 96 33 71

**Section "Exercice de vos Droits" :**
- [ ] Email de contact : leo.segalini@outlook.com
- [ ] Téléphone : +33 6 70 96 33 71
- [ ] Adresse postale correcte

### 3. Test de la Page Contact

#### Étape 1 : Accès à la page
1. Aller sur `/contact`
2. Vérifier l'affichage correct

#### Étape 2 : Vérification des informations
**Informations de contact :**
- [ ] Email : leo.segalini@outlook.com
- [ ] Support technique : leo.segalini@outlook.com
- [ ] Téléphone : +33 6 70 96 33 71
- [ ] Adresse : 37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France

#### Étape 3 : Test du formulaire
1. Remplir le formulaire de contact
2. Vérifier que le message est envoyé (simulation)
3. Vérifier le message de succès

### 4. Test de la Page d'Inscription

#### Étape 1 : Accès à la page
1. Aller sur `/register`
2. Vérifier l'affichage correct

#### Étape 2 : Vérification des références
**Section "Politique de confidentialité" :**
- [ ] Contact : leo.segalini@outlook.com
- [ ] Liens vers les pages légales fonctionnels

### 5. Test des Métadonnées

#### Étape 1 : Inspection du code source
1. Clic droit → "Afficher le code source"
2. Vérifier les balises meta :
- [ ] `<meta name="author" content="Léo Segalini">`
- [ ] `<meta name="creator" content="SEGALINI-BRIANT Léo">`
- [ ] `<meta name="publisher" content="SEGALINI-BRIANT Léo">`

## Vérifications de Conformité

### 1. Conformité RGPD
- [ ] Responsable du traitement clairement identifié
- [ ] Base légale du traitement expliquée
- [ ] Droits des utilisateurs détaillés
- [ ] Contact pour exercice des droits accessible

### 2. Conformité Légale
- [ ] Mentions légales complètes
- [ ] Informations d'identification exactes
- [ ] Coordonnées de contact valides
- [ ] Responsabilité clairement définie

### 3. Cohérence des Informations
- [ ] Même email partout : leo.segalini@outlook.com
- [ ] Même téléphone partout : +33 6 70 96 33 71
- [ ] Même adresse partout : 37 BIS RUE DES CAMOMILLES, 97436 SAINT LEU, France
- [ ] Même raison sociale partout : SEGALINI-BRIANT Léo

## Problèmes Potentiels

### 1. Liens cassés
- Vérifier que tous les liens mailto: fonctionnent
- Vérifier que tous les liens tel: fonctionnent
- Vérifier que les liens vers les pages légales fonctionnent

### 2. Affichage incorrect
- Vérifier l'affichage sur mobile
- Vérifier l'affichage sur tablette
- Vérifier l'affichage sur desktop

### 3. Problèmes de SEO
- Vérifier que les métadonnées sont correctes
- Vérifier que les balises title sont appropriées
- Vérifier que les descriptions sont cohérentes

## Validation Finale

### ✅ Checklist Complète
- [ ] Mentions légales mises à jour
- [ ] Politique de confidentialité mise à jour
- [ ] Page contact mise à jour
- [ ] Page inscription mise à jour
- [ ] Métadonnées mises à jour
- [ ] Tous les liens fonctionnels
- [ ] Informations cohérentes partout
- [ ] Conformité RGPD respectée
- [ ] Conformité légale respectée

### 🎯 Résultat Attendu
- Toutes les informations légales sont exactes et à jour
- Conformité complète avec la législation française
- Cohérence des informations sur tout le site
- Contact facile et accessible pour les utilisateurs
- Transparence totale sur l'identité de l'entreprise 