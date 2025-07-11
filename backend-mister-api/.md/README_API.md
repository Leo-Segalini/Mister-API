# Punchiline API – Documentation des Endpoints

## Sécurité & Authentification
- **Authentification obligatoire** : Tous les endpoints nécessitent un token JWT Supabase valide (`Authorization: Bearer <token>`)
- **Clé API obligatoire** : Tous les endpoints nécessitent un header `X-API-Key` valide
- **Rôle admin** : Les endpoints d'administration nécessitent le rôle `admin` dans Supabase
- **Swagger** : La documentation Swagger n'est PAS exposée publiquement en production

---

## Endpoints Publics (utilisateurs authentifiés)

### Punchlines
- `GET /api/v1/punchlines` : Liste paginée des punchlines
- `GET /api/v1/punchlines/:id` : Détail d'une punchline
- `POST /api/v1/punchlines` : Créer une punchline (utilisateur)
- `PATCH /api/v1/punchlines/:id` : Modifier partiellement une punchline
- `DELETE /api/v1/punchlines/:id` : Supprimer une punchline
- `GET /api/v1/punchlines/random` : Récupérer une punchline aléatoire

### Animaux
- `GET /api/v1/animaux` : Liste paginée des animaux
- `GET /api/v1/animaux/:id` : Détail d'un animal
- `POST /api/v1/animaux` : Créer un animal
- `PATCH /api/v1/animaux/:id` : Modifier partiellement un animal
- `DELETE /api/v1/animaux/:id` : Supprimer un animal

### Pays du Monde
- `GET /api/v1/pays` : Liste paginée des pays
- `GET /api/v1/pays/:id` : Détail d'un pays
- `POST /api/v1/pays` : Créer un pays
- `PATCH /api/v1/pays/:id` : Modifier partiellement un pays
- `DELETE /api/v1/pays/:id` : Supprimer un pays
- `GET /api/v1/pays/continent/:continent` : Pays par continent
- `GET /api/v1/pays/europe` : Tous les pays d'Europe

### Authentification
- `POST /api/v1/auth/signup` : Inscription utilisateur (Supabase)
- `POST /api/v1/auth/login` : Connexion utilisateur
- `POST /api/v1/auth/logout` : Déconnexion
- `POST /api/v1/auth/refresh` : Rafraîchir le token
- `POST /api/v1/auth/reset-password` : Réinitialisation du mot de passe

### Clés API
- `POST /api/v1/api-keys` : Générer une clé API
- `GET /api/v1/api-keys` : Lister les clés API de l'utilisateur
- `PATCH /api/v1/api-keys/:id` : Modifier une clé API
- `DELETE /api/v1/api-keys/:id` : Supprimer une clé API

### Paiements (Stripe)
- `POST /api/v1/payments/create-checkout-session` : Créer une session de paiement
- `POST /api/v1/payments/create-subscription` : Créer un abonnement
- `POST /api/v1/payments/cancel-subscription/:subscriptionId` : Annuler un abonnement
- `GET /api/v1/payments/subscriptions` : Lister les abonnements
- `POST /api/v1/payments/update-subscription/:subscriptionId` : Modifier un abonnement
- `POST /api/v1/payments/create-portal-session` : Accès au portail client Stripe
- `GET /api/v1/payments/prices` : Lister les prix
- `POST /api/v1/payments/refund` : Demander un remboursement

### Webhooks
- `POST /api/v1/webhooks/stripe` : Webhook Stripe
- `POST /api/v1/webhooks/security` : Webhook sécurité
- `POST /api/v1/webhooks/admin` : Webhook admin

---

## Endpoints Admin (rôle admin requis)

