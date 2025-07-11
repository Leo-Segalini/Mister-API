# 🧠 API Multi-Tables - NestJS + Supabase

## 🎯 Objectif

Créer une **API RESTful** permettant de récupérer et filtrer des données depuis **plusieurs tables** (punchlines, pays_du_monde, animaux, etc.) avec un système **freemium basé sur des clés API par table** :
- **Gratuit (free)** : 50 appels par jour par table
- **Premium** : appels illimités par table
- **Authentification** : Supabase Auth avec cookies HTTPS sécurisés
- **Multi-tables** : Accès granulaire aux différentes tables de données

---

## ⚙️ Stack technique

| Élément         | Choix                          |
|------------------|--------------------------------|
| Framework        | NestJS (TypeScript)            |
| Base de données  | Supabase (PostgreSQL)          |
| Authentification | Supabase Auth + Cookies HTTPS  |
| Cache            | Redis (pour les performances)  |
| Limitation       | Middleware de quota (daily)    |
| Validation       | class-validator + class-transformer |
| Logs             | Winston                        |
| Tests            | Jest + Supertest               |
| Monitoring       | Prometheus + Grafana           |
| Déploiement      | Railway / Render / Vercel      |
| Documentation    | Swagger (auto)                 |
| Tests API        | Postman ou Swagger UI          |

---

## 📦 Modèles de données

### 🎯 Table `punchlines`

| Champ         | Type       | Description                          |
|---------------|------------|--------------------------------------|
| id            | UUID       | Identifiant unique                   |
| citation      | TEXT       | Texte de la punchline                |
| auteur        | TEXT       | Auteur                               |
| theme         | TEXT       | Thème (ex : amour, rap, cinéma)      |
| tags          | TEXT[]     | Tags multiples pour classification   |
| source_film   | BOOLEAN    | Est-ce tiré d'un film ?              |
| source_livre  | BOOLEAN    | Est-ce tiré d'un livre ?             |
| annee         | INTEGER    | Année approximative                  |
| langue        | TEXT       | Origine géographique (France, Angleterre, États-Unis, etc.) |
| popularite    | INTEGER    | Score de popularité (0-100)          |
| created_at    | TIMESTAMP  | Date de création                     |
| updated_at    | TIMESTAMP  | Date de modification                 |

### 🌍 Table `pays_du_monde`

| Champ         | Type       | Description                          |
|---------------|------------|--------------------------------------|
| id            | UUID       | Identifiant unique                   |
| nom           | TEXT       | Nom du pays                          |
| capitale      | TEXT       | Capitale du pays                     |
| population    | BIGINT     | Population                           |
| superficie    | DECIMAL    | Superficie en km²                    |
| continent     | TEXT       | Continent                            |
| langue_officielle | TEXT   | Langue(s) officielle(s)              |
| monnaie       | TEXT       | Monnaie officielle                   |
| drapeau_url   | TEXT       | URL du drapeau                       |
| plus_grandes_villes | JSONB  | Liste des plus grandes villes avec population |
| animal_officiel | TEXT    | Animal officiel du pays              |
| nombre_habitants | BIGINT | Nombre d'habitants (redondant avec population) |
| plus_grandes_regions | JSONB | Liste des plus grandes régions/provinces |
| created_at    | TIMESTAMP  | Date de création                     |
| updated_at    | TIMESTAMP  | Date de modification                 |

### 🐾 Table `animaux`

| Champ         | Type       | Description                          |
|---------------|------------|--------------------------------------|
| id            | UUID       | Identifiant unique                   |
| nom           | TEXT       | Nom de l'animal                      |
| espece        | TEXT       | Espèce                               |
| famille       | TEXT       | Famille taxonomique                  |
| habitat       | TEXT       | Habitat naturel                      |
| alimentation  | TEXT       | Type d'alimentation                  |
| taille        | DECIMAL    | Taille moyenne en cm                 |
| poids         | DECIMAL    | Poids moyen en kg                    |
| esperance_vie | INTEGER    | Espérance de vie en années           |
| zones_geographiques | TEXT[] | Zones géographiques (Europe, Amérique du Nord, etc.) |
| image_url     | TEXT       | URL de l'image                       |
| created_at    | TIMESTAMP  | Date de création                     |
| updated_at    | TIMESTAMP  | Date de modification                 |

