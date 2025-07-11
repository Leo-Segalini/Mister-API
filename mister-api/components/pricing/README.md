# Composants de la Page Pricing

Ce dossier contient tous les composants modulaires de la page pricing de Mister API, conçus pour être cohérents avec le composant PricingSection de la page d'accueil.

## Structure

### Composants Principaux

- **PricingHeader.tsx** - En-tête avec titre et description des tarifs
- **PricingPlans.tsx** - Conteneur principal des plans tarifaires
- **PricingCard.tsx** - Carte individuelle pour chaque plan
- **PricingFAQ.tsx** - Section des questions fréquentes
- **PricingCTA.tsx** - Section d'appel à l'action finale

### Palette de Couleurs Appliquée

- **bg-green-400** - Couleur d'accent principale pour les boutons et badges
- **text-gray-400** - Texte secondaire et descriptions
- **bg-gray-900** - Arrière-plan des cartes et éléments
- **bg-gray-800** - Arrière-plan des sections intermédiaires
- **bg-black** - Arrière-plan principal de la page

## Fonctionnalités des Composants

### PricingHeader
- Titre principal "Tarifs simples et transparents"
- Description détaillée de l'approche tarifaire
- Animations d'entrée avec Framer Motion

### PricingCard
- Affichage détaillé de chaque plan tarifaire
- Badge "RECOMMANDÉ" pour le plan premium
- Icônes spécifiques pour chaque fonctionnalité
- Badges "PREMIUM" sur les fonctionnalités exclusives
- Boutons d'action avec styles adaptés
- Animation au survol (scale-105 pour le plan premium)

### PricingPlans
- Configuration des plans FREE et PREMIUM
- Données cohérentes avec PricingSection
- Prix mis à jour (5€ au lieu de 9.99€)
- Fonctionnalités détaillées avec icônes

### PricingFAQ
- Section "Questions fréquentes"
- 6 questions courantes avec réponses
- Design cohérent avec la palette de couleurs
- Animations progressives pour chaque question

### PricingCTA
- Section d'appel à l'action finale
- Boutons "Commencer gratuitement" et "Voir nos APIs"
- Note de garantie avec icône Shield
- Design contrasté et attractif

## Cohérence avec PricingSection

### Données Synchronisées
- **Plan FREE** : 1000 appels/jour, 60 appels/minute
- **Plan PREMIUM** : 10000 appels/jour, 300 appels/minute, 5€/mois
- **Fonctionnalités** : Identiques entre les deux composants
- **Badges** : "RECOMMANDÉ" et "PREMIUM" cohérents

### Design Unifié
- **Palette de couleurs** : Même palette dans les deux composants
- **Animations** : Styles d'animation cohérents
- **Typographie** : Hiérarchie visuelle identique
- **Espacement** : Marges et paddings harmonisés

## Utilisation

```tsx
import {
  PricingHeader,
  PricingPlans,
  PricingFAQ,
  PricingCTA
} from '@/components/pricing';

export default function Pricing() {
  return (
    <div className="bg-black text-white min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingHeader />
        <PricingPlans />
        <PricingFAQ />
        <PricingCTA />
      </div>
    </div>
  );
}
```

## Interface PricingCardProps

```tsx
interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: Array<{
      text: string;
      icon: React.ReactNode;
      highlight?: boolean;
    }>;
    buttonText: string;
    buttonHref: string;
    popular: boolean;
    icon: React.ReactNode;
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

- Grilles adaptatives pour les plans tarifaires
- Layout flexible pour les cartes
- Boutons et navigation optimisés pour mobile
- Espacement adaptatif selon la taille d'écran

## Améliorations Apportées

- **Cohérence visuelle** : Design unifié avec PricingSection
- **Données synchronisées** : Prix et fonctionnalités identiques
- **Interactivité** : Animations et transitions fluides
- **Accessibilité** : Structure sémantique claire
- **Performance** : Composants modulaires pour un chargement optimisé
- **Maintenabilité** : Code organisé et réutilisable

## Fonctionnalités Premium Mises en Avant

- **10x plus d'appels** : 10000 vs 1000 par jour
- **5x plus de vitesse** : 300 vs 60 par minute
- **Support prioritaire 24/7** avec icône dédiée
- **Analytics avancées** avec badges "PREMIUM"
- **Webhooks personnalisés**
- **SLA garanti 99.9%**
- **Accès aux nouvelles APIs en avant-première**
- **Intégrations premium** (Slack, Discord) 