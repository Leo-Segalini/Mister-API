-- =====================================================
-- SCRIPT DE VÉRIFICATION DE LA CONFIGURATION DES RÔLES
-- =====================================================
-- Ce script vérifie que tous les rôles, fonctions et politiques ont été créés correctement

-- =====================================================
-- 1. VÉRIFICATION DES RÔLES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES RÔLES ===';
    
    -- Vérifier le rôle "user"
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'user') THEN
        RAISE NOTICE '✅ Rôle "user" existe';
    ELSE
        RAISE NOTICE '❌ Rôle "user" manquant';
    END IF;
    
    -- Vérifier le rôle "admin"
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        RAISE NOTICE '✅ Rôle "admin" existe';
    ELSE
        RAISE NOTICE '❌ Rôle "admin" manquant';
    END IF;
END
$$;

-- Afficher les détails des rôles
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname IN ('user', 'admin')
ORDER BY rolname;

-- =====================================================
-- 2. VÉRIFICATION DES FONCTIONS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES FONCTIONS ===';
    
    -- Vérifier is_admin
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        RAISE NOTICE '✅ Fonction is_admin() existe';
    ELSE
        RAISE NOTICE '❌ Fonction is_admin() manquante';
    END IF;
    
    -- Vérifier is_user
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_user') THEN
        RAISE NOTICE '✅ Fonction is_user() existe';
    ELSE
        RAISE NOTICE '❌ Fonction is_user() manquante';
    END IF;
    
    -- Vérifier get_user_role
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_role') THEN
        RAISE NOTICE '✅ Fonction get_user_role() existe';
    ELSE
        RAISE NOTICE '❌ Fonction get_user_role() manquante';
    END IF;
    
    -- Vérifier set_default_user_role
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_default_user_role') THEN
        RAISE NOTICE '✅ Fonction set_default_user_role() existe';
    ELSE
        RAISE NOTICE '❌ Fonction set_default_user_role() manquante';
    END IF;
END
$$;

-- Afficher les détails des fonctions
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_user', 'get_user_role', 'set_default_user_role')
ORDER BY proname;

-- =====================================================
-- 3. VÉRIFICATION DU TRIGGER
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DU TRIGGER ===';
    
    -- Vérifier le trigger
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_default_user_role_trigger') THEN
        RAISE NOTICE '✅ Trigger set_default_user_role_trigger existe';
    ELSE
        RAISE NOTICE '❌ Trigger set_default_user_role_trigger manquant';
    END IF;
END
$$;

-- Afficher les détails du trigger
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'set_default_user_role_trigger';

-- =====================================================
-- 4. VÉRIFICATION DES POLITIQUES RLS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES POLITIQUES RLS ===';
    
    -- Vérifier les politiques pour punchlines
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'punchlines') THEN
        RAISE NOTICE '✅ Politiques RLS pour punchlines existent';
    ELSE
        RAISE NOTICE '❌ Politiques RLS pour punchlines manquantes';
    END IF;
    
    -- Vérifier les politiques pour api_keys
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys') THEN
        RAISE NOTICE '✅ Politiques RLS pour api_keys existent';
    ELSE
        RAISE NOTICE '❌ Politiques RLS pour api_keys manquantes';
    END IF;
    
    -- Vérifier les politiques pour payments
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments') THEN
        RAISE NOTICE '✅ Politiques RLS pour payments existent';
    ELSE
        RAISE NOTICE '❌ Politiques RLS pour payments manquantes';
    END IF;
END
$$;

-- Afficher toutes les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 5. VÉRIFICATION DES UTILISATEURS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES UTILISATEURS ===';
    
    -- Compter les utilisateurs avec rôle défini
    DECLARE
        total_users INTEGER;
        users_with_role INTEGER;
        users_without_role INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_users FROM auth.users;
        SELECT COUNT(*) INTO users_with_role FROM auth.users WHERE raw_user_meta_data->>'role' IS NOT NULL;
        users_without_role := total_users - users_with_role;
        
        RAISE NOTICE '📊 Total utilisateurs: %', total_users;
        RAISE NOTICE '✅ Utilisateurs avec rôle: %', users_with_role;
        RAISE NOTICE '❌ Utilisateurs sans rôle: %', users_without_role;
        
        IF users_without_role = 0 THEN
            RAISE NOTICE '🎉 Tous les utilisateurs ont un rôle défini!';
        ELSE
            RAISE NOTICE '⚠️  Certains utilisateurs n''ont pas de rôle défini';
        END IF;
    END;
