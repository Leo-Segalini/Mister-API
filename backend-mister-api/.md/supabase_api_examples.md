# Exemples d'utilisation de l'API Supabase

## Structure des données

### auth.users
- `id` : UUID (clé primaire)
- `email` : TEXT (unique)
- `encrypted_password` : TEXT
- `raw_user_meta_data` : JSONB (contient nom, prenom, role, etc.)

### public.users
- `id` : UUID (référence vers auth.users)
- `nom` : TEXT
- `prenom` : TEXT
- `date_naissance` : DATE
- `adresse_postale` : TEXT
- `code_postal` : TEXT
- `ville` : TEXT
- `pays` : TEXT
- `telephone` : TEXT
- `is_premium` : BOOLEAN
- `premium_expires_at` : TIMESTAMP

## 1. Création d'un utilisateur via l'API Supabase

### JavaScript/TypeScript

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

// Créer un utilisateur standard
const { data, error } = await supabase.auth.signUp({
  email: 'jean.dupont@example.com',
  password: 'motdepasse123',
  options: {
    data: {
      nom: 'Dupont',
      prenom: 'Jean',
      date_naissance: '1995-06-15',
      adresse_postale: '456 Rue de la Paix',
      code_postal: '69001',
      ville: 'Lyon',
      pays: 'France',
      telephone: '+33456789012',
      role: 'user'
    }
  }
})

if (error) {
  console.error('Erreur lors de l\'inscription:', error)
} else {
  console.log('Utilisateur créé avec succès:', data.user)
  // Le profil dans public.users sera automatiquement créé via le trigger
}
```

### Création d'un administrateur

```javascript
// Créer un administrateur
const { data, error } = await supabase.auth.signUp({
  email: 'admin@example.com',
  password: 'admin123',
  options: {
    data: {
      nom: 'Système',
      prenom: 'Admin',
      date_naissance: '1990-01-01',
      adresse_postale: '123 Admin Street',
      code_postal: '75001',
      ville: 'Paris',
      pays: 'France',
      telephone: '+33123456789',
      role: 'admin'
    }
  }
})
```

### Création d'un utilisateur premium

```javascript
// Créer un utilisateur premium
const { data, error } = await supabase.auth.signUp({
  email: 'premium@example.com',
  password: 'premium123',
  options: {
    data: {
      nom: 'Premium',
      prenom: 'Marie',
      date_naissance: '1988-12-25',
      adresse_postale: '789 Avenue Premium',
      code_postal: '13001',
      ville: 'Marseille',
      pays: 'France',
      telephone: '+33498765432',
      role: 'user'
    }
  }
})

// Après création, mettre à jour le statut premium
if (data.user) {
  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', data.user.id)
}
```

## 2. Connexion utilisateur

```javascript
// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'jean.dupont@example.com',
  password: 'motdepasse123'
})

if (error) {
  console.error('Erreur de connexion:', error)
} else {
  console.log('Utilisateur connecté:', data.user)
  console.log('Session:', data.session)
}
```

## 3. Récupération du profil utilisateur

```javascript
// Récupérer le profil complet
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  // Récupérer le profil depuis public.users
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Erreur lors de la récupération du profil:', error)
  } else {
    console.log('Profil utilisateur:', profile)
    console.log('Rôle:', user.user_metadata.role)
    console.log('Email:', user.email)
  }
}
```

## 4. Mise à jour du profil

```javascript
// Mettre à jour les métadonnées utilisateur
const { error } = await supabase.auth.updateUser({
  data: {
    nom: 'Nouveau Nom',
    prenom: 'Nouveau Prénom',
    telephone: '+33987654321'
  }
})

// Mettre à jour le profil dans public.users
const { error: profileError } = await supabase
  .from('users')
  .update({
    nom: 'Nouveau Nom',
    prenom: 'Nouveau Prénom',
    telephone: '+33987654321'
  })
  .eq('id', user.id)
```

## 5. Promotion en administrateur

```javascript
// Promouvoir un utilisateur en admin (nécessite des droits admin)
const { error } = await supabase.auth.admin.updateUserById(
  'user-uuid-here',
  {
    user_metadata: {
      role: 'admin'
    }
  }
)
```

## 6. Gestion des clés API

```javascript
// Créer une clé API
const { data, error } = await supabase
  .from('api_keys')
  .insert({
    user_id: user.id,
    table_name: 'punchlines',
    api_key: crypto.randomUUID(),
    name: 'Clé API Punchlines',
    description: 'Clé API pour accéder aux punchlines',
    type: 'free'
  })
  .select()

