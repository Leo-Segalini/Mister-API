# Composants de la Page APIs

Ce dossier contient tous les composants modulaires de la page APIs de Mister API.

## Structure

### Composants Principaux

- **ApisHeader.tsx** - En-tête avec titre, description et statistiques
- **ApisList.tsx** - Conteneur principal de la liste des APIs
- **ApiCard.tsx** - Carte individuelle pour chaque API
- **ApisFeatures.tsx** - Section des fonctionnalités générales
- **ApisCTA.tsx** - Section d'appel à l'action finale

### Palette de Couleurs Appliquée

- **bg-green-400** - Couleur d'accent principale pour les boutons et badges
- **text-gray-400** - Texte secondaire et descriptions
- **bg-gray-900** - Arrière-plan des cartes et éléments
- **bg-gray-800** - Arrière-plan des sections intermédiaires
- **bg-black** - Arrière-plan principal de la page

## Fonctionnalités des Composants

### ApisHeader
- Titre principal "Nos APIs"
- Description de la collection
- Statistiques avec icônes (APIs, appels, développeurs, uptime)
- Animations d'entrée avec Framer Motion

### ApiCard
- Affichage détaillé de chaque API
- Icônes spécifiques selon le type d'API
- Badges "Populaire" et "Actif"
- Endpoint avec syntax highlighting
- Liste des fonctionnalités
- Catégories avec badges colorés
- Exemple de réponse JSON
- Boutons d'action (Documentation, Tarifs, Inscription, Test)

### ApisFeatures
- Section "Pourquoi nos APIs ?"
- Grille de fonctionnalités avec icônes
- Animations au survol et au scroll

### ApisCTA
- Section d'appel à l'action finale
- Boutons "Commencer gratuitement" et "Voir la documentation"
- Design contrasté avec fond vert

## Utilisation

```tsx
import {
  ApisHeader,
  ApisList,
  ApisFeatures,
  ApisCTA
} from '@/components/apis';

export default function APIs() {
  return (
    <div className="bg-black min-h-screen">
      <ApisHeader />
      <ApisList />
      <ApisFeatures />
      <ApisCTA />
    </div>
  );
}
```

## Interface ApiCardProps

```tsx
interface ApiCardProps {
  api: {
    name: string;
    description: string;
    endpoint: string;
    documentation: string;
    features: string[];
    categories: string[];
    popular?: boolean;
  };
  index: number;
}
```

## Animations

Tous les composants utilisent Framer Motion :
- Animations d'entrée avec délais progressifs
- Animations au survol (scale, y)
- Animations au scroll avec `whileInView`
- Transitions fluides pour tous les éléments interactifs

## Responsive Design

- Grilles adaptatives pour les statistiques et fonctionnalités
- Layout flexible pour les cartes d'API
- Boutons et navigation optimisés pour mobile
- Espacement adaptatif selon la taille d'écran

## Améliorations Apportées

- **Cohérence visuelle** : Toute la page utilise la nouvelle palette
- **Lisibilité** : Contraste optimisé avec fond sombre
- **Interactivité** : Animations et transitions fluides
- **Accessibilité** : Structure sémantique claire
- **Performance** : Composants modulaires pour un chargement optimisé 