-- =====================================================
-- SCRIPT DE CRÉATION DES RÔLES ET CONFIGURATION SUPABASE
-- =====================================================
-- Ce script crée les rôles "admin" et "user" avec leurs permissions
-- et configure l'attribution automatique du rôle "user" par défaut

-- =====================================================
-- 1. CRÉATION DU RÔLE "USER"
-- =====================================================

-- Créer le rôle "user" s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'user') THEN
        CREATE ROLE "user";
        RAISE NOTICE 'Rôle "user" créé avec succès';
    ELSE
        RAISE NOTICE 'Rôle "user" existe déjà';
    END IF;
END
$$;

-- =====================================================
-- 2. CRÉATION DU RÔLE "ADMIN" (si pas déjà fait)
-- =====================================================

-- Créer le rôle "admin" s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE "admin";
        RAISE NOTICE 'Rôle "admin" créé avec succès';
    ELSE
        RAISE NOTICE 'Rôle "admin" existe déjà';
    END IF;
END
$$;

-- =====================================================
-- 3. FONCTIONS POUR VÉRIFIER LES RÔLES
-- =====================================================

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a le rôle user
CREATE OR REPLACE FUNCTION is_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'user'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT raw_user_meta_data->>'role'
        FROM auth.users 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGER POUR ATTRIBUER LE RÔLE "USER" PAR DÉFAUT
-- =====================================================

-- Fonction trigger pour définir automatiquement le rôle "user"
CREATE OR REPLACE FUNCTION set_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Si aucun rôle n'est défini, attribuer "user" par défaut
    IF NEW.raw_user_meta_data IS NULL OR NEW.raw_user_meta_data->>'role' IS NULL THEN
        NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || '{"role": "user"}'::jsonb;
        RAISE NOTICE 'Rôle "user" attribué automatiquement à l''utilisateur %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table auth.users
DROP TRIGGER IF EXISTS set_default_user_role_trigger ON auth.users;
CREATE TRIGGER set_default_user_role_trigger
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION set_default_user_role();

-- =====================================================
-- 5. POLITIQUES RLS POUR LE RÔLE "USER"
-- =====================================================

-- Activer RLS sur les tables principales
ALTER TABLE punchlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pays ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques pour les punchlines (lecture publique, écriture pour les utilisateurs connectés)
DROP POLICY IF EXISTS "Punchlines are viewable by everyone" ON punchlines;
CREATE POLICY "Punchlines are viewable by everyone" ON punchlines
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create punchlines" ON punchlines;
CREATE POLICY "Users can create punchlines" ON punchlines
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own punchlines" ON punchlines;
CREATE POLICY "Users can update their own punchlines" ON punchlines
    FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour les animaux (lecture publique)
DROP POLICY IF EXISTS "Animals are viewable by everyone" ON animals;
CREATE POLICY "Animals are viewable by everyone" ON animals
    FOR SELECT USING (true);

-- Politiques pour les pays (lecture publique)
DROP POLICY IF EXISTS "Countries are viewable by everyone" ON pays;
CREATE POLICY "Countries are viewable by everyone" ON pays
    FOR SELECT USING (true);

-- Politiques pour les clés API (gestion par l'utilisateur propriétaire)
DROP POLICY IF EXISTS "Users can manage their own API keys" ON api_keys;
CREATE POLICY "Users can manage their own API keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les logs API (lecture pour l'utilisateur propriétaire)
DROP POLICY IF EXISTS "Users can view their own API logs" ON api_logs;
CREATE POLICY "Users can view their own API logs" ON api_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour les paiements (gestion par l'utilisateur propriétaire)
DROP POLICY IF EXISTS "Users can manage their own payments" ON payments;
CREATE POLICY "Users can manage their own payments" ON payments
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les abonnements newsletter (gestion par l'utilisateur propriétaire)
DROP POLICY IF EXISTS "Users can manage their own newsletter subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Users can manage their own newsletter subscriptions" ON newsletter_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. POLITIQUES RLS POUR LE RÔLE "ADMIN"
-- =====================================================

-- Politiques admin pour toutes les tables
DROP POLICY IF EXISTS "Admins have full access to punchlines" ON punchlines;
CREATE POLICY "Admins have full access to punchlines" ON punchlines
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to animals" ON animals;
CREATE POLICY "Admins have full access to animals" ON animals
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to countries" ON pays;
CREATE POLICY "Admins have full access to countries" ON pays
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to API keys" ON api_keys;
CREATE POLICY "Admins have full access to API keys" ON api_keys
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to API logs" ON api_logs;
CREATE POLICY "Admins have full access to API logs" ON api_logs
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;
CREATE POLICY "Admins have full access to payments" ON payments
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to newsletter subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Admins have full access to newsletter subscriptions" ON newsletter_subscriptions
    FOR ALL USING (is_admin());

-- =====================================================
-- 7. PERMISSIONS SUR LES RÔLES
-- =====================================================

-- Donner les permissions nécessaires au rôle "user"
GRANT USAGE ON SCHEMA public TO "user";
GRANT SELECT ON ALL TABLES IN SCHEMA public TO "user";
GRANT INSERT, UPDATE, DELETE ON punchlines TO "user";
GRANT INSERT, UPDATE, DELETE ON api_keys TO "user";
GRANT SELECT ON api_logs TO "user";
GRANT INSERT, UPDATE, DELETE ON payments TO "user";
GRANT INSERT, UPDATE, DELETE ON newsletter_subscriptions TO "user";

-- Donner les permissions nécessaires au rôle "admin"
GRANT USAGE ON SCHEMA public TO "admin";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "admin";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "admin";

-- =====================================================
-- 8. MISE À JOUR DES UTILISATEURS EXISTANTS
-- =====================================================

-- Mettre à jour les utilisateurs existants qui n'ont pas de rôle défini
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "user"}'::jsonb
WHERE raw_user_meta_data IS NULL OR raw_user_meta_data->>'role' IS NULL;

-- =====================================================
-- 9. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que les rôles ont été créés
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin 
FROM pg_roles 
WHERE rolname IN ('user', 'admin');

-- Vérifier que les fonctions ont été créées
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_user', 'get_user_role', 'set_default_user_role');

-- Vérifier que le trigger a été créé
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'set_default_user_role_trigger';

-- Afficher un résumé des utilisateurs et leurs rôles
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as role,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

RAISE NOTICE 'Configuration des rôles terminée avec succès!';
RAISE NOTICE 'Tous les nouveaux utilisateurs auront automatiquement le rôle "user"';
RAISE NOTICE 'Les utilisateurs existants sans rôle ont été mis à jour avec le rôle "user"'; 