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
  };
  headers: Request['headers'] & {
    authorization?: string;
  };
}

export interface RawBodyRequest<T> extends Request {
  rawBody: string;
  body: T;
} 