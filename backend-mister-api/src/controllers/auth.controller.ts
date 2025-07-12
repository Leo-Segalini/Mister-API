import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { SupabaseService } from '../services/supabase.service';
import { BrevoConfigService } from '../services/brevo-config.service';
import { AuthGuard } from '../guards/auth.guard';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import { ApiResponse } from '../interfaces/api-response.interface';
import { LoginDto, RegisterDto, UpdateLegalAcceptanceDto } from '../dto/auth.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly brevoConfigService: BrevoConfigService
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Inscription d\'un nouvel utilisateur',
    description: 'Crée un nouveau compte utilisateur avec Supabase. Les données utilisateur sont stockées dans auth.users et le profil est créé automatiquement dans public.users via un trigger.'
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Utilisateur créé avec succès' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            session: { type: 'object' }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides (email invalide, mot de passe trop court, etc.)'
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Un compte avec cette adresse email existe déjà'
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<any>> {
    try {
      const { user, session } = await this.supabaseService.register(registerDto);
      
      // Définir les cookies sécurisés avec une durée de 4 heures
      if (session) {
        // Durée personnalisée de 4 heures (14400 secondes)
        const customExpiresIn = 4 * 60 * 60; // 4 heures en secondes
        
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none' as const, // Changé à 'none' pour cross-origin en HTTPS
          maxAge: customExpiresIn * 1000, // 4 heures en millisecondes
          path: '/',
          domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined, // Domaine pour cross-origin
        };

        res.cookie('access_token', session.access_token, cookieOptions);
        res.cookie('sb-access-token', session.access_token, cookieOptions); // Cookie alternatif
        
        this.logger.log(`🍪 Cookies définis pour ${user?.email} avec durée de 4 heures`);
        this.logger.log(`⏰ Durée du token: ${customExpiresIn} secondes (4 heures)`);
      }

      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        data: { user, session }
      };
    } catch (error) {
      // Gestion spécifique des erreurs Supabase
      if (error.message) {
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('already exists')) {
          throw new ConflictException('Un compte avec cette adresse email existe déjà');
        }
        
        if (error.message.includes('Invalid email') || 
            (error.message.includes('email address') && error.message.includes('invalid'))) {
          throw new BadRequestException('Adresse email invalide');
        }
        
        if (error.message.includes('Password should be at least') ||
            error.message.includes('password')) {
          throw new BadRequestException('Le mot de passe ne respecte pas les critères de sécurité');
        }
        
        if (error.message.includes('Rate limit exceeded') ||
            error.message.includes('rate limit exceeded')) {
          throw new BadRequestException('Limite de tentatives dépassée. Veuillez réessayer dans quelques minutes.');
        }
      }
      
      // Log de l'erreur pour le debugging
      this.logger.error('Erreur lors de l\'inscription:', error);
      
      // Erreur générique
      throw new BadRequestException('Erreur lors de l\'inscription: ' + error.message);
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description: 'Authentifie un utilisateur avec Supabase et vérifie les conditions légales'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Connexion réussie' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            session: { type: 'object' },
            legalStatus: {
              type: 'object',
              properties: {
                conditionsAccepted: { type: 'boolean' },
                politiqueAccepted: { type: 'boolean' },
                bothAccepted: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Identifiants invalides'
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`🚀 Début de la connexion pour: ${loginDto.email}`);
      
      const { user, session, legalStatus } = await this.supabaseService.login(loginDto);
      
      // Définir les cookies sécurisés avec une durée de 4 heures
      if (session) {
        // Durée personnalisée de 4 heures (14400 secondes)
        const customExpiresIn = 4 * 60 * 60; // 4 heures en secondes
        
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none' as const, // Changé à 'none' pour cross-origin en HTTPS
          maxAge: customExpiresIn * 1000, // 4 heures en millisecondes
          path: '/',
          domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined, // Domaine pour cross-origin
        };

        // Durée plus longue pour le refresh token (7 jours)
        const refreshCookieOptions = {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        };

        // Configuration spéciale pour cross-origin avec différents domaines
        const crossOriginCookieOptions = {
          ...cookieOptions,
          domain: undefined, // Pas de domaine spécifique pour éviter les problèmes cross-origin
          sameSite: 'none' as const,
          secure: true, // Obligatoire avec sameSite='none'
        };

        const refreshCrossOriginOptions = {
          ...refreshCookieOptions,
          domain: undefined,
          sameSite: 'none' as const,
          secure: true,
        };

        res.cookie('access_token', session.access_token, crossOriginCookieOptions);
        res.cookie('sb-access-token', session.access_token, crossOriginCookieOptions); // Cookie alternatif
        res.cookie('refresh_token', session.refresh_token, refreshCrossOriginOptions); // Refresh token
        
        // Ajout d'un header Authorization comme fallback
        res.header('Authorization', `Bearer ${session.access_token}`);
        res.header('X-Refresh-Token', session.refresh_token);
        
        this.logger.log(`🍪 Cookies définis pour ${user?.email} avec durée de 4 heures`);
        this.logger.log(`⏰ Durée du token: ${customExpiresIn} secondes (4 heures)`);
        this.logger.log(`🍪 Cookie options:`, {
          httpOnly: cookieOptions.httpOnly,
          secure: cookieOptions.secure,
          sameSite: cookieOptions.sameSite,
          path: cookieOptions.path,
          maxAge: cookieOptions.maxAge,
        });
      }

      this.logger.log(`✅ Connexion réussie pour: ${user?.email}`);
      
      // Log du statut légal
      if (legalStatus) {
        this.logger.log(`📋 Statut conditions légales pour ${user?.email}:`);
        this.logger.log(`   - Conditions générales: ${legalStatus.conditionsAccepted ? '✅' : '❌'}`);
        this.logger.log(`   - Politique confidentialité: ${legalStatus.politiqueAccepted ? '✅' : '❌'}`);
        this.logger.log(`   - Les deux acceptées: ${legalStatus.bothAccepted ? '✅' : '❌'}`);
      }

      return {
        success: true,
        message: 'Connexion réussie',
        data: { user, session, legalStatus }
      };
    } catch (error) {
      this.logger.error(`❌ Erreur de connexion: ${error.message}`);
      
      // Gestion spécifique de l'erreur email non confirmé
      if (error.message === 'EMAIL_NOT_CONFIRMED') {
        throw new UnauthorizedException('Votre email n\'est pas encore confirmé. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.');
      }
      
      throw new UnauthorizedException('Identifiants invalides');
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Déconnexion utilisateur',
    description: 'Déconnecte l\'utilisateur et invalide les tokens'
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerApiResponse({
    status: 204,
    description: 'Déconnexion réussie'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    try {
      // Invalider le token côté Supabase
      await this.supabaseService.logout(req.user?.access_token);
      
      // Supprimer les cookies
      res.clearCookie('access_token');
      res.clearCookie('sb-access-token');
      res.clearCookie('refresh_token');
    } catch (error) {
      // Même en cas d'erreur, on supprime les cookies
      res.clearCookie('access_token');
      res.clearCookie('sb-access-token');
      res.clearCookie('refresh_token');
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer le profil utilisateur',
    description: 'Récupère les informations du profil utilisateur connecté'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async getProfile(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      this.logger.log(`👤 Récupération du profil pour: ${req.user?.email}`);
      
      const user = await this.supabaseService.getUserProfile(req.user.id);
      
      return {
        success: true,
        message: 'Profil récupéré avec succès',
        data: user
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du profil:', error);
      throw new UnauthorizedException('Erreur lors de la récupération du profil');
    }
  }

  @Get('check-admin-role')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Vérifier le rôle admin',
    description: 'Vérifie le rôle de l\'utilisateur connecté dans la table public.users'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Rôle vérifié avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Rôle vérifié avec succès' },
        data: {
          type: 'object',
          properties: {
            role: { type: 'string', example: 'admin' }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async checkAdminRole(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      this.logger.log(`🔍 Vérification du rôle pour: ${req.user?.email}`);
      
      // Utiliser la méthode existante du service pour récupérer le rôle
      const role = await this.supabaseService.getUserRole(req.user.id);
      
      this.logger.log(`🔍 Résultat de la vérification pour ${req.user?.email}: role=${role}`);
      
      return {
        success: true,
        message: 'Rôle vérifié avec succès',
        data: { role }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du rôle:', error);
      throw new UnauthorizedException('Erreur lors de la vérification du rôle');
    }
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({
    summary: 'Récupérer les informations de l\'utilisateur connecté',
    description: 'Récupère les informations de base de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Informations utilisateur récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Informations utilisateur récupérées avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async getMe(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    try {
      return {
        success: true,
        message: 'Informations utilisateur récupérées avec succès',
        data: req.user
      };
    } catch (error) {
      throw new UnauthorizedException('Erreur lors de la récupération des informations utilisateur');
    }
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Demande de réinitialisation de mot de passe',
    description: 'Envoie un email de réinitialisation de mot de passe'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Email de réinitialisation envoyé'
  })
  async resetPassword(@Body('email') email: string): Promise<ApiResponse<null>> {
    try {
      await this.supabaseService.resetPassword(email);
      return {
        success: true,
        message: 'Email de réinitialisation envoyé',
        data: null
      };
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  @Get('configure-brevo')
  @ApiOperation({
    summary: 'Configuration Brevo pour Supabase',
    description: 'Vérifie et configure Brevo pour l\'envoi d\'emails via Supabase Auth'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Configuration Brevo vérifiée',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Brevo configuré pour Supabase Auth' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'configured' },
            message: { type: 'string', example: 'Brevo configuré pour Supabase Auth' }
          }
        }
      }
    }
  })
  async configureBrevo(): Promise<ApiResponse<any>> {
    try {
      const result = await this.supabaseService.configureBrevoEmail();
      return {
        success: true,
        message: 'Configuration Brevo vérifiée',
        data: result
      };
    } catch (error) {
      this.logger.error('Erreur lors de la configuration Brevo:', error);
      throw new BadRequestException('Erreur lors de la configuration Brevo');
      }
    }

  @Post('resend-confirmation')
  @ApiOperation({
    summary: 'Renvoyer l\'email de confirmation',
    description: 'Renvoye un email de confirmation pour un utilisateur non confirmé'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Email de confirmation renvoyé'
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Email invalide ou utilisateur non trouvé'
  })
  async resendConfirmation(@Body('email') email: string): Promise<ApiResponse<null>> {
    try {
      await this.supabaseService.sendConfirmationEmail(email);
      return {
        success: true,
        message: 'Email de confirmation renvoyé',
        data: null
      };
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email de confirmation');
    }
  }

  @Get('check-email-confirmation/:userId')
  @ApiOperation({
    summary: 'Vérifier le statut de confirmation d\'email',
    description: 'Vérifie si l\'email d\'un utilisateur a été confirmé'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statut de confirmation vérifié',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statut de confirmation vérifié' },
        data: {
          type: 'object',
          properties: {
            isConfirmed: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  async checkEmailConfirmation(@Body('userId') userId: string): Promise<ApiResponse<any>> {
    try {
      const isConfirmed = await this.supabaseService.checkEmailConfirmation(userId);
      return {
        success: true,
        message: 'Statut de confirmation vérifié',
        data: { isConfirmed }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification de l\'email:', error);
      throw new BadRequestException('Erreur lors de la vérification de l\'email');
    }
  }

  @Get('diagnose-brevo')
  @ApiOperation({
    summary: 'Diagnostic de la configuration Brevo',
    description: 'Diagnostique les problèmes de configuration Brevo et fournit des solutions'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Diagnostic Brevo terminé',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Diagnostic Brevo terminé' },
        data: {
          type: 'object',
          properties: {
            smtpSettings: { type: 'object' },
            domainVerification: { type: 'object' },
            senderVerification: { type: 'object' },
            recommendations: { type: 'array' }
          }
        }
      }
    }
  })
  async diagnoseBrevo(): Promise<ApiResponse<any>> {
    try {
      const diagnosis = await this.brevoConfigService.diagnoseBrevoConfiguration();
      return {
        success: true,
        message: 'Diagnostic Brevo terminé',
        data: diagnosis
      };
    } catch (error) {
      this.logger.error('Erreur lors du diagnostic Brevo:', error);
      throw new BadRequestException('Erreur lors du diagnostic Brevo');
    }
  }

  @Post('test-email')
  @ApiOperation({
    summary: 'Test d\'envoi d\'email',
    description: 'Teste l\'envoi d\'un email via Brevo'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Test d\'envoi terminé'
  })
  async testEmail(@Body('email') email: string): Promise<ApiResponse<any>> {
    try {
      const testResult = await this.brevoConfigService.testEmailSending(email);
      return {
        success: testResult.success,
        message: testResult.success ? 'Email de test envoyé' : 'Test échoué',
        data: testResult
      };
    } catch (error) {
      this.logger.error('Erreur lors du test d\'envoi:', error);
      throw new BadRequestException('Erreur lors du test d\'envoi');
    }
  }

  @Get('dns-records/:domain')
  @ApiOperation({
    summary: 'Générer les enregistrements DNS',
    description: 'Génère les enregistrements DNS nécessaires pour Brevo'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Enregistrements DNS générés'
  })
  async generateDNSRecords(@Body('domain') domain: string): Promise<ApiResponse<any>> {
    try {
      const dnsRecords = this.brevoConfigService.generateDNSRecords(domain);
      return {
        success: true,
        message: 'Enregistrements DNS générés',
        data: dnsRecords
      };
    } catch (error) {
      this.logger.error('Erreur lors de la génération DNS:', error);
      throw new BadRequestException('Erreur lors de la génération DNS');
    }
  }

  @Get('user-status/:userId')
  @ApiOperation({
    summary: 'Vérifier le statut d\'un utilisateur',
    description: 'Vérifie le statut complet d\'un utilisateur de manière sécurisée'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statut utilisateur vérifié',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statut utilisateur vérifié' },
        data: {
          type: 'object',
          properties: {
            exists: { type: 'boolean', example: true },
            isActive: { type: 'boolean', example: true },
            isEmailConfirmed: { type: 'boolean', example: true },
            role: { type: 'string', example: 'user' },
            lastLogin: { type: 'string', example: '2025-01-07T20:44:16.000Z' }
          }
        }
      }
    }
  })
  async checkUserStatus(@Body('userId') userId: string): Promise<ApiResponse<any>> {
    try {
      const userStatus = await this.supabaseService.checkUserStatus(userId);
      return {
        success: true,
        message: 'Statut utilisateur vérifié',
        data: userStatus
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du statut utilisateur:', error);
      throw new BadRequestException('Erreur lors de la vérification du statut utilisateur');
    }
  }

  @Get('legal-status')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Vérifier le statut des conditions légales',
    description: 'Vérifie si l\'utilisateur connecté a accepté les conditions générales et la politique de confidentialité'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statut des conditions légales vérifié',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statut des conditions légales vérifié' },
        data: {
          type: 'object',
          properties: {
            conditionsAccepted: { type: 'boolean', example: true },
            politiqueAccepted: { type: 'boolean', example: true },
            bothAccepted: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async getLegalStatus(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      const legalStatus = await this.supabaseService.checkLegalAcceptance(req.user.id);
      return {
        success: true,
        message: 'Statut des conditions légales vérifié',
        data: legalStatus
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification des conditions légales:', error);
      throw new BadRequestException('Erreur lors de la vérification des conditions légales');
    }
  }

  @Post('update-legal-acceptance')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mettre à jour l\'acceptation des conditions légales',
    description: 'Met à jour l\'acceptation des conditions générales et de la politique de confidentialité'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Conditions légales mises à jour',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Conditions légales mises à jour' },
        data: {
          type: 'object',
          properties: {
            conditionsAccepted: { type: 'boolean', example: true },
            politiqueAccepted: { type: 'boolean', example: true },
            bothAccepted: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async updateLegalAcceptance(
    @Req() req: AuthenticatedRequest,
    @Body() updateLegalDto: UpdateLegalAcceptanceDto
  ): Promise<ApiResponse<any>> {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      const { conditionsAccepted, politiqueAccepted } = updateLegalDto;

      const success = await this.supabaseService.updateLegalAcceptance(
        req.user.id,
        conditionsAccepted,
        politiqueAccepted
      );

      if (!success) {
        throw new BadRequestException('Erreur lors de la mise à jour des conditions légales');
      }

      // Récupérer le statut mis à jour
      const legalStatus = await this.supabaseService.checkLegalAcceptance(req.user.id);

      return {
        success: true,
        message: 'Conditions légales mises à jour',
        data: legalStatus
      };
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour des conditions légales:', error);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour des conditions légales');
    }
  }

  @Put('profile')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({
    summary: 'Mettre à jour le profil utilisateur',
    description: 'Met à jour les informations du profil de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profil mis à jour avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateProfileDto: any
  ): Promise<ApiResponse<any>> {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      // Filtrer les champs autorisés pour la mise à jour
      const allowedFields = [
        'nom', 'prenom', 'telephone', 'date_naissance', 
        'adresse_postale', 'code_postal', 'ville', 'pays'
      ];
      
      const updateData: any = {};
      allowedFields.forEach(field => {
        if (updateProfileDto[field] !== undefined) {
          updateData[field] = updateProfileDto[field];
        }
      });

      const updatedProfile = await this.supabaseService.updateUserProfile(req.user.id, updateData);
      
      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updatedProfile
      };
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour du profil:', error);
      throw new BadRequestException('Erreur lors de la mise à jour du profil');
    }
  }

  @Post('change-password')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({
    summary: 'Changer le mot de passe',
    description: 'Change le mot de passe de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Mot de passe changé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Mot de passe changé avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordDto: { current_password: string; new_password: string }
  ): Promise<ApiResponse<any>> {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      const { current_password, new_password } = changePasswordDto;

      // Vérifier que le nouveau mot de passe respecte les critères
      if (new_password.length < 8) {
        throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères');
      }

      // Changer le mot de passe via Supabase
      const success = await this.supabaseService.changePassword(
        req.user.email,
        current_password,
        new_password
      );

      if (!success) {
        throw new BadRequestException('Impossible de changer le mot de passe. Vérifiez votre mot de passe actuel.');
      }

      return {
        success: true,
        message: 'Mot de passe changé avec succès',
        data: { message: 'Votre mot de passe a été mis à jour avec succès' }
      };
    } catch (error) {
      this.logger.error('Erreur lors du changement de mot de passe:', error);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors du changement de mot de passe');
    }
  }

  @Get('diagnose-token')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Diagnostic du token JWT',
    description: 'Effectue un diagnostic détaillé du token JWT pour identifier les problèmes'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Diagnostic effectué avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Diagnostic effectué avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async diagnoseToken(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    try {
      // Récupérer le token depuis les cookies
      const token = req.cookies['access_token'] || req.cookies['sb-access-token'];
      
      if (!token) {
        return {
          success: false,
          message: 'Aucun token trouvé dans les cookies',
          data: { error: 'Token non disponible' }
        };
      }

      // Effectuer le diagnostic
      const diagnostic = await this.supabaseService.diagnoseToken(token);
      
      // Informations système supplémentaires
      const systemInfo = {
        serverTime: new Date().toISOString(),
        serverTimestamp: Math.floor(Date.now() / 1000),
        nodeEnv: process.env.NODE_ENV,
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin,
        referer: req.headers.referer,
        cookiesAvailable: Object.keys(req.cookies).join(', ')
      };

      return {
        success: true,
        message: 'Diagnostic effectué avec succès',
        data: {
          diagnostic,
          systemInfo,
          recommendations: diagnostic.recommendations || []
        }
      };
    } catch (error) {
      this.logger.error('Erreur lors du diagnostic du token:', error);
      return {
        success: false,
        message: 'Erreur lors du diagnostic',
        data: { error: error.message }
      };
    }
  }
} 