// Lister les clés API de l'utilisateur
const { data: apiKeys, error } = await supabase
  .from('api_keys')
  .select('*')
  .eq('user_id', user.id)
```

## 7. Vérification des rôles

```javascript
// Vérifier si l'utilisateur est admin
const isAdmin = user.user_metadata.role === 'admin'

// Vérifier si l'utilisateur est premium
const { data: profile } = await supabase
  .from('users')
  .select('is_premium, premium_expires_at')
  .eq('id', user.id)
  .single()

const isPremium = profile?.is_premium && new Date(profile.premium_expires_at) > new Date()
```

## 8. Exemple complet avec gestion d'erreurs

```javascript
class UserService {
  constructor(supabase) {
    this.supabase = supabase
  }

  async createUser(userData) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nom: userData.nom,
            prenom: userData.prenom,
            date_naissance: userData.date_naissance,
            adresse_postale: userData.adresse_postale,
            code_postal: userData.code_postal,
            ville: userData.ville,
            pays: userData.pays,
            telephone: userData.telephone,
            role: userData.role || 'user'
          }
        }
      })

      if (error) throw error

      // Créer des clés API par défaut
      if (data.user) {
        await this.createDefaultApiKeys(data.user.id, userData.role)
      }

      return data
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  async createDefaultApiKeys(userId, role) {
    const isPremium = role === 'admin' || role === 'premium'
    
    const apiKeys = [
      {
        user_id: userId,
        table_name: 'punchlines',
        api_key: crypto.randomUUID(),
        name: 'Clé API Punchlines',
        description: 'Clé API par défaut pour punchlines',
        type: isPremium ? 'premium' : 'free'
      }
    ]

    if (isPremium) {
      apiKeys.push(
        {
          user_id: userId,
          table_name: 'animaux',
          api_key: crypto.randomUUID(),
          name: 'Clé API Animaux',
          description: 'Clé API premium pour animaux',
          type: 'premium'
        },
        {
          user_id: userId,
          table_name: 'pays_du_monde',
          api_key: crypto.randomUUID(),
          name: 'Clé API Pays',
          description: 'Clé API premium pour pays',
          type: 'premium'
        }
      )
    }

    const { error } = await this.supabase
      .from('api_keys')
      .insert(apiKeys)

    if (error) {
      console.error('Erreur lors de la création des clés API:', error)
    }
  }

  async getUserProfile(userId) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updateUserRole(userId, newRole) {
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: newRole
      }
    })

    if (error) throw error
  }
}

// Utilisation
const userService = new UserService(supabase)

// Créer un utilisateur
const newUser = await userService.createUser({
  email: 'nouveau@example.com',
  password: 'motdepasse123',
  nom: 'Nouveau',
  prenom: 'Utilisateur',
  date_naissance: '1990-01-01',
  adresse_postale: '123 Rue Test',
  code_postal: '75001',
  ville: 'Paris',
  pays: 'France',
  telephone: '+33123456789',
  role: 'user'
})
```

## 9. Configuration dans le backend NestJS

Dans votre service Supabase, vous devrez adapter les méthodes pour utiliser la nouvelle structure :

```typescript
// Dans SupabaseService
async getUserRole(userId: string): Promise<string> {
  try {
    const { data: { user }, error } = await this.supabase.auth.admin.getUserById(userId);
    
    if (error || !user) {
      return 'user'; // Rôle par défaut
    }

    return user.user_metadata?.role || 'user';
  } catch (error) {
    this.logger.error('Erreur lors de la récupération du rôle utilisateur:', error);
    return 'user';
  }
}

async createUserProfile(userId: string, userData: any) {
  try {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        id: userId,
        nom: userData.nom,
        prenom: userData.prenom,
        date_naissance: userData.date_naissance,
        adresse_postale: userData.adresse_postale,
        code_postal: userData.code_postal,
        ville: userData.ville,
        pays: userData.pays,
        telephone: userData.telephone
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Erreur lors de la création du profil:', error);
      throw error;
    }

    return data;
  } catch (error) {
    this.logger.error('Erreur lors de la création du profil:', error);
    throw error;
  }
}
```

Cette structure respecte vos spécifications avec email et rôle uniquement dans `auth.users`, et la création automatique du profil via `raw_user_meta_data`. 