---

### 👤 Table `public.users`

| Champ              | Type       | Description                               |
|--------------------|------------|-------------------------------------------|
| id                 | UUID       | Référence vers auth.users                 |
| nom                | TEXT       | Nom de famille                            |
| prenom             | TEXT       | Prénom                                    |
| date_naissance     | DATE       | Date de naissance                         |
| adresse_postale    | TEXT       | Adresse postale complète                  |
| code_postal        | TEXT       | Code postal                               |
| ville              | TEXT       | Ville                                     |
| pays               | TEXT       | Pays                                      |
| telephone          | TEXT       | Numéro de téléphone                       |
| avatar_url         | TEXT       | URL de l'avatar                           |
| bio                | TEXT       | Biographie                                |
| preferences        | JSONB      | Préférences utilisateur                   |
| is_verified        | BOOLEAN    | Compte vérifié                            |
| created_at         | TIMESTAMP  | Date de création                          |
| updated_at         | TIMESTAMP  | Date de modification                      |

---

### 🔐 Table `api_keys`

| Champ              | Type       | Description                               |
|--------------------|------------|-------------------------------------------|
| id                 | UUID       | Identifiant unique                        |
| user_id            | UUID       | Référence vers public.users               |
| table_name         | TEXT       | Nom de la table (punchlines, pays_du_monde, etc.) |
| api_key            | TEXT       | Clé API générée (ex : UUID v4)            |
| name               | TEXT       | Nom donné à la clé API                    |
| description        | TEXT       | Description de l'usage                    |
| type               | TEXT       | `free` ou `premium`                       |
| appels_jour        | INTEGER    | Nombre d'appels effectués aujourd'hui     |
| appels_minute      | INTEGER    | Nombre d'appels par minute (rate limiting)|
| date_dernier_reset | DATE       | Date du dernier reset du quota            |
| is_active          | BOOLEAN    | Clé active ou désactivée                 |
| expires_at          | TIMESTAMP  | Date d'expiration (optionnel)             |
| created_at         | TIMESTAMP  | Date de création                          |
| last_used_at       | TIMESTAMP  | Dernière utilisation                      |

---

### 📊 Table `api_logs`

| Champ              | Type       | Description                               |
|--------------------|------------|-------------------------------------------|
| id                 | UUID       | Identifiant unique                        |
| api_key_id         | UUID       | Référence vers api_keys                   |
| user_id            | UUID       | Référence vers public.users               |
| table_name         | TEXT       | Nom de la table accédée                   |
| endpoint           | TEXT       | Endpoint appelé                           |
| method             | TEXT       | Méthode HTTP                              |
| status_code        | INTEGER    | Code de statut retourné                   |
| response_time      | INTEGER    | Temps de réponse en ms                    |
| ip_address         | TEXT       | Adresse IP de l'appelant                  |
| user_agent         | TEXT       | User-Agent du client                      |
| request_data       | JSONB      | Données de la requête                     |
| created_at         | TIMESTAMP  | Date de création                          |

---

## 🔐 Authentification Supabase

### Configuration Supabase Auth

```typescript
// supabase.config.ts
export const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
};
```

### Middleware d'authentification

```typescript
// auth.middleware.ts
@Injectable()
export class SupabaseAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logger: Logger,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Récupération du token depuis les cookies HTTPS
    const token = req.cookies['sb-access-token'];
    
    if (!token) {
      throw new UnauthorizedException('Token d\'authentification requis');
    }

    try {
      // Vérification du token avec Supabase
      const { data: { user }, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Token invalide');
      }

      // Récupération des informations utilisateur depuis public.users
      const userProfile = await this.supabaseService.getUserProfile(user.id);
      
      req['user'] = user;
      req['userProfile'] = userProfile;
      
      next();
    } catch (error) {
      this.logger.error('Erreur d\'authentification', error);
      throw new UnauthorizedException('Authentification échouée');
    }
  }
}
```

