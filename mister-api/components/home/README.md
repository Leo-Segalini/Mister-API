# Composants de la Page d'Accueil

Ce dossier contient tous les composants modulaires de la page d'accueil de Mister API.

## Structure

### Composants Principaux

- **HeroSection.tsx** - Section héro avec titre principal et boutons d'action
- **StatsSection.tsx** - Section des statistiques (développeurs, uptime, requêtes)
- **FeaturesSection.tsx** - Section des fonctionnalités principales
- **ApisSection.tsx** - Section présentant les APIs disponibles
- **PricingSection.tsx** - Section des plans tarifaires
- **CTASection.tsx** - Section d'appel à l'action finale

### Palette de Couleurs

La nouvelle palette de couleurs utilisée :
- `bg-green-400` - Couleur d'accent principale
- `text-gray-400` - Texte secondaire
- `bg-gray-900` - Arrière-plan des cartes
- `bg-gray-800` - Arrière-plan des sections
- `bg-black` - Arrière-plan principal

## Utilisation

```tsx
import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  ApisSection,
  PricingSection,
  CTASection
} from '@/components/home';

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ApisSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
```

## Animations

Tous les composants utilisent Framer Motion pour les animations :
- Animations d'entrée avec `initial`, `animate`, `transition`
- Animations au survol avec `whileHover`, `whileTap`
- Animations au scroll avec `whileInView`

## Responsive Design

Tous les composants sont conçus pour être responsive avec :
- Grilles adaptatives (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Tailles de texte adaptatives (`text-5xl md:text-7xl`)
- Espacement adaptatif (`px-4 sm:px-6 lg:px-8`) 