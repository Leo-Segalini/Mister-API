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
} 