### Service Supabase

```typescript
// supabase.service.ts
@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async createUserProfile(userId: string, userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        id: userId,
        nom: userData.nom,
        prenom: userData.prenom,
        date_naissance: userData.date_naissance,
        adresse_postale: userData.adresse_postale,
        code_postal: userData.code_postal,
        ville: userData.ville,
        pays: userData.pays,
        telephone: userData.telephone,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        preferences: userData.preferences || {},
        is_verified: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

---

## 🚀 Installation du projet

### 1. Créer le projet NestJS

```bash
npx @nestjs/cli new api-multi-tables
cd api-multi-tables
```

### 2. Installer les dépendances

```bash
# Dépendances principales
npm install @nestjs/typeorm typeorm pg
npm install --save @nestjs/config
npm install --save class-validator class-transformer
npm install --save @nestjs/swagger swagger-ui-express

# Supabase
npm install @supabase/supabase-js

# Cache et performance
npm install --save @nestjs/cache-manager cache-manager cache-manager-redis-store redis
npm install --save @nestjs/throttler

# Cookies et sécurité
npm install --save cookie-parser
npm install --save @nestjs/helmet

# Paiements
npm install --save @nestjs/stripe stripe

# Logs et monitoring
npm install --save winston nest-winston
npm install --save @nestjs/prometheus prom-client

# Tests
npm install --save-dev @nestjs/testing supertest
npm install --save-dev jest @types/jest ts-jest

# Sécurité
npm install --save helmet @nestjs/helmet
npm install --save @nestjs/rate-limiter
```

---

## 🔧 Configuration de Supabase

### 1. Créer un projet sur [https://supabase.com](https://supabase.com)

### 2. Créer les tables dans l'onglet SQL :

```sql
-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table punchlines
CREATE TABLE punchlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citation TEXT NOT NULL,
  auteur TEXT NOT NULL,
  theme TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source_film BOOLEAN NOT NULL DEFAULT false,
  source_livre BOOLEAN NOT NULL DEFAULT false,
  annee INTEGER NOT NULL,
  langue TEXT NOT NULL DEFAULT 'fr',
  popularite INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pays_du_monde
CREATE TABLE pays_du_monde (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  capitale TEXT NOT NULL,
  population BIGINT NOT NULL,
  superficie DECIMAL(12,2) NOT NULL,
  continent TEXT NOT NULL,
  langue_officielle TEXT NOT NULL,
  monnaie TEXT NOT NULL,
  drapeau_url TEXT,
  plus_grandes_villes JSONB DEFAULT '[]',
  animal_officiel TEXT,
  nombre_habitants BIGINT NOT NULL,
  plus_grandes_regions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table animaux
CREATE TABLE animaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  espece TEXT NOT NULL,
  famille TEXT NOT NULL,
  habitat TEXT NOT NULL,
  alimentation TEXT NOT NULL,
  taille DECIMAL(6,2),
  poids DECIMAL(8,2),
  esperance_vie INTEGER,
  zones_geographiques TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table public.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  adresse_postale TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  pays TEXT NOT NULL,
  telephone TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table api_keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('free', 'premium')),
  appels_jour INTEGER DEFAULT 0,
  appels_minute INTEGER DEFAULT 0,
  date_dernier_reset DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table api_logs
CREATE TABLE api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  request_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX idx_punchlines_theme ON punchlines(theme);
CREATE INDEX idx_punchlines_auteur ON punchlines(auteur);
CREATE INDEX idx_punchlines_annee ON punchlines(annee);
CREATE INDEX idx_punchlines_popularite ON punchlines(popularite DESC);

CREATE INDEX idx_pays_continent ON pays_du_monde(continent);
CREATE INDEX idx_pays_population ON pays_du_monde(population DESC);

CREATE INDEX idx_animaux_espece ON animaux(espece);
CREATE INDEX idx_animaux_famille ON animaux(famille);
CREATE INDEX idx_animaux_habitat ON animaux(habitat);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_table_name ON api_keys(table_name);
CREATE INDEX idx_api_keys_key ON api_keys(api_key);

CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX idx_api_logs_api_key_id ON api_logs(api_key_id);
CREATE INDEX idx_api_logs_user_id ON api_logs(user_id);

-- Index full-text pour la recherche
CREATE INDEX idx_punchlines_search ON punchlines USING gin(to_tsvector('french', citation || ' ' || auteur));
CREATE INDEX idx_pays_search ON pays_du_monde USING gin(to_tsvector('french', nom || ' ' || capitale || ' ' || animal_officiel));
CREATE INDEX idx_animaux_search ON animaux USING gin(to_tsvector('french', nom || ' ' || espece));

-- Index pour les zones géographiques
CREATE INDEX idx_animaux_zones ON animaux USING gin(zones_geographiques);
CREATE INDEX idx_pays_villes ON pays_du_monde USING gin(plus_grandes_villes);
CREATE INDEX idx_pays_regions ON pays_du_monde USING gin(plus_grandes_regions);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_punchlines_updated_at BEFORE UPDATE ON punchlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pays_updated_at BEFORE UPDATE ON pays_du_monde
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animaux_updated_at BEFORE UPDATE ON animaux
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. Configuration des variables d'environnement

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgres://user:password@host:port/db_name

# Redis Cache
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=3000
API_PREFIX=api/v1
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
CORS_ORIGIN=http://localhost:3000
HELMET_ENABLED=true
COOKIE_SECRET=your_cookie_secret

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
```

---

## 🛣️ Structure des URLs API

Toutes les routes de l'API utilisent le préfixe **`/api/v1/`** pour assurer la versioning et la cohérence :

```
Base URL: http://localhost:3000/api/v1/
```

### Exemples d'URLs complètes :
- `GET http://localhost:3000/api/v1/punchlines/random`
- `GET http://localhost:3000/api/v1/pays-du-monde?continent=europe&page=1`
- `GET http://localhost:3000/api/v1/animaux?famille=felins`
- `GET http://localhost:3000/api/v1/auth/profile`
- `GET http://localhost:3000/api/v1/api-keys`
- `POST http://localhost:3000/api/v1/api-keys/generate`

---

## 🛣️ Routes de l'API

### 🔐 Authentification

#### `POST /api/v1/auth/register`
- Inscription avec création du profil utilisateur
- Body: `{ email, password, nom, prenom, date_naissance, adresse_postale, ... }`

#### `POST /api/v1/auth/login`
- Connexion avec cookies HTTPS
- Body: `{ email, password }`

#### `POST /api/v1/auth/logout`
- Déconnexion avec suppression des cookies

#### `GET /api/v1/auth/profile`
- Récupération du profil utilisateur connecté

#### `PUT /api/v1/auth/profile`
- Mise à jour du profil utilisateur

### 🔑 Gestion des clés API

#### `GET /api/v1/api-keys`
- Liste des clés API de l'utilisateur connecté

#### `POST /api/v1/api-keys/generate`
- Génération d'une nouvelle clé API pour une table spécifique
- Body: `{ table_name, name, description, type }`

#### `DELETE /api/v1/api-keys/:id`
- Suppression d'une clé API

#### `PUT /api/v1/api-keys/:id`
- Mise à jour d'une clé API (nom, description, etc.)

### 📊 Données des tables

#### Punchlines
- `GET /api/v1/punchlines/random` - Punchline aléatoire
- `GET /api/v1/punchlines` - Liste avec filtres
- `GET /api/v1/punchlines/search` - Recherche full-text

#### Pays du monde
- `GET /api/v1/pays-du-monde/random` - Pays aléatoire
- `GET /api/v1/pays-du-monde` - Liste avec filtres
- `GET /api/v1/pays-du-monde/search` - Recherche full-text
- `GET /api/v1/pays-du-monde/:id/villes` - Villes d'un pays
- `GET /api/v1/pays-du-monde/:id/regions` - Régions d'un pays
- `GET /api/v1/pays-du-monde/animal/:animal` - Pays par animal officiel

