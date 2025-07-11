# Composants Documentation

Ce dossier contient tous les composants modulaires utilisés pour la page de documentation.

## Structure

### Composants principaux

- **DocsHeader.tsx** - En-tête de la page documentation avec titre et description
- **QuickStart.tsx** - Section de démarrage rapide avec 3 étapes
- **ApisList.tsx** - Liste des APIs disponibles avec cartes interactives
- **ApiDocCard.tsx** - Carte individuelle pour chaque API
- **AdditionalResources.tsx** - Ressources supplémentaires (exemples, SDK, etc.)

### Pages de documentation spécifiques

- **/app/docs/punchlines/page.tsx** - Documentation complète de l'API Punchlines
- **/app/docs/animals/page.tsx** - Documentation complète de l'API Animaux  
- **/app/docs/pays-du-monde/page.tsx** - Documentation complète de l'API Pays du Monde

## Palette de couleurs

- **bg-black** - Arrière-plan principal
- **bg-gray-900** - Cartes et sections
- **bg-gray-800** - Éléments secondaires
- **text-white** - Texte principal
- **text-gray-400** - Texte secondaire
- **text-green-400** - Accents et liens
- **border-gray-700** - Bordures par défaut
- **border-green-400** - Bordures au survol

## Fonctionnalités

### Page principale (/docs)
- Vue d'ensemble des APIs disponibles
- Guide de démarrage rapide
- Ressources supplémentaires

### Pages spécifiques
- Exemples de code avec boutons de copie
- Paramètres détaillés avec tableaux
- Réponses JSON formatées
- Fonctionnalités spécifiques à chaque API

## Utilisation

```tsx
import { DocsHeader, QuickStart, ApisList, AdditionalResources } from '../components/docs';

export default function Docs() {
  return (
    <div className="bg-black text-white min-h-screen">
      <DocsHeader />
      <QuickStart />
      <ApisList />
      <AdditionalResources />
    </div>
  );
}
```

## Améliorations futures

- Ajouter des exemples de code dans différents langages (Python, JavaScript, PHP)
- Intégrer un éditeur de code interactif
- Ajouter des tests d'API en ligne
- Créer des tutoriels vidéo
- Ajouter une recherche dans la documentation 