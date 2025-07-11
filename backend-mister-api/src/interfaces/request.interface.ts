import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
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