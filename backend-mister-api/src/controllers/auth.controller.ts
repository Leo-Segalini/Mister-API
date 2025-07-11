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
      
      // Définir les cookies sécurisés
      if (session) {
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none' as const, // Changé à 'none' pour cross-origin en HTTPS
          maxAge: session.expires_in * 1000,
          path: '/',
        };

        res.cookie('access_token', session.access_token, cookieOptions);
        res.cookie('sb-access-token', session.access_token, cookieOptions); // Cookie alternatif
        
        this.logger.log(`🍪 Cookies définis pour ${user?.email}`);
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
      
      // Définir les cookies sécurisés
      if (session) {
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none' as const, // Changé à 'none' pour cross-origin en HTTPS
          maxAge: session.expires_in * 1000,
          path: '/',
          // Pas de domaine spécifique pour permettre le cross-origin
        };

        res.cookie('access_token', session.access_token, cookieOptions);
        res.cookie('sb-access-token', session.access_token, cookieOptions); // Cookie alternatif
        
        this.logger.log(`🍪 Cookies définis pour ${user?.email}`);
        this.logger.log(`🍪 Cookie options:`, {
          httpOnly: cookieOptions.httpOnly,
          secure: cookieOptions.secure,
          sameSite: cookieOptions.sameSite,
          path: cookieOptions.path,
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
    } catch (error) {
      // Même en cas d'erreur, on supprime les cookies
      res.clearCookie('access_token');
      res.clearCookie('sb-access-token');
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Récupérer le profil utilisateur',
    description: 'Récupère les informations du profil de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profil récupéré avec succès' },
        data: { type: 'object' }
      }
    }
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
      const profile = await this.supabaseService.getUserProfile(req.user.id);
      
      return {
        success: true,
        message: 'Profil récupéré avec succès',
        data: profile
      };
    } catch (error) {
      throw new UnauthorizedException('Erreur lors de la récupération du profil');
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
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
        data: {
          id: req.user?.id,
          email: req.user?.email,
          role: req.user?.role,
          created_at: req.user?.created_at,
          updated_at: req.user?.updated_at
        }
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
} 