export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    timestamp: string;
    version: string;
    table?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface FilterDto {
  theme?: string;
  auteur?: string;
  annee?: number;
  langue?: string;
  source_film?: boolean;
  source_livre?: boolean;
  tags?: string[];
  continent?: string;
  espece?: string;
  famille?: string;
  habitat?: string;
  alimentation?: string;
  zones_geographiques?: string[];
}

export interface SearchDto {
  q: string;
  fields?: string[];
}

export interface QuotaInfo {
  type: 'free' | 'premium';
  quota_total: number;
  appels_restants: number;
  appels_aujourd_hui: number;
  table_name: string;
}

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  adresse_postale: string;
  code_postal: string;
  ville: string;
  pays: string;
  telephone?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  is_premium: boolean;
  premium_expires_at: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  table_name: string;
  type: 'free' | 'premium';
  is_active: boolean;
  appels_jour: number;
  appels_minute: number;
  expires_at?: string;
  created_at: string;
  last_used_at: string;
  updated_at: string;
} 