### Punchlines (admin)
- `POST /api/v1/admin/punchlines` : Créer une punchline
- `GET /api/v1/admin/punchlines` : Lister toutes les punchlines
- `GET /api/v1/admin/punchlines/:id` : Détail d'une punchline
- `PUT /api/v1/admin/punchlines/:id` : Modifier complètement une punchline
- `PATCH /api/v1/admin/punchlines/:id` : Modifier partiellement une punchline
- `DELETE /api/v1/admin/punchlines/:id` : Supprimer une punchline

### Animaux (admin)
- `POST /api/v1/admin/animaux` : Créer un animal
- `GET /api/v1/admin/animaux` : Lister tous les animaux
- `GET /api/v1/admin/animaux/:id` : Détail d'un animal
- `PUT /api/v1/admin/animaux/:id` : Modifier complètement un animal
- `PATCH /api/v1/admin/animaux/:id` : Modifier partiellement un animal
- `DELETE /api/v1/admin/animaux/:id` : Supprimer un animal

### Pays du Monde (admin)
- `POST /api/v1/admin/pays` : Créer un pays
- `GET /api/v1/admin/pays` : Lister tous les pays
- `GET /api/v1/admin/pays/:id` : Détail d'un pays
- `PUT /api/v1/admin/pays/:id` : Modifier complètement un pays
- `PATCH /api/v1/admin/pays/:id` : Modifier partiellement un pays
- `DELETE /api/v1/admin/pays/:id` : Supprimer un pays

### Clés API (admin)
- `POST /api/v1/admin/api-keys` : Créer une clé API
- `GET /api/v1/admin/api-keys` : Lister toutes les clés API
- `GET /api/v1/admin/api-keys/:id` : Détail d'une clé API
- `PUT /api/v1/admin/api-keys/:id` : Modifier complètement une clé API
- `PATCH /api/v1/admin/api-keys/:id` : Modifier partiellement une clé API
- `DELETE /api/v1/admin/api-keys/:id` : Supprimer une clé API

### Paiements (admin)
- `POST /api/v1/admin/payments` : Créer un paiement
- `GET /api/v1/admin/payments` : Lister tous les paiements
- `GET /api/v1/admin/payments/:id` : Détail d'un paiement
- `PATCH /api/v1/admin/payments/:id` : Modifier partiellement un paiement
- `DELETE /api/v1/admin/payments/:id` : Supprimer un paiement
- `GET /api/v1/admin/payments/search` : Rechercher des paiements par critères
- `GET /api/v1/admin/payments/stats` : Statistiques des paiements
- `GET /api/v1/admin/payments/user/:userId` : Lister les paiements d'un utilisateur

---

## Statistiques & Monitoring
- `GET /api/v1/stats/global` : Statistiques globales d'utilisation
- `GET /api/v1/stats/usage` : Statistiques d'usage par utilisateur
- `GET /api/v1/stats/performance` : Statistiques de performance
- `GET /api/v1/stats/trends` : Tendances d'utilisation
- `GET /api/v1/stats/health` : État de santé de l'API

---

## Sécurité de la documentation
- **Swagger** n'est PAS exposé publiquement. Pour l'activer en local, décommentez la configuration Swagger dans `main.ts`.
- En production, Swagger doit être désactivé ou protégé par un guard d'authentification admin.

---

## Exemples d'appels API

```http
GET /api/v1/punchlines?page=1&limit=10
Authorization: Bearer <token>
X-API-Key: <clé_api>
```

```http
POST /api/v1/admin/pays
Authorization: Bearer <token_admin>
X-API-Key: <clé_api_admin>
Content-Type: application/json

{
  "nom": "France",
  "code_iso": "FRA"
}
```

---

## Statuts de réponse
- `200 OK` : Succès
- `201 Created` : Création réussie
- `400 Bad Request` : Erreur de validation
- `401 Unauthorized` : Authentification requise
- `403 Forbidden` : Accès refusé (rôle ou clé API)
- `404 Not Found` : Ressource non trouvée
- `500 Internal Server Error` : Erreur serveur

---

## Contact & Support
Pour toute question ou demande de support, contactez l'équipe technique. 