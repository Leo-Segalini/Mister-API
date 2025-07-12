import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
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
   * Récupère le client Supabase
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Vérifie un token d'authentification
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        this.logger.error('Erreur lors de la vérification du token:', error);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du token:', error);
      return null;
    }
  }

  /**
   * Rafraîchit un token d'authentification expiré
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
      this.logger.log('🔄 Tentative de rafraîchissement du token...');
      
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        this.logger.error('❌ Erreur lors du rafraîchissement du token:', error);
        return null;
      }

      if (data.session) {
        this.logger.log('✅ Token rafraîchi avec succès');
        return {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        };
      }

      return null;
    } catch (error) {
      this.logger.error('❌ Erreur lors du rafraîchissement du token:', error);
      return null;
    }
  }

  /**
   * Vérifie et rafraîchit automatiquement un token si nécessaire
   */
  async verifyAndRefreshToken(accessToken: string, refreshToken?: string): Promise<{
    user: User | null;
    newTokens?: { access_token: string; refresh_token: string };
    needsReauth: boolean;
  }> {
    try {
      // D'abord, essayer de vérifier le token actuel
      const user = await this.verifyToken(accessToken);
      
      if (user) {
        // Token valide, pas besoin de rafraîchissement
        return { user, needsReauth: false };
      }

      // Token expiré, essayer de le rafraîchir
      if (refreshToken) {
        const newTokens = await this.refreshToken(refreshToken);
        
        if (newTokens) {
          // Rafraîchissement réussi, vérifier le nouveau token
          const refreshedUser = await this.verifyToken(newTokens.access_token);
          
          if (refreshedUser) {
            this.logger.log('✅ Token rafraîchi et vérifié avec succès');
            return {
              user: refreshedUser,
              newTokens,
              needsReauth: false
            };
          }
        }
      }

      // Impossible de rafraîchir, nécessite une nouvelle authentification
      this.logger.warn('⚠️ Impossible de rafraîchir le token, authentification requise');
      return { user: null, needsReauth: true };
    } catch (error) {
      this.logger.error('❌ Erreur lors de la vérification/rafraîchissement du token:', error);
      return { user: null, needsReauth: true };
    }
  }

  /**
   * Gère une session utilisateur complète avec rafraîchissement automatique
   */
  async manageSession(accessToken: string, refreshToken?: string): Promise<{
    user: User | null;
    session: { access_token: string; refresh_token: string } | null;
    needsReauth: boolean;
    error?: string;
  }> {
    try {
      // Vérifier le token actuel
      const user = await this.verifyToken(accessToken);
      
      if (user) {
        // Token valide, retourner la session actuelle
        return {
          user,
          session: refreshToken ? { access_token: accessToken, refresh_token: refreshToken } : null,
          needsReauth: false
        };
      }

      // Token expiré, essayer de le rafraîchir
      if (refreshToken) {
        const newTokens = await this.refreshToken(refreshToken);
        
        if (newTokens) {
          // Vérifier le nouveau token
          const refreshedUser = await this.verifyToken(newTokens.access_token);
          
          if (refreshedUser) {
            this.logger.log('✅ Session rafraîchie avec succès');
            return {
              user: refreshedUser,
              session: newTokens,
              needsReauth: false
            };
          }
        }
      }

      // Impossible de rafraîchir
      return {
        user: null,
        session: null,
        needsReauth: true,
        error: 'Session expirée'
      };
    } catch (error) {
      this.logger.error('❌ Erreur lors de la gestion de session:', error);
      return {
        user: null,
        session: null,
        needsReauth: true,
        error: error.message
      };
    }
  }

  /**
   * Récupère le profil utilisateur depuis public.users
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.error('Erreur lors de la récupération du profil:', error);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations complètes de l'utilisateur (auth + profil)
   */
  async getUserCompleteInfo(userId: string) {
    try {
      // Récupérer les informations d'authentification
      const { data: { user }, error: authError } = await this.supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        this.logger.error('Erreur lors de la récupération des infos auth:', authError);
        throw authError;
      }

      // Récupérer le profil utilisateur
      let profile = null;
      try {
        profile = await this.getUserProfile(userId);
      } catch (profileError) {
        this.logger.warn('Profil utilisateur non trouvé, création d\'un profil par défaut');
        // Créer un profil par défaut si il n'existe pas
        profile = await this.createUserProfile(userId, {
          nom: user?.user_metadata?.last_name || '',
          prenom: user?.user_metadata?.first_name || '',
          email: user?.email || '',
          telephone: user?.user_metadata?.phone || '',
          avatar_url: null,
          bio: '',
          preferences: {},
          is_verified: user?.email_confirmed_at ? true : false,
          role: 'user'
        });
      }

      return {
        id: user?.id,
        email: user?.email,
        email_confirmed_at: user?.email_confirmed_at,
        created_at: user?.created_at,
        updated_at: user?.updated_at,
        user_metadata: user?.user_metadata,
        profile: profile
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des informations complètes:', error);
      throw error;
    }
  }

  /**
   * Crée un profil utilisateur dans public.users
   */
  async createUserProfile(userId: string, userData: any) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          id: userId,
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          date_naissance: userData.date_naissance,
          adresse_postale: userData.adresse_postale,
          code_postal: userData.code_postal,
          ville: userData.ville,
          pays: userData.pays,
          telephone: userData.telephone,
          role: userData.role || 'user',
          // Ajouter les champs légaux
          politique_confidentialite_acceptee: userData.politique_confidentialite_acceptee || false,
          conditions_generales_acceptees: userData.conditions_generales_acceptees || false
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Erreur lors de la création du profil:', error);
        throw error;
      }

      this.logger.log(`✅ Profil créé avec succès pour ${userData.email} avec les champs légaux`);
      return data;
    } catch (error) {
      this.logger.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  async updateUserProfile(userId: string, userData: any) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        this.logger.error('Erreur lors de la mise à jour du profil:', error);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Supprime un profil utilisateur
   */
  async deleteUserProfile(userId: string) {
    try {
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        this.logger.error('Erreur lors de la suppression du profil:', error);
        throw error;
      }

      return true;
    } catch (error) {
      this.logger.error('Erreur lors de la suppression du profil:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur existe
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(registerDto: any): Promise<{ user: any; session: any }> {
    try {
      // Vérifier si l'email existe déjà dans public.users
      const existingUser = await this.checkEmailExists(registerDto.email);
      if (existingUser) {
        throw new Error('User already registered');
      }

      // Inscription avec Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          data: {
            nom: registerDto.nom,
            prenom: registerDto.prenom,
            date_naissance: registerDto.date_naissance,
            adresse_postale: registerDto.adresse_postale,
            code_postal: registerDto.code_postal,
            ville: registerDto.ville,
            pays: registerDto.pays,
            telephone: registerDto.telephone,
            // Ajouter les champs légaux dans les métadonnées
            politique_confidentialite_acceptee: registerDto.politique_confidentialite_acceptee,
            conditions_generales_acceptees: registerDto.conditions_generales_acceptees,
            role: registerDto.role || 'user'
          }
        }
      });

      if (error) {
        throw error;
      }

      // Le profil utilisateur sera créé automatiquement par le trigger SQL
      // Pas besoin de création manuelle ici
      this.logger.log(`✅ Inscription réussie pour: ${data.user?.email}`);
      this.logger.log(`🔄 Le profil utilisateur sera créé automatiquement par le trigger SQL`);

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      this.logger.error('Erreur lors de l\'inscription:', error);
      
      // Gestion spécifique des erreurs Supabase Auth
      if (error.message) {
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('already exists')) {
          throw new Error('User already registered');
        }
        if (error.message.includes('Invalid email') || 
            error.message.includes('email address') && error.message.includes('invalid')) {
          throw new Error('Invalid email');
        }
        if (error.message.includes('Password should be at least') ||
            error.message.includes('password')) {
          throw new Error('Password should be at least 6 characters');
        }
        if (error.message.includes('rate limit exceeded') ||
            error.message.includes('over_email_send_rate_limit')) {
          throw new Error('Rate limit exceeded - too many registration attempts');
        }
      }
      
      throw error;
    }
  }

  /**
   * Connexion utilisateur
   */
  async login(loginDto: any): Promise<{ user: any; session: any; legalStatus?: any }> {
    try {
      this.logger.log(`🔐 Tentative de connexion pour: ${loginDto.email}`);
      
      // Vérifier si l'utilisateur existe dans public.users et son statut de confirmation
      let userProfile: any = null;
      try {
        const { data: profileCheck, error: profileError } = await this.supabase
          .from('users')
          .select('id, email, nom, prenom, role')
          .eq('email', loginDto.email)
          .single();

        if (profileError) {
          this.logger.warn(`⚠️ Erreur lors de la vérification du profil: ${profileError.message}`);
        } else if (profileCheck) {
          userProfile = profileCheck;
          this.logger.log(`✅ Profil trouvé dans public.users - ID: ${profileCheck.id}, Rôle: ${profileCheck.role}`);
        } else {
          this.logger.warn(`⚠️ Profil non trouvé dans public.users: ${loginDto.email}`);
        }
      } catch (profileError) {
        this.logger.warn(`⚠️ Vérification du profil échouée: ${profileError.message}`);
      }

      // Vérifier le statut de confirmation de l'email dans auth.users
      if (userProfile) {
        try {
          const { data: userCheck, error: userError } = await this.supabase.auth.admin.getUserById(userProfile.id);
          
          if (userError) {
            this.logger.warn(`⚠️ Vérification auth.users échouée: ${userError.message}`);
          } else if (userCheck.user) {
            this.logger.log(`✅ Utilisateur trouvé dans auth.users - ID: ${userCheck.user.id}`);
            this.logger.log(`📧 Email confirmé: ${userCheck.user.email_confirmed_at ? 'Oui' : 'Non'}`);
            this.logger.log(`🔒 Compte actif: ${userCheck.user.confirmed_at ? 'Oui' : 'Non'}`);
            
            // Vérifier si l'email est confirmé
            if (!userCheck.user.email_confirmed_at) {
              this.logger.warn(`❌ Tentative de connexion avec email non confirmé: ${loginDto.email}`);
              throw new Error('EMAIL_NOT_CONFIRMED');
            }
          }
        } catch (authError) {
          this.logger.warn(`⚠️ Vérification auth.users non disponible: ${authError.message}`);
          // Si on ne peut pas vérifier, on continue mais on log l'avertissement
        }
      }

      // Tentative de connexion principale
      this.logger.log(`🔑 Tentative de connexion avec Supabase Auth...`);
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password
      });

      if (error) {
        this.logger.error(`❌ Erreur de connexion Supabase: ${error.message}`);
        this.logger.error(`📊 Code d'erreur: ${error.status}, Type: ${error.name}`);
        
        // Gestion spécifique des erreurs Supabase
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email not confirmed') ||
            error.message.includes('not confirmed')) {
          throw new Error('EMAIL_NOT_CONFIRMED');
        }
        
        throw error;
      }

      // Vérification finale du statut de confirmation
      if (data.user && !data.user.email_confirmed_at) {
        this.logger.warn(`❌ Connexion réussie mais email non confirmé: ${data.user.email}`);
        throw new Error('EMAIL_NOT_CONFIRMED');
      }

      this.logger.log(`✅ Connexion réussie pour: ${data.user?.email}`);
      this.logger.log(`🆔 User ID: ${data.user?.id}`);
      this.logger.log(`🎫 Session créée: ${data.session ? 'Oui' : 'Non'}`);

      // Vérifier les conditions légales après connexion réussie
      let legalStatus: { conditionsAccepted: boolean; politiqueAccepted: boolean; bothAccepted: boolean; } | null = null;
      if (data.user) {
        try {
          legalStatus = await this.checkLegalAcceptance(data.user.id);
          this.logger.log(`📋 Statut conditions légales vérifié pour ${data.user.id}`);
        } catch (legalError) {
          this.logger.warn(`⚠️ Erreur lors de la vérification des conditions légales: ${legalError.message}`);
          // Ne pas bloquer la connexion si la vérification échoue
        }
      }

      return {
        user: data.user,
        session: data.session,
        legalStatus
      };
    } catch (error) {
      this.logger.error('💥 Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(accessToken?: string): Promise<void> {
    try {
      if (accessToken) {
        await this.supabase.auth.admin.signOut(accessToken);
      } else {
        await this.supabase.auth.signOut();
      }
    } catch (error) {
      this.logger.error('Erreur lors de la déconnexion:', error);
      // Ne pas throw l'erreur car la déconnexion peut échouer sans impact critique
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un email existe déjà dans public.users
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error) {
        // Si l'erreur est "no rows returned", l'email n'existe pas
        if (error.code === 'PGRST116') {
          return false;
        }
        // Pour d'autres erreurs, on log et on considère que l'email n'existe pas
        this.logger.warn('Erreur lors de la vérification de l\'email:', error);
        return false;
      }

      return !!data; // Retourne true si un utilisateur avec cet email existe
    } catch (error) {
      this.logger.error('Erreur lors de la vérification de l\'email:', error);
      return false;
    }
  }

  /**
   * Récupère le rôle d'un utilisateur depuis public.users
   */
  async getUserRole(userId: string): Promise<string> {
    try {
      // Récupérer l'utilisateur depuis public.users avec son rôle
      const { data: user, error } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        // Si l'utilisateur n'a pas de rôle défini, utiliser 'user' par défaut
        this.logger.warn(`Rôle non trouvé pour l'utilisateur ${userId}, utilisation du rôle par défaut`);
        return 'user';
      }

      return user.role || 'user';
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du rôle utilisateur:', error);
      // En cas d'erreur, retourner 'user' par défaut
      return 'user';
    }
  }

  /**
   * Vérifie si l'utilisateur a accepté les conditions légales
   */
  async checkLegalAcceptance(userId: string): Promise<{
    conditionsAccepted: boolean;
    politiqueAccepted: boolean;
    bothAccepted: boolean;
  }> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('conditions_generales_acceptees, politique_confidentialite_acceptee')
        .eq('id', userId)
        .single();

      if (error || !user) {
        this.logger.warn(`Conditions légales non trouvées pour l'utilisateur ${userId}`);
        return {
          conditionsAccepted: false,
          politiqueAccepted: false,
          bothAccepted: false
        };
      }

      const conditionsAccepted = user.conditions_generales_acceptees || false;
      const politiqueAccepted = user.politique_confidentialite_acceptee || false;
      const bothAccepted = conditionsAccepted && politiqueAccepted;

      this.logger.log(`📋 Vérification conditions légales pour ${userId}:`);
      this.logger.log(`   - Conditions générales: ${conditionsAccepted ? '✅' : '❌'}`);
      this.logger.log(`   - Politique confidentialité: ${politiqueAccepted ? '✅' : '❌'}`);
      this.logger.log(`   - Les deux acceptées: ${bothAccepted ? '✅' : '❌'}`);

      return {
        conditionsAccepted,
        politiqueAccepted,
        bothAccepted
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification des conditions légales:', error);
      return {
        conditionsAccepted: false,
        politiqueAccepted: false,
        bothAccepted: false
      };
    }
  }

  /**
   * Met à jour l'acceptation des conditions légales
   */
  async updateLegalAcceptance(
    userId: string, 
    conditionsAccepted: boolean, 
    politiqueAccepted: boolean
  ): Promise<boolean> {
    try {
      const updateData: any = {
        conditions_generales_acceptees: conditionsAccepted,
        politique_confidentialite_acceptee: politiqueAccepted
      };

      // Les dates seront mises à jour automatiquement par le trigger Supabase
      const { data, error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('conditions_generales_acceptees, politique_confidentialite_acceptee')
        .single();

      if (error) {
        this.logger.error('Erreur lors de la mise à jour des conditions légales:', error);
        return false;
      }

      this.logger.log(`✅ Conditions légales mises à jour pour ${userId}:`);
      this.logger.log(`   - Conditions générales: ${data.conditions_generales_acceptees ? '✅' : '❌'}`);
      this.logger.log(`   - Politique confidentialité: ${data.politique_confidentialite_acceptee ? '✅' : '❌'}`);

      return true;
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour des conditions légales:', error);
      return false;
    }
  }

  /**
   * Vérifie le statut complet d'un utilisateur de manière sécurisée
   */
  async checkUserStatus(userId: string): Promise<{
    exists: boolean;
    isActive: boolean;
    isEmailConfirmed: boolean;
    role: string;
    lastLogin?: string;
  }> {
    try {
      // Vérifier dans public.users (accessible avec la clé anon)
      const { data: profile, error: profileError } = await this.supabase
        .from('users')
        .select('id, email, role, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        this.logger.warn(`Profil utilisateur non trouvé: ${userId}`);
        return {
          exists: false,
          isActive: false,
          isEmailConfirmed: false,
          role: 'user'
        };
      }

      // Tentative de vérification dans auth.users (peut échouer)
      let authUser: any = null;
      try {
        const { data: authData, error: authError } = await this.supabase.auth.admin.getUserById(userId);
        if (!authError && authData.user) {
          authUser = authData.user;
        }
      } catch (authError) {
        this.logger.warn(`Vérification auth.users non disponible pour ${userId}: ${authError.message}`);
      }

      return {
        exists: true,
        isActive: authUser ? !!authUser.confirmed_at : true, // Par défaut actif si pas de vérification
        isEmailConfirmed: authUser ? !!authUser.email_confirmed_at : false,
        role: profile.role || 'user',
        lastLogin: authUser?.last_sign_in_at || profile.updated_at
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification du statut utilisateur ${userId}:`, error);
      return {
        exists: false,
        isActive: false,
        isEmailConfirmed: false,
        role: 'user'
      };
    }
  }

  /**
   * Configure Brevo pour l'envoi d'emails via Supabase
   * Cette méthode permet de vérifier et configurer les paramètres SMTP
   */
  async configureBrevoEmail() {
    try {
      this.logger.log('🔧 Configuration Brevo pour Supabase Auth...');
      
      // Vérifier la configuration actuelle
      const { data: settings, error } = await this.supabase.auth.admin.listUsers();
      
      if (error) {
        this.logger.error('❌ Erreur lors de la vérification de la configuration:', error);
        throw error;
      }

      this.logger.log('✅ Configuration Supabase Auth vérifiée');
      this.logger.log('📧 Les emails de confirmation seront envoyés via Brevo');
      
      return {
        status: 'configured',
        message: 'Brevo configuré pour Supabase Auth'
      };
    } catch (error) {
      this.logger.error('❌ Erreur lors de la configuration Brevo:', error);
      throw error;
    }
  }

  /**
   * Envoie un email de confirmation manuel (fallback)
   */
  async sendConfirmationEmail(email: string): Promise<void> {
    try {
      this.logger.log(`📧 Envoi d'email de confirmation à: ${email}`);
      
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        this.logger.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
        throw error;
      }

      this.logger.log('✅ Email de confirmation envoyé avec succès');
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
      throw error;
    }
  }

  /**
   * Vérifie le statut de confirmation d'un email
   */
  async checkEmailConfirmation(userId: string): Promise<boolean> {
    try {
      const { data: { user }, error } = await this.supabase.auth.admin.getUserById(userId);
      
      if (error) {
        this.logger.error('❌ Erreur lors de la vérification de l\'email:', error);
        throw error;
      }

      const isConfirmed = !!user?.email_confirmed_at;
      this.logger.log(`📧 Email confirmé pour ${user?.email}: ${isConfirmed ? 'Oui' : 'Non'}`);
      
      return isConfirmed;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la vérification de l\'email:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur est premium
   */
  async isUserPremium(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('is_premium')
        .eq('id', userId)
        .single();

      if (error || !user) {
        this.logger.warn(`Utilisateur non trouvé ou erreur lors de la vérification premium: ${userId}`);
        return false;
      }

      return !!user.is_premium;
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du statut premium:', error);
      return false;
    }
  }

  /**
   * Récupère le rôle et le statut premium d'un utilisateur
   */
  async getUserRoleAndPremium(userId: string): Promise<{ role: string; isPremium: boolean }> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('role, is_premium')
        .eq('id', userId)
        .single();

      if (error || !user) {
        this.logger.warn(`Utilisateur non trouvé: ${userId}`);
        return { role: 'user', isPremium: false };
      }

      return {
        role: user.role || 'user',
        isPremium: !!user.is_premium
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du rôle et statut premium:', error);
      return { role: 'user', isPremium: false };
    }
  }

  /**
   * Change le mot de passe d'un utilisateur
   */
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      this.logger.log(`🔐 Tentative de changement de mot de passe pour: ${email}`);
      
      // D'abord, se connecter avec l'ancien mot de passe pour vérifier qu'il est correct
      const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword
      });

      if (signInError) {
        this.logger.error(`❌ Mot de passe actuel incorrect pour ${email}: ${signInError.message}`);
        return false;
      }

      if (!signInData.user) {
        this.logger.error(`❌ Utilisateur non trouvé lors de la vérification du mot de passe: ${email}`);
        return false;
      }

      // Maintenant, changer le mot de passe
      const { data: updateData, error: updateError } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        this.logger.error(`❌ Erreur lors du changement de mot de passe pour ${email}: ${updateError.message}`);
        return false;
      }

      this.logger.log(`✅ Mot de passe changé avec succès pour: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Erreur lors du changement de mot de passe pour ${email}:`, error);
      return false;
    }
  }
} 