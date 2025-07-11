# Composants du Dashboard

Ce dossier contient les composants modulaires du dashboard de Mister API.

## Structure

### Composants Principaux

- **DashboardInfo.tsx** - Composant principal contenant toutes les informations et sections du dashboard
- **index.ts** - Fichier d'export pour faciliter les imports

### Fonctionnalités du DashboardInfo

#### Gestion des Clés API
- Affichage des clés API existantes
- Création de nouvelles clés API (manuel, plus de création automatique)
- Suppression de clés API
- Copie des clés API dans le presse-papiers
- Affichage/masquage des clés API

#### Statistiques et Quotas
- Nombre de clés API
- Appels quotidiens avec barre de progression
- Appels par minute avec barre de progression
- Plan actuel (Free/Premium)

#### Aperçu des APIs
- Citations historiques avec exemple aléatoire
- Animaux avec exemple aléatoire
- Pays du monde avec exemple aléatoire

#### Exemples d'Utilisation
- Exemples de requêtes cURL pour chaque API
- Code formaté avec syntax highlighting
- Instructions d'utilisation

#### Actions Rapides
- Gestion des webhooks
- Accès à la documentation
- Passage au plan premium

#### Actions Administrateur (si admin)
- Gestion des données
- Gestion des utilisateurs
- Analytics

## Palette de Couleurs

Cohérente avec le reste de l'application :
- **bg-black** - Arrière-plan principal
- **bg-gray-900** - Cartes et sections
- **bg-gray-800** - Éléments secondaires
- **text-white** - Texte principal
- **text-gray-300/400** - Texte secondaire
- **text-green-400** - Accents et succès
- **border-gray-800** - Bordures

## Utilisation

```tsx
import { DashboardInfo } from '@/components/dashboard';

function Dashboard() {
  const { user, isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <DashboardInfo user={user} isAdmin={isAdmin} />
    </div>
  );
}
```

## Améliorations Apportées

### Suppression de la Création Automatique
- **Avant** : Une clé API était créée automatiquement à chaque connexion
- **Après** : L'utilisateur doit créer manuellement ses clés API
- **Avantage** : Évite la duplication et donne plus de contrôle à l'utilisateur

### Modularisation
- **Avant** : Tout le code était dans la page dashboard
- **Après** : Séparation en composants réutilisables
- **Avantage** : Meilleure maintenabilité et réutilisabilité

### Design Cohérent
- Application de la palette de couleurs unifiée
- Animations fluides avec Framer Motion
- Interface moderne et professionnelle

## États Gérés

- `apiKeys` - Liste des clés API
- `quotaInfo` - Informations sur les quotas
- `isLoading` - État de chargement
- `showNewKeyModal` - Affichage de la modal de création
- `showApiKey` - Affichage des clés API
- `randomCitation/Animal/Pays` - Exemples aléatoires

## Fonctions Principales

- `loadDashboardData()` - Chargement des données
- `createApiKey()` - Création d'une nouvelle clé
- `deleteApiKey()` - Suppression d'une clé
- `copyToClipboard()` - Copie dans le presse-papiers
- `toggleKeyVisibility()` - Affichage/masquage des clés

## Responsive Design

- Grilles adaptatives pour les cartes
- Layout flexible pour les sections
- Boutons et navigation optimisés pour mobile
- Espacement adaptatif selon la taille d'écran 