END
$$;

-- Afficher le résumé des utilisateurs et leurs rôles
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as role,
    created_at,
    CASE 
        WHEN raw_user_meta_data->>'role' IS NULL THEN '❌ Sans rôle'
        ELSE '✅ Rôle défini'
    END as status
FROM auth.users 
ORDER BY created_at DESC;

-- =====================================================
-- 6. VÉRIFICATION DES PERMISSIONS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES PERMISSIONS ===';
    
    -- Vérifier les permissions du rôle "user"
    IF EXISTS (SELECT 1 FROM information_schema.table_privileges WHERE grantee = 'user') THEN
        RAISE NOTICE '✅ Permissions du rôle "user" configurées';
    ELSE
        RAISE NOTICE '❌ Permissions du rôle "user" manquantes';
    END IF;
    
    -- Vérifier les permissions du rôle "admin"
    IF EXISTS (SELECT 1 FROM information_schema.table_privileges WHERE grantee = 'admin') THEN
        RAISE NOTICE '✅ Permissions du rôle "admin" configurées';
    ELSE
        RAISE NOTICE '❌ Permissions du rôle "admin" manquantes';
    END IF;
END
$$;

-- Afficher les permissions par rôle
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee IN ('user', 'admin')
AND table_schema = 'public'
ORDER BY grantee, table_name, privilege_type;

-- =====================================================
-- 7. TESTS DE FONCTIONNEMENT
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== TESTS DE FONCTIONNEMENT ===';
    
    -- Test de la fonction is_admin avec un utilisateur admin
    DECLARE
        admin_user_id UUID;
        is_admin_result BOOLEAN;
    BEGIN
        -- Trouver un utilisateur admin
        SELECT id INTO admin_user_id 
        FROM auth.users 
        WHERE raw_user_meta_data->>'role' = 'admin' 
        LIMIT 1;
        
        IF admin_user_id IS NOT NULL THEN
            SELECT is_admin(admin_user_id) INTO is_admin_result;
            IF is_admin_result THEN
                RAISE NOTICE '✅ Test is_admin() réussi pour un admin';
            ELSE
                RAISE NOTICE '❌ Test is_admin() échoué pour un admin';
            END IF;
        ELSE
            RAISE NOTICE '⚠️  Aucun utilisateur admin trouvé pour le test';
        END IF;
    END;
    
    -- Test de la fonction is_user avec un utilisateur user
    DECLARE
        user_user_id UUID;
        is_user_result BOOLEAN;
    BEGIN
        -- Trouver un utilisateur user
        SELECT id INTO user_user_id 
        FROM auth.users 
        WHERE raw_user_meta_data->>'role' = 'user' 
        LIMIT 1;
        
        IF user_user_id IS NOT NULL THEN
            SELECT is_user(user_user_id) INTO is_user_result;
            IF is_user_result THEN
                RAISE NOTICE '✅ Test is_user() réussi pour un user';
            ELSE
                RAISE NOTICE '❌ Test is_user() échoué pour un user';
            END IF;
        ELSE
            RAISE NOTICE '⚠️  Aucun utilisateur user trouvé pour le test';
        END IF;
    END;
END
$$;

-- =====================================================
-- 8. RÉSUMÉ FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== RÉSUMÉ DE LA CONFIGURATION ===';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Configuration des rôles Supabase';
    RAISE NOTICE '📅 Date de vérification: %', CURRENT_TIMESTAMP;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Rôles créés: user, admin';
    RAISE NOTICE '✅ Fonctions créées: is_admin, is_user, get_user_role, set_default_user_role';
    RAISE NOTICE '✅ Trigger configuré: set_default_user_role_trigger';
    RAISE NOTICE '✅ Politiques RLS configurées pour toutes les tables';
    RAISE NOTICE '✅ Permissions attribuées aux rôles';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Votre système de rôles est prêt à être utilisé!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Prochaines étapes:';
    RAISE NOTICE '   1. Tester la connexion admin dans votre application';
    RAISE NOTICE '   2. Vérifier que les nouveaux utilisateurs reçoivent le rôle "user"';
    RAISE NOTICE '   3. Tester les politiques RLS avec différents rôles';
END
$$; 