import { siteConfig } from './config';
import type { 
  ApiResponse, 
  ApiError, 
  AuthCredentials, 
  RegisterData, 
  AuthResponse,
  User,
  ApiKey,
  Citation,
  Animal,
  Pays,
  QuotaInfo,
  ApiStats,
  ApiKeyUsageStats,
  CitationParams,
  AnimalParams,
  PaysParams,
  CreateCitationData,
  UpdateCitationData,
  CreateAnimalData,
  UpdateAnimalData,
  CreatePaysData,
  UpdatePaysData,
  Payment
} from '@/types';

// Configuration des cookies
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: {
    access: 60 * 60, // 1 heure
    refresh: 7 * 24 * 60 * 60 // 7 jours
  }
};

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mister-api.onrender.com';
    console.log('🚀 ApiService initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Méthode générique pour les requêtes API avec gestion des cookies
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('🔧 Request details:', {
      baseUrl: this.baseUrl,
      endpoint,
      constructedUrl: url,
      method: options.method || 'GET',
      hasBody: !!options.body,
      retryCount
    });
    
    // Récupérer le token depuis localStorage si disponible
    let accessToken = null;
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem('access_token');
      console.log('🔑 Token depuis localStorage:', accessToken ? 'Trouvé' : 'Non trouvé');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter les headers optionnels
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }
    
    // Ajouter le token dans le header Authorization si disponible
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('🔑 Token ajouté dans Authorization header');
    }
    
    const config: RequestInit = {
      headers,
      credentials: 'include', // Important pour les cookies
      ...options,
    };

    console.log(`🌐 Making API request to: ${url}`, {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? 'present' : 'none',
      retryCount,
      credentials: config.credentials,
      cookies: typeof document !== 'undefined' ? document.cookie : 'N/A'
    });

    try {
      const response = await fetch(url, config);
      console.log(`📡 Response status: ${response.status} for ${url}`);
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Vérifier si la réponse contient du JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log(`📦 Response data for ${url}:`, data);
      } else {
        // Si ce n'est pas du JSON, lire comme texte
        const textData = await response.text();
        console.log(`📦 Response text for ${url}:`, textData);
        data = { message: textData || 'Réponse non-JSON du serveur' };
      }

      if (!response.ok) {
        console.error(`❌ API Error for ${url}:`, {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        // Gestion spécifique des erreurs
        if (response.status === 401) {
          // Ne pas rediriger automatiquement si c'est une tentative de connexion
          const isLoginAttempt = endpoint.includes('/auth/login');
          
          if (!isLoginAttempt) {
            // Nettoyer les cookies côté client
            this.clearSessionCookies();
            
            // Rediriger vers la page de connexion seulement si ce n'est pas une tentative de connexion
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            throw new Error('Session expirée - Veuillez vous reconnecter');
          } else {
            // Pour les tentatives de connexion, laisser l'erreur être gérée par le composant
            throw new Error(data.message || 'Email ou mot de passe incorrect');
          }
        } else if (response.status === 403) {
          throw new Error('Accès refusé - Permissions insuffisantes');
        } else if (response.status === 404) {
          throw new Error('Ressource non trouvée');
        } else if (response.status === 429) {
          throw new Error('Limite de requêtes dépassée - Veuillez réessayer plus tard');
        } else if (response.status >= 500) {
          throw new Error('Erreur serveur - Veuillez réessayer plus tard');
        }
        
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`💥 Request failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Méthode pour définir les cookies de session
   */
  private setSessionCookies(response: Response): void {
    if (typeof window === 'undefined') return;

    // Les cookies sont automatiquement gérés par le navigateur
    // grâce à credentials: 'include' dans la requête
    console.log('🍪 Session cookies set automatically by browser');
  }

  /**
   * Méthode pour supprimer les cookies de session
   */
  private clearSessionCookies(): void {
    if (typeof window === 'undefined') return;

    console.log('🧹 Clearing all session cookies...');
    
    // Liste de tous les cookies d'authentification à supprimer
    const cookiesToClear = [
      'access_token',
      'user_id',
      'user_role',
      'supabase.auth.token',
      'sb-iqblthgenholebudyvcx-auth-token'
    ];

    // Supprimer chaque cookie avec différentes options pour s'assurer qu'ils sont bien supprimés
    cookiesToClear.forEach(cookieName => {
      // Supprimer avec path=/
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // Supprimer avec path=/ et domain=localhost
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
      // Supprimer sans path spécifique
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });

    // Vérifier que les cookies ont été supprimés
    const remainingCookies = document.cookie;
    console.log('🧹 Remaining cookies after cleanup:', remainingCookies);
    
    // Nettoyer aussi le localStorage et sessionStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-iqblthgenholebudyvcx-auth-token');
      localStorage.removeItem('access_token');
      console.log('🧹 LocalStorage cleared');
    }
    
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
      console.log('🧹 SessionStorage cleared');
    }
    
    console.log('🧹 Session cleanup complete');
  }

  // ===== AUTHENTIFICATION =====

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signup(userData: RegisterData): Promise<AuthResponse> {
    console.log('📝 Signup attempt with user data:', { email: userData.email });
    
    const response = await this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setSessionCookies(response as any);
    return response;
  }

  /**
   * Connexion utilisateur
   */
  async signin(credentials: AuthCredentials): Promise<AuthResponse> {
    console.log('🔐 Signin attempt with credentials:', { email: credentials.email });
    
    try {
      const response = await this.request<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      this.setSessionCookies(response as any);
      
      // Stocker le token dans localStorage pour l'accès cross-origin
      if (typeof window !== 'undefined' && response.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        console.log('🔐 Token stocké dans localStorage');
      }
      
      return response;
    } catch (error: any) {
      // Gestion spécifique de l'erreur email non confirmé
      if (error.message && error.message.includes('email n\'est pas encore confirmé')) {
        throw new Error('EMAIL_NOT_CONFIRMED');
      }
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async signout(): Promise<void> {
    console.log('🚪 Signout attempt');
    
    try {
      // Appeler l'endpoint de déconnexion du backend
      await this.request<void>('/api/v1/auth/logout', {
        method: 'POST',
      });
      console.log('🚪 Backend logout successful');
    } catch (error) {
      console.warn('🚪 Backend logout failed, but continuing with local cleanup:', error);
      // Continuer même si l'appel backend échoue
    } finally {
      // Toujours nettoyer les cookies et le stockage local
      this.clearSessionCookies();
      
      // Forcer la redirection vers la page de connexion
      if (typeof window !== 'undefined') {
        console.log('🚪 Redirecting to login page...');
        // Utiliser window.location.href pour forcer un rechargement complet
        window.location.href = '/login';
      }
    }
  }

  /**
   * Récupération du profil utilisateur
   */
  async getProfile(): Promise<User> {
    console.log('👤 Getting user profile');
    
    const response = await this.request<ApiResponse<User>>('/api/v1/auth/profile');
    return response.data;
  }

  /**
   * Mise à jour du profil utilisateur
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    console.log('✏️ Updating user profile');
    
    const response = await this.request<ApiResponse<User>>('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    return response.data;
  }

  /**
   * Renvoyer l'email de confirmation
   */
  async resendConfirmationEmail(email: string): Promise<void> {
    console.log('📧 Resending confirmation email for:', email);
    
    await this.request<void>('/api/v1/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Vérifier si l'utilisateur a des clés API
   */
  async hasApiKeys(): Promise<boolean> {
    try {
      const keys = await this.getApiKeys();
      return keys.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Créer une clé API par défaut pour un nouvel utilisateur
   */
  async createDefaultApiKey(): Promise<ApiKey> {
    console.log('🔑 Creating default API key for new user');
    
    return await this.createApiKey({
      name: 'Clé API par défaut',
      table_name: 'punchlines',
      type: 'free'
    });
  }

  // ===== GESTION DES CLÉS API =====

  /**
   * Créer une nouvelle clé API
   */
  async createApiKey(data: {
    name: string;
    table_name: string;
    type: 'free' | 'premium';
  }): Promise<ApiKey> {
    console.log('🔑 Creating API key:', data);
    
    const response = await this.request<ApiResponse<ApiKey>>('/api/v1/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  /**
   * Lister les clés API de l'utilisateur
   */
  async getApiKeys(): Promise<ApiKey[]> {
    console.log('📋 Getting API keys - Début de la requête');
    
    try {
      const response = await this.request<ApiResponse<{apiKeys: ApiKey[], total: number, page: number, limit: number, totalPages: number}>>('/api/v1/api-keys');
      console.log('📋 API Response reçue:', response);
      console.log('📋 Type de response.data:', typeof response.data);
      console.log('📋 Contenu de response.data:', response.data);
      
      // Extraire le tableau apiKeys de l'objet response.data
      const apiKeysArray = response.data?.apiKeys || [];
      
      if (Array.isArray(apiKeysArray)) {
        console.log('📋 Nombre de clés API trouvées:', apiKeysArray.length);
        apiKeysArray.forEach((key, index) => {
          console.log(`📋 Clé ${index + 1}:`, {
            id: key.id,
        name: key.name,
        type: key.type,
            table_name: key.table_name,
            is_active: key.is_active,
            created_at: key.created_at
          });
        });
      } else {
        console.log('📋 ⚠️ apiKeysArray n\'est pas un tableau:', apiKeysArray);
      }
      
      return apiKeysArray;
    } catch (error: any) {
      console.error('📋 ❌ Erreur lors de la récupération des clés API:', error);
      console.error('📋 Détails de l\'erreur:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    }
  }

  /**
   * Récupérer une clé API spécifique
   */
  async getApiKey(id: string): Promise<ApiKey> {
    console.log('🔍 Getting API key:', id);
    
    const response = await this.request<ApiResponse<ApiKey>>(`/api/v1/api-keys/${id}`);
    return response.data;
  }

  /**
   * Mettre à jour une clé API
   */
  async updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey> {
    console.log('✏️ Updating API key:', id);
    
    const response = await this.request<ApiResponse<ApiKey>>(`/api/v1/api-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  /**
   * Supprimer une clé API
   */
  async deleteApiKey(id: string): Promise<void> {
    console.log('🗑️ Deleting API key:', id);
    
    await this.request<void>(`/api/v1/api-keys/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Configurer la sécurité d'une clé API
   */
  async configureApiKeySecurity(id: string, securityConfig: any): Promise<ApiKey> {
    console.log('🔒 Configuring API key security:', id);
    
    const response = await this.request<ApiResponse<ApiKey>>(`/api/v1/api-keys/${id}/security`, {
      method: 'PUT',
      body: JSON.stringify(securityConfig),
    });
    
    return response.data;
  }

  /**
   * Forcer la rotation d'une clé API
   */
  async rotateApiKey(id: string): Promise<ApiKey> {
    console.log('🔄 Rotating API key:', id);
    
    const response = await this.request<ApiResponse<ApiKey>>(`/api/v1/api-keys/${id}/rotate`, {
      method: 'POST',
    });
    
    return response.data;
  }

  // ===== CITATIONS HISTORIQUES =====

  /**
   * Lister les citations historiques
   */
  async getCitations(params: CitationParams = {}): Promise<ApiResponse<Citation[]>> {
    console.log('📚 Getting citations with params:', params);
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `/api/v1/punchlines${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await this.request<ApiResponse<Citation[]>>(url);
  }

  /**
   * Récupérer une citation spécifique
   */
  async getCitation(id: string): Promise<Citation> {
    console.log('🔍 Getting citation:', id);
    
    const response = await this.request<ApiResponse<Citation>>(`/api/v1/punchlines/${id}`);
    return response.data;
  }

  /**
   * Récupérer une citation aléatoire
   */
  async getRandomCitation(theme?: string): Promise<Citation> {
    console.log('🎲 Getting random citation, theme:', theme);
    
    const url = theme ? `/api/v1/punchlines/random?theme=${theme}` : '/api/v1/punchlines/random';
    const response = await this.request<ApiResponse<Citation>>(url);
    return response.data;
  }

  // ===== ANIMAUX =====

  /**
   * Lister les animaux
   */
  async getAnimaux(params: AnimalParams = {}): Promise<ApiResponse<Animal[]>> {
    console.log('🐾 Getting animaux with params:', params);
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `/api/v1/animaux${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await this.request<ApiResponse<Animal[]>>(url);
    }

  /**
   * Récupérer un animal spécifique
   */
  async getAnimal(id: string): Promise<Animal> {
    console.log('🔍 Getting animal:', id);
    
    const response = await this.request<ApiResponse<Animal>>(`/api/v1/animaux/${id}`);
    return response.data;
  }

  /**
   * Récupérer un animal aléatoire
   */
  async getRandomAnimal(espece?: string): Promise<Animal> {
    console.log('🎲 Getting random animal, espece:', espece);
    
    const url = espece ? `/api/v1/animaux/random?espece=${espece}` : '/api/v1/animaux/random';
    const response = await this.request<ApiResponse<Animal>>(url);
    return response.data;
  }

  // ===== PAYS =====

  /**
   * Lister les pays
   */
  async getPays(params: PaysParams = {}): Promise<ApiResponse<Pays[]>> {
    console.log('🌍 Getting pays with params:', params);
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `/api/v1/pays${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await this.request<ApiResponse<Pays[]>>(url);
  }

  /**
   * Récupérer un pays spécifique
   */
  async getPaysById(id: string): Promise<Pays> {
    console.log('🔍 Getting pays:', id);
    
    const response = await this.request<ApiResponse<Pays>>(`/api/v1/pays/${id}`);
    return response.data;
  }

  /**
   * Lister les pays d'Europe
   */
  async getPaysEurope(): Promise<Pays[]> {
    console.log('🇪🇺 Getting European countries');
    
    const response = await this.request<ApiResponse<Pays[]>>('/api/v1/pays/europe');
    return response.data;
  }

  // ===== STATISTIQUES =====

  /**
   * Récupérer les statistiques d'utilisation d'une clé API
   */
  async getApiKeyStats(apiKeyId: string): Promise<ApiKeyUsageStats> {
    console.log('📊 Getting API key stats for:', apiKeyId);
    
    const response = await this.request<ApiResponse<ApiKeyUsageStats>>(`/api/v1/api-keys/${apiKeyId}/stats`);
    return response.data;
  }

  /**
   * Récupérer les statistiques d'utilisation
   */
  async getUsageStats(): Promise<QuotaInfo> {
    console.log('📊 Getting usage stats');
    
    const response = await this.request<ApiResponse<QuotaInfo>>('/api/v1/stats/usage');
    return response.data;
  }

  /**
   * Récupérer les statistiques globales
   */
  async getGlobalStats(): Promise<any> {
    console.log('📈 Getting global stats');
    
    const response = await this.request<ApiResponse<any>>('/api/v1/stats/global');
    return response.data;
  }

  // ===== ENDPOINTS ADMIN =====

  /**
   * Créer une citation (admin)
   */
  async adminCreateCitation(data: CreateCitationData): Promise<Citation> {
    console.log('👑 Admin creating citation');
    
    const response = await this.request<ApiResponse<Citation>>('/api/v1/admin/punchlines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  /**
   * Mettre à jour une citation (admin)
   */
  async adminUpdateCitation(id: string, data: UpdateCitationData): Promise<Citation> {
    console.log('👑 Admin updating citation:', id);
    
    const response = await this.request<ApiResponse<Citation>>(`/api/v1/admin/punchlines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  /**
   * Supprimer une citation (admin)
   */
  async adminDeleteCitation(id: string): Promise<void> {
    console.log('👑 Admin deleting citation:', id);
    
    await this.request<void>(`/api/v1/admin/punchlines/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Créer un animal (admin)
   */
  async adminCreateAnimal(data: CreateAnimalData): Promise<Animal> {
    console.log('👑 Admin creating animal');
    
    const response = await this.request<ApiResponse<Animal>>('/api/v1/admin/animaux', {
      method: 'POST',
      body: JSON.stringify(data),
      });
      
    return response.data;
  }

  /**
   * Mettre à jour un animal (admin)
   */
  async adminUpdateAnimal(id: string, data: UpdateAnimalData): Promise<Animal> {
    console.log('👑 Admin updating animal:', id);
    
    const response = await this.request<ApiResponse<Animal>>(`/api/v1/admin/animaux/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  /**
   * Supprimer un animal (admin)
   */
  async adminDeleteAnimal(id: string): Promise<void> {
    console.log('👑 Admin deleting animal:', id);
    
    await this.request<void>(`/api/v1/admin/animaux/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Créer un pays (admin)
   */
  async adminCreatePays(data: CreatePaysData): Promise<Pays> {
    console.log('👑 Admin creating pays');
    
    const response = await this.request<ApiResponse<Pays>>('/api/v1/admin/pays', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  /**
   * Mettre à jour un pays (admin)
   */
  async adminUpdatePays(id: string, data: UpdatePaysData): Promise<Pays> {
    console.log('👑 Admin updating pays:', id);
    
    const response = await this.request<ApiResponse<Pays>>(`/api/v1/admin/pays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  /**
   * Supprimer un pays (admin)
   */
  async adminDeletePays(id: string): Promise<void> {
    console.log('👑 Admin deleting pays:', id);
    
    await this.request<void>(`/api/v1/admin/pays/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== PAIEMENTS =====

  /**
   * Créer une session de paiement Stripe
   */
  async createCheckoutSession(priceId: string): Promise<{ url: string }> {
    console.log('💳 Creating checkout session for price:', priceId);
    console.log('🌐 Base URL:', this.baseUrl);
    console.log('🔗 Full URL:', `${this.baseUrl}/api/v1/payments/create-checkout-session`);
    
    const successUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://mister-api.vercel.app'}/dashboard?payment=success`;
    const cancelUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://mister-api.vercel.app'}/payment?payment=cancelled`;
    
    console.log('✅ Success URL:', successUrl);
    console.log('❌ Cancel URL:', cancelUrl);
    
    const requestBody = {
      priceId,
      successUrl,
      cancelUrl,
    };
    
    console.log('📦 Request body:', requestBody);
    
    const response = await this.request<ApiResponse<{ url: string }>>('/api/v1/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    console.log('✅ Checkout session created:', response);
    return response.data;
  }

  /**
   * Créer une session du portail client Stripe
   */
  async createPortalSession(): Promise<{ url: string }> {
    console.log('🏢 Creating portal session');
    
    const response = await this.request<ApiResponse<{ url: string }>>('/api/v1/payments/create-portal-session', {
      method: 'POST',
      body: JSON.stringify({ 
        returnUrl: `${window.location.origin}/dashboard`
      }),
    });
    
    return response.data;
  }

  /**
   * Récupérer les prix Stripe
   */
  async getPrices(): Promise<any[]> {
    console.log('💰 Getting prices');
    
    const response = await this.request<ApiResponse<any[]>>('/api/v1/payments/prices');
    return response.data;
  }
}

// Instance singleton du service API
export const apiService = new ApiService(); 