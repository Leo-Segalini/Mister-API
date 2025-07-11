import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    is_premium: boolean;
    premium_expires_at: Date;
    access_token?: string;
    created_at?: Date;
    updated_at?: Date;
    // Champs du profil utilisateur
    nom?: string;
    prenom?: string;
    telephone?: string;
    adresse_postale?: string;
    code_postal?: string;
    ville?: string;
    pays?: string;
    date_naissance?: string;
    stripe_customer_id?: string;
  };
  headers: Request['headers'] & {
    authorization?: string;
  };
}

export interface RawBodyRequest<T> extends Request {
  rawBody: string;
  body: T;
} 