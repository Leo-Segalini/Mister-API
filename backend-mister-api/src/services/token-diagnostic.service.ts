import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenDiagnosticService {
  private readonly logger = new Logger(TokenDiagnosticService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL et SUPABASE_ANON_KEY sont requis');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Diagnostic complet d'un token JWT
   * Analyse les timestamps, la validité et les claims
   */
  async diagnoseToken(token: string): Promise<{
    isValid: boolean;
    error?: string;
    tokenInfo?: any;
    clockDrift?: number;
    timeUntilExpiry?: number;
    recommendations?: string[];
  }> {
    try {
      // Décoder le token sans vérification pour examiner les claims
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return {
          isValid: false,
          error: 'Token JWT malformé',
          recommendations: ['Vérifier la génération du token']
        };
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Math.floor(Date.now() / 1000);
      const serverTime = now;
      
      this.logger.debug('🔍 Diagnostic du token JWT:');
      this.logger.debug(`   - Timestamp serveur actuel: ${serverTime}`);
      this.logger.debug(`   - Token émis à (iat): ${payload.iat}`);
      this.logger.debug(`   - Token expire à (exp): ${payload.exp}`);
      this.logger.debug(`   - Temps restant: ${payload.exp - serverTime} secondes`);

      // Calculer le décalage d'horloge potentiel
      const clockDrift = payload.iat - serverTime;
      const timeUntilExpiry = payload.exp - serverTime;

      // Vérifier avec Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      const recommendations: string[] = [];
      
      // Analyser les problèmes potentiels
      if (clockDrift > 60) {
        recommendations.push('Décalage d\'horloge détecté - vérifier la synchronisation NTP');
      }
      
      if (timeUntilExpiry <= 0) {
        recommendations.push('Token expiré - utiliser le refresh token pour renouveler');
      }
      
      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        recommendations.push('Token expire bientôt - prévoir le renouvellement');
      }

      return {
        isValid: !error && user !== null,
        error: error?.message,
        tokenInfo: {
          iat: payload.iat,
          exp: payload.exp,
          sub: payload.sub,
          email: payload.email,
          aud: payload.aud,
          iss: payload.iss
        },
        clockDrift,
        timeUntilExpiry,
        recommendations
      };
    } catch (error) {
      this.logger.error('Erreur lors du diagnostic du token:', error);
      return {
        isValid: false,
        error: `Erreur de diagnostic: ${error.message}`,
        recommendations: ['Vérifier le format du token et sa génération']
      };
    }
  }

  /**
   * Rafraîchit automatiquement un token expiré
   */
  async refreshTokenIfNeeded(accessToken: string, refreshToken: string): Promise<{
    newAccessToken?: string;
    newRefreshToken?: string;
    refreshed: boolean;
    error?: string;
  }> {
    try {
      // Diagnostiquer le token actuel
      const diagnostic = await this.diagnoseToken(accessToken);
      
      // Si le token est encore valide et n'expire pas dans les 5 minutes, pas besoin de refresh
      if (diagnostic.isValid && diagnostic.timeUntilExpiry !== undefined && diagnostic.timeUntilExpiry > 300) {
        return { refreshed: false };
      }

      this.logger.log('🔄 Tentative de refresh du token expiré/expirant');
      
      // Utiliser le refresh token pour obtenir un nouveau access token
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        this.logger.error('❌ Erreur lors du refresh du token:', error);
        return {
          refreshed: false,
          error: error.message
        };
      }

      this.logger.log('✅ Token rafraîchi avec succès');
      return {
        newAccessToken: data.session?.access_token,
        newRefreshToken: data.session?.refresh_token,
        refreshed: true
      };
    } catch (error) {
      this.logger.error('Erreur lors du refresh du token:', error);
      return {
        refreshed: false,
        error: error.message
      };
    }
  }

  /**
   * Vérifie la synchronisation d'horloge avec Supabase
   */
  async checkClockSync(): Promise<{
    isSync: boolean;
    drift: number;
    serverTime: number;
    supabaseTime?: number;
  }> {
    try {
      const localTime = Math.floor(Date.now() / 1000);
      
      // Créer une session temporaire pour obtenir un timestamp de référence
      const { data, error } = await this.supabase.auth.signInAnonymously();
      
      if (error) {
        this.logger.warn('Impossible de vérifier la synchronisation d\'horloge');
        return {
          isSync: true, // Assumons que c'est synchronisé si on ne peut pas vérifier
          drift: 0,
          serverTime: localTime
        };
      }

      const tokenParts = data.session?.access_token?.split('.');
      if (tokenParts && tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const supabaseTime = payload.iat;
        const drift = Math.abs(localTime - supabaseTime);
        
        // Nettoyer la session anonyme
        await this.supabase.auth.signOut();
        
        return {
          isSync: drift < 30, // Tolérance de 30 secondes
          drift,
          serverTime: localTime,
          supabaseTime
        };
      }

      return {
        isSync: true,
        drift: 0,
        serverTime: localTime
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification de synchronisation:', error);
      return {
        isSync: true,
        drift: 0,
        serverTime: Math.floor(Date.now() / 1000)
      };
    }
  }
} 