// Types pour les APIs
export interface Api {
  id: number;
  name: string;
  description: string;
  endpoint: string;
  color: string;
  status: 'active' | 'beta' | 'deprecated';
  features: string[];
  categories: string[];
  documentation: string;
  popular: boolean;
}

// Types pour les utilisateurs (mis à jour selon le backend)
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  date_naissance?: string;
  adresse_postale?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
  is_premium: boolean;
  premium_expires_at?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  role?: 'user' | 'admin'; // Rôle utilisateur
}

// Types pour les clés API (mis à jour selon le backend)
export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  table_name: string;
  type: 'free' | 'premium';
  appels_jour: number;
  appels_minute: number;
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les logs API
export interface ApiLog {
  id: string;
  api_key_id: string;
  user_id: string;
  table_name: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Types pour les citations historiques (anciennement punchlines)
export interface Citation {
  id: string;
  citation: string;
  auteur: string;
  theme: string;
  tags: string[];
  source_film: boolean;
  source_livre: boolean;
  annee: number;
  langue: string;
  popularite: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour les animaux
export interface Animal {
  id: string;
  nom: string;
  espece: string;
  famille: string;
  habitat: string;
  alimentation: string;
  taille: number;
  poids: number;
  esperance_vie: number;
  zones_geographiques: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour les pays du monde
export interface Pays {
  id: string;
  nom: string;
  capitale: string;
  population: number;
  superficie: number;
  continent: string;
  langue_officielle: string;
  monnaie: string;
  nombre_habitants: number;
  plus_grandes_villes: any;
  plus_grandes_regions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour les paiements
export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  payment_method: string;
  description: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    page?: number;
    totalPages?: number;
  };
}

// Types pour les erreurs
export interface ApiError {
  error: string;
  message: string;
  status_code: number;
  details?: any;
}

// Types pour l'authentification
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  date_naissance?: string;
  adresse_postale?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
  politique_confidentialite_acceptee: boolean;
  conditions_generales_acceptees: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
}

// Types pour les quotas
export interface QuotaInfo {
  type: 'free' | 'premium';
  daily_limit: number;
  per_minute_limit: number;
  daily_used: number;
  per_minute_used: number;
  daily_remaining: number;
  per_minute_remaining: number;
  reset_time: string;
  last_reset: string;
}

// Types pour les statistiques
export interface Stats {
  total_apis: number;
  total_calls: number;
  total_users: number;
  uptime: string;
  today_calls?: number;
  month_calls?: number;
}

// Types pour les statistiques d'utilisation d'une clé API
export interface ApiKeyUsageStats {
  id: string;
  api_key_name: string;
  user_id: string;
  user_email: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  last_request_at: string;
  calls_today: number;
  total_calls: number;
}

// Types pour les statistiques (ancien format - à garder pour compatibilité)
export interface ApiStats {
  type: 'free' | 'premium';
  quota_total: number;
  appels_restants: number;
  appels_aujourd_hui: number;
  appels_minute: number;
  appels_total: number;
  appels_reussis: number;
  appels_echoues: number;
  temps_reponse_moyen: number;
  taux_reussite: number;
  dernier_reset: string;
  derniere_utilisation: string;
}

// Types pour les plans de prix
export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  popular: boolean;
  icon: React.ReactNode;
  quota_daily: number;
  quota_per_minute: number;
}

// Types pour les paramètres de requête
export interface CitationParams {
  limit?: number;
  offset?: number;
  theme?: string;
  auteur?: string;
  annee?: number;
  langue?: string;
  search?: string;
}

export interface AnimalParams {
  limit?: number;
  offset?: number;
  espece?: string;
  famille?: string;
  habitat?: string;
  search?: string;
}

export interface PaysParams {
  limit?: number;
  offset?: number;
  continent?: string;
  population_range?: string;
  capitale?: string;
  monnaie?: string;
  langue?: string;
  search?: string;
}

// Types pour la création/modification d'entités (admin)
export interface CreateCitationData {
  citation: string;
  auteur: string;
  theme: string;
  tags: string[];
  source_film: boolean;
  source_livre: boolean;
  annee: number;
  langue: string;
  popularite: number;
}

export interface UpdateCitationData extends Partial<CreateCitationData> {
  is_active?: boolean;
}

export interface CreateAnimalData {
  nom: string;
  espece: string;
  famille: string;
  habitat: string;
  alimentation: string;
  taille: number;
  poids: number;
  esperance_vie: number;
  zones_geographiques: string[];
}

export interface UpdateAnimalData extends Partial<CreateAnimalData> {
  is_active?: boolean;
}

export interface CreatePaysData {
  nom: string;
  capitale: string;
  population: number;
  superficie: number;
  continent: string;
  langue_officielle: string;
  monnaie: string;
  nombre_habitants: number;
  plus_grandes_villes: any;
  plus_grandes_regions: any;
}

export interface UpdatePaysData extends Partial<CreatePaysData> {
  is_active?: boolean;
}

// Types pour les cookies de session
export interface SessionCookies {
  access_token: string;
  refresh_token: string;
  user_id: string;
  role: string;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
} 