#### Animaux
- `GET /api/v1/animaux/random` - Animal aléatoire
- `GET /api/v1/animaux` - Liste avec filtres
- `GET /api/v1/animaux/search` - Recherche full-text
- `GET /api/v1/animaux/zone/:zone` - Animaux par zone géographique
- `GET /api/v1/animaux/famille/:famille` - Animaux par famille

### 📈 Statistiques

#### `GET /api/v1/stats`
- Statistiques de l'utilisateur connecté
- Quotas par table et clé API

#### `GET /api/v1/stats/global`
- Statistiques globales de l'API

---

## 🧪 Exemple de réponse API

### Headers requis pour les données :
```
x-api-key: votre-clé-api-ici
```

### Exemple de requête avec authentification :
```bash
# Connexion
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' \
  -c cookies.txt

# Utilisation avec cookies
curl -X GET "http://localhost:3000/api/v1/auth/profile" \
  -b cookies.txt
```

### Exemple de requête avec clé API :
```bash
curl -X GET "http://localhost:3000/api/v1/punchlines/random" \
  -H "x-api-key: votre-clé-api-ici"
```

### Exemple de réponse :
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "citation": "Le savoir est une arme. Moi je suis armé jusqu'aux dents.",
    "auteur": "Kery James",
    "theme": "rap",
    "tags": ["savoir", "rap", "philosophie"],
    "source_film": false,
    "source_livre": false,
    "annee": 2009,
    "langue": "France",
    "popularite": 85,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "table": "punchlines"
  }
}
```

### Exemple de réponse pour un pays :
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "nom": "France",
    "capitale": "Paris",
    "population": 67390000,
    "superficie": 551695.0,
    "continent": "Europe",
    "langue_officielle": "Français",
    "monnaie": "Euro",
    "drapeau_url": "https://example.com/france-flag.png",
    "plus_grandes_villes": [
      {"nom": "Paris", "population": 2161000},
      {"nom": "Marseille", "population": 861635},
      {"nom": "Lyon", "population": 513275}
    ],
    "animal_officiel": "Coq gaulois",
    "nombre_habitants": 67390000,
    "plus_grandes_regions": [
      {"nom": "Île-de-France", "population": 12200000},
      {"nom": "Auvergne-Rhône-Alpes", "population": 8000000},
      {"nom": "Nouvelle-Aquitaine", "population": 6000000}
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "table": "pays_du_monde"
  }
}
```

### Exemple de réponse pour un animal :
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "nom": "Loup gris",
    "espece": "Canis lupus",
    "famille": "Canidés",
    "habitat": "Forêts, montagnes, toundra",
    "alimentation": "Carnivore",
    "taille": 120.0,
    "poids": 45.0,
    "esperance_vie": 15,
    "zones_geographiques": ["Europe", "Amérique du Nord", "Asie"],
    "image_url": "https://example.com/loup-gris.jpg",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "table": "animaux"
  }
}
```

---

## 🔒 Middleware et Guards

### Middleware de vérification de la clé API

```typescript
// api-key.middleware.ts
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly logger: Logger,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    const tableName = this.extractTableName(req.path);
    
    if (!apiKey) {
      throw new UnauthorizedException('Clé API requise');
    }

    const keyData = await this.apiKeyService.validateApiKey(apiKey, tableName);
    req['apiKeyData'] = keyData;
    
    // Log de l'appel
    await this.apiKeyService.logApiCall(keyData.id, req, res, tableName);
    
    next();
  }

  private extractTableName(path: string): string {
    // Extraction du nom de la table depuis l'URL
    const match = path.match(/\/api\/v1\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }
}
```

### Guard de quota par table

```typescript
// quota.guard.ts
@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKeyData = request['apiKeyData'];

    if (apiKeyData.type === 'premium') {
      return true;
    }

    const canCall = await this.apiKeyService.checkQuota(apiKeyData.id);
    if (!canCall) {
      throw new TooManyRequestsException('Quota journalier dépassé pour cette table');
    }

    return true;
  }
}
```

---

## 📚 Swagger / Docs

Une fois le serveur lancé :
```
http://localhost:3000/api/v1
```

Configurer Swagger dans `main.ts` :

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration globale
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Cookies
  app.use(cookieParser(process.env.COOKIE_SECRET));
  
  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  
  // Helmet pour la sécurité
  app.use(helmet());
  
  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Multi-Tables')
    .setDescription('API RESTful pour récupérer et filtrer des données depuis plusieurs tables')
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .addTag('auth', 'Authentification Supabase')
    .addTag('api-keys', 'Gestion des clés API')
    .addTag('punchlines', 'Endpoints pour les punchlines')
    .addTag('pays-du-monde', 'Endpoints pour les pays du monde')
    .addTag('animaux', 'Endpoints pour les animaux')
    .addTag('stats', 'Statistiques et quotas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);
  
  await app.listen(process.env.API_PORT || 3000);
}
```

---

## 🧪 Tests

### Tests unitaires

```bash
# Lancer les tests
npm run test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

### Tests d'intégration

```bash
# Tests d'intégration
npm run test:e2e
```

### Exemple de test avec authentification

```typescript
// auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        nom: 'Doe',
        prenom: 'John',
        date_naissance: '1990-01-01',
        adresse_postale: '123 Rue de la Paix',
        code_postal: '75001',
        ville: 'Paris',
        pays: 'France'
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## 📊 Monitoring et Logs

### Métriques Prometheus

```typescript
// metrics.controller.ts
@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics() {
    return register.metrics();
  }
}
```

### Logs structurés

```typescript
// logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const userId = request['user']?.id || 'anonymous';
    const tableName = request['apiKeyData']?.table_name || 'unknown';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;

        this.logger.log({
          method,
          url,
          statusCode: response.statusCode,
          delay,
          ip,
          userAgent,
          userId,
          tableName,
        });
      }),
    );
  }
}
```

---

## 📤 Déploiement

### Variables d'environnement de production

```env
# Production
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
DATABASE_URL=postgres://...
REDIS_URL=redis://...
API_PORT=3000
CORS_ORIGIN=https://votre-domaine.com
COOKIE_SECRET=your_secure_cookie_secret
LOG_LEVEL=warn
PROMETHEUS_ENABLED=true
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env.production ./.env

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - COOKIE_SECRET=${COOKIE_SECRET}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Plateformes de déploiement

Tu peux déployer ton API sur :
- [Render](https://render.com/) - Configuration automatique
- [Railway](https://railway.app/) - Déploiement simple
- [Vercel](https://vercel.com/) - Serverless
- [Heroku](https://heroku.com/) - PaaS classique

N'oublie pas d'ajouter toutes les variables d'environnement dans la plateforme choisie.

---

## 🔧 Scripts utiles

### Package.json

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert",
    "db:seed": "ts-node src/database/seed.ts"
  }
}
```

---

## ✅ Feuille de route (Roadmap)

### Phase 1 - Fondations ✅
- [x] Authentification Supabase avec cookies HTTPS
- [x] Structure multi-tables (punchlines, pays_du_monde, animaux)
- [x] Système de clés API par table
- [x] Profils utilisateurs complets
- [x] Quotas Free (50 appels/jour par table)
- [x] Validation des données
- [x] Gestion d'erreurs centralisée
- [x] Logs structurés
- [x] Tests unitaires

### Phase 2 - Performance 🚧
- [ ] Cache Redis pour les données populaires
- [ ] Pagination avec limit/offset
- [ ] Indexation SQL optimisée
- [ ] Rate limiting granulaire par table
- [ ] Compression des réponses
- [ ] CDN pour les assets statiques

### Phase 3 - Fonctionnalités avancées 📋
- [ ] Recherche full-text avec PostgreSQL
- [ ] Système de tags flexible
- [x] API versioning (préfixe `/api/v1/` implémenté)
- [ ] Webhooks pour les événements
- [ ] Interface d'admin (gestion des clés, visualisation des logs)
- [ ] Stripe (achat clé premium) - **Recommandé pour la conformité et la couverture mondiale**
- [ ] Export des données (CSV, JSON)
- [ ] Système de favoris par utilisateur
- [ ] Notifications par email
- [ ] Système d'abonnement avec paiements récurrents

