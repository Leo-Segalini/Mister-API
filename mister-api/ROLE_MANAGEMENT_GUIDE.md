# Guide de Gestion des Rôles Utilisateur

## État Actuel de la Gestion des Rôles

### ❌ Limitations Actuelles

**1. Endpoint Profile Utilisateur**
- L'endpoint `PUT /api/v1/auth/profile` ne permet **PAS** de modifier le rôle
- Champs autorisés limités : `nom`, `prenom`, `telephone`, `date_naissance`, `adresse_postale`, `code_postal`, `ville`, `pays`
- Le champ `role` est **exclu** des mises à jour

**2. Aucun Endpoint Admin pour les Rôles**
- Pas d'endpoint `POST/PUT /api/v1/admin/users/:id/role`
- Pas d'endpoint pour lister tous les utilisateurs
- Pas d'endpoint pour modifier les rôles en tant qu'admin

**3. Interface Frontend Manquante**
- Pas de page `/admin/users` pour gérer les utilisateurs
- Pas de composants pour modifier les rôles
- Pas d'interface admin pour la gestion des utilisateurs

## Configuration Actuelle

### Backend - Endpoint Profile
```typescript
// backend-mister-api/src/controllers/auth.controller.ts
@Put('profile')
async updateProfile(@Body() updateProfileDto: any) {
  // Champs autorisés (role EXCLU)
  const allowedFields = [
    'nom', 'prenom', 'telephone', 'date_naissance', 
    'adresse_postale', 'code_postal', 'ville', 'pays'
  ];
  // Le rôle n'est PAS dans cette liste
}
```

### Service Supabase
```typescript
// backend-mister-api/src/services/supabase.service.ts
async updateUserProfile(userId: string, userData: any) {
  // Met à jour la table 'users' mais sans restrictions
  // Le rôle pourrait être modifié ici si autorisé
}
```

### Frontend - Vérification des Rôles
```typescript
// mister-api/hooks/useAuth.tsx
const isAdmin = user?.role === 'admin';

// mister-api/components/Header.tsx
const { user, signout, isAdmin } = useAuth();
```

## Recommandations pour Implémenter la Gestion des Rôles

### 1. Backend - Endpoints Admin

#### A. Endpoint pour Lister les Utilisateurs
```typescript
// backend-mister-api/src/controllers/admin.controller.ts
@Get('users')
@RequireAdmin()
@ApiOperation({ summary: 'Lister tous les utilisateurs (Admin uniquement)' })
async getAllUsers(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('role') role?: string,
): Promise<ApiResponse> {
  // Implémentation pour lister les utilisateurs
}
```

#### B. Endpoint pour Modifier le Rôle
```typescript
@Put('users/:userId/role')
@RequireAdmin()
@ApiOperation({ summary: 'Modifier le rôle d\'un utilisateur (Admin uniquement)' })
async updateUserRole(
  @Param('userId') userId: string,
  @Body() roleData: { role: 'user' | 'admin' },
  @Req() req: AuthenticatedRequest,
): Promise<ApiResponse> {
  // Vérifier que l'admin ne se retire pas ses propres droits
  if (userId === req.user?.id) {
    throw new BadRequestException('Un admin ne peut pas modifier son propre rôle');
  }
  
  // Mettre à jour le rôle
  const updatedUser = await this.supabaseService.updateUserRole(userId, roleData.role);
  
  return {
    success: true,
    message: 'Rôle utilisateur mis à jour avec succès',
    data: updatedUser
  };
}
```

#### C. Service Supabase - Méthode pour Modifier le Rôle
```typescript
// backend-mister-api/src/services/supabase.service.ts
async updateUserRole(userId: string, newRole: 'user' | 'admin'): Promise<any> {
  try {
    const { data, error } = await this.supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }

    return data;
  } catch (error) {
    this.logger.error('Erreur lors de la mise à jour du rôle:', error);
    throw error;
  }
}
```

### 2. Frontend - Interface Admin

#### A. Page de Gestion des Utilisateurs
```typescript
// mister-api/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api';

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const response = await apiService.getAdminUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await apiService.updateUserRole(userId, newRole);
      loadUsers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  if (!isAdmin) {
    return <div>Accès refusé - Rôle admin requis</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>
      
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid gap-4">
          {users.map((user: any) => (
            <div key={user.id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.email}</h3>
                  <p>Rôle actuel: {user.role}</p>
                </div>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'admin')}
                  className="border rounded px-2 py-1"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### B. Service API - Méthodes Admin
```typescript
// mister-api/lib/api.ts
async getAdminUsers(): Promise<any[]> {
  return this.request('/api/v1/admin/users');
}

async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<any> {
  return this.request(`/api/v1/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
}
```

### 3. Sécurité et Permissions

#### A. Vérifications de Sécurité
```typescript
// Vérifier que l'utilisateur est admin
if (!req.user?.role || req.user.role !== 'admin') {
  throw new UnauthorizedException('Rôle admin requis');
}

// Empêcher un admin de se retirer ses droits
if (userId === req.user?.id) {
  throw new BadRequestException('Un admin ne peut pas modifier son propre rôle');
}

// Vérifier que l'utilisateur cible existe
const targetUser = await this.supabaseService.getUserProfile(userId);
if (!targetUser) {
  throw new NotFoundException('Utilisateur non trouvé');
}
```

#### B. Audit Trail
```typescript
// Logger les modifications de rôles
this.logger.log(`🔐 Role change: ${req.user?.email} changed role of ${targetUser.email} from ${targetUser.role} to ${newRole}`);

// Stocker l'historique des modifications
await this.supabase
  .from('role_changes_log')
  .insert({
    admin_id: req.user?.id,
    user_id: userId,
    old_role: targetUser.role,
    new_role: newRole,
    changed_at: new Date().toISOString()
  });
```

## Plan d'Implémentation

### Phase 1 - Backend (Priorité Haute)
1. ✅ Créer l'endpoint `GET /api/v1/admin/users`
2. ✅ Créer l'endpoint `PUT /api/v1/admin/users/:userId/role`
3. ✅ Ajouter la méthode `updateUserRole` dans SupabaseService
4. ✅ Implémenter les vérifications de sécurité

### Phase 2 - Frontend (Priorité Moyenne)
1. ✅ Créer la page `/admin/users`
2. ✅ Ajouter les méthodes API dans `apiService`
3. ✅ Créer les composants de gestion des utilisateurs
4. ✅ Implémenter l'interface utilisateur

### Phase 3 - Sécurité (Priorité Haute)
1. ✅ Ajouter l'audit trail des modifications
2. ✅ Implémenter les notifications de changement de rôle
3. ✅ Ajouter la validation des permissions
4. ✅ Tester la sécurité complète

## Conclusion

**Actuellement, les utilisateurs NE PEUVENT PAS modifier leur rôle eux-mêmes.** 

Pour implémenter cette fonctionnalité, il faut :
1. Créer des endpoints admin dédiés
2. Développer une interface admin
3. Implémenter les vérifications de sécurité appropriées
4. Ajouter un système d'audit pour tracer les modifications

Cette fonctionnalité est importante pour la gestion administrative mais nécessite une implémentation soigneuse pour maintenir la sécurité du système. 