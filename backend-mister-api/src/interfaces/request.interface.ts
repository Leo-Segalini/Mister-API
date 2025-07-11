import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    access_token?: string;
    created_at?: Date;
    updated_at?: Date;
    // Champs premium
    is_premium?: boolean;
    premium_expires_at?: Date;
    // Champs du profil utilisateur
    nom?: string;
    prenom?: string;
    date_naissance?: string;
    adresse_postale?: string;
    code_postal?: string;
    ville?: string;
    pays?: string;
    telephone?: string;
    stripe_customer_id?: string;
    conditions_generales_acceptees?: boolean;
    politique_confidentialite_acceptee?: boolean;
    date_acceptation_conditions?: Date;
    date_acceptation_politique?: Date;
  };
  headers: Request['headers'] & {
    authorization?: string;
  };
}

export interface RawBodyRequest<T> extends Request {
  rawBody: string;
  body: T;
} 