### Phase 4 - Écosystème 🌐
- [ ] SDK client (JavaScript, Python, PHP)
- [ ] Documentation interactive
- [ ] Marketplace de thèmes
- [ ] API publique pour contributions
- [ ] Système de modération
- [ ] Analytics avancées
- [ ] Dashboard utilisateur

---

## 🛡️ Sécurité

### Bonnes pratiques implémentées

- **Authentification Supabase** : Gestion sécurisée des utilisateurs
- **Cookies HTTPS** : Stockage sécurisé des tokens
- **Validation stricte** : Tous les inputs sont validés
- **Rate limiting** : Protection contre les abus par table
- **CORS configuré** : Contrôle des origines autorisées
- **Helmet** : Headers de sécurité HTTP
- **Logs d'audit** : Traçabilité complète des appels
- **Quotas par table** : Limitation des appels par clé API et table
- **HTTPS obligatoire** : En production
- **RLS (Row Level Security)** : Protection des données utilisateur

### Recommandations de sécurité

1. **Rotation des clés API** : Changer régulièrement les clés
2. **Monitoring** : Surveiller les patterns d'usage anormaux
3. **Backup** : Sauvegardes régulières de la base de données
4. **Updates** : Maintenir les dépendances à jour
5. **Audit** : Vérifications régulières des logs de sécurité

---

## 📄 Licence

Ce projet est open-source sous licence MIT.

---

## 👨‍💻 Auteur

Développé avec ❤️ par [Ton Nom].

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 Support

- 📧 Email : support@api-multi-tables.com
- 🐛 Issues : [GitHub Issues](https://github.com/username/api-multi-tables/issues)
- 📖 Documentation : [Wiki](https://github.com/username/api-multi-tables/wiki)

---

## 📖 Bonnes pratiques d'utilisation

### Structure des URLs
- **Toujours utiliser le préfixe** : `/api/v1/`
- **Exemple** : `GET /api/v1/punchlines/random` ✅
- **Éviter** : `GET /punchlines/random` ❌

### Authentification
```bash
# Connexion avec cookies
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' \
  -c cookies.txt

# Utilisation avec cookies
curl -X GET "http://localhost:3000/api/v1/auth/profile" \
  -b cookies.txt
```

### Clés API par table
```bash
# Headers requis pour les données
x-api-key: votre-clé-api-ici
```

### Exemples d'utilisation

#### JavaScript (Fetch avec cookies)
```javascript
// Connexion
const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Utilisation avec cookies
const profileResponse = await fetch('http://localhost:3000/api/v1/auth/profile', {
  credentials: 'include'
});
```

#### JavaScript (Fetch avec clé API)
```javascript
const response = await fetch('http://localhost:3000/api/v1/punchlines/random', {
  headers: {
    'x-api-key': 'votre-clé-api-ici'
  }
});
const data = await response.json();
```

#### Python (Requests)
```python
import requests

# Connexion avec cookies
session = requests.Session()
login_response = session.post(
    'http://localhost:3000/api/v1/auth/login',
    json={'email': 'user@example.com', 'password': 'password123'}
)

# Utilisation avec session (cookies automatiques)
profile_response = session.get('http://localhost:3000/api/v1/auth/profile')

# Utilisation avec clé API
response = requests.get(
    'http://localhost:3000/api/v1/punchlines/random',
    headers={'x-api-key': 'votre-clé-api-ici'}
)
data = response.json()
```

#### PHP (cURL)
```php
// Connexion avec cookies
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/api/v1/auth/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'user@example.com',
    'password' => 'password123'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// Utilisation avec clé API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/api/v1/punchlines/random');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['x-api-key: votre-clé-api-ici']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
```

---

## 📞 Support

```markdown
Pour toute question ou problème :
- 📧 Email : support@api-multi-tables.com
- 🐛 Issues : [GitHub Issues](https://github.com/username/api-multi-tables/issues)
- 📖 Documentation : [Wiki](https://github.com/username/api-multi-tables/wiki)