-- =====================================================
-- TRIGGER OPTIMISÉ POUR CRÉATION AUTOMATIQUE DU PROFIL UTILISATEUR
-- =====================================================
-- Ce trigger crée automatiquement un profil dans public.users
-- quand un nouvel utilisateur s'inscrit via Supabase Auth
-- Version optimisée avec gestion d'erreurs robuste

-- =====================================================
-- 1. SUPPRESSION DES ANCIENS TRIGGERS ET FONCTIONS
-- =====================================================

-- Supprimer les anciens triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_optimized ON auth.users;

-- Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_new_user_simple();
DROP FUNCTION IF EXISTS handle_new_user_optimized();

-- =====================================================
-- 2. FONCTION TRIGGER SIMPLE
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    politique_accepted BOOLEAN;
    conditions_accepted BOOLEAN;
BEGIN
    -- Vérifier si le profil existe déjà (éviter les doublons)
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RAISE NOTICE '⚠️ Profil utilisateur déjà existant pour ID: %', NEW.id;
        RETURN NEW;
    END IF;

    -- Extraire le rôle avec valeur par défaut
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    
    -- Extraire et convertir les champs légaux
    politique_accepted := CASE 
        WHEN NEW.raw_user_meta_data->>'politique_confidentialite_acceptee' = 'true' THEN true
        WHEN NEW.raw_user_meta_data->>'politique_confidentialite_acceptee' = 'false' THEN false
        ELSE false
    END;
    
    conditions_accepted := CASE 
        WHEN NEW.raw_user_meta_data->>'conditions_generales_acceptees' = 'true' THEN true
        WHEN NEW.raw_user_meta_data->>'conditions_generales_acceptees' = 'false' THEN false
        ELSE false
    END;

    -- Insérer le profil utilisateur dans public.users
    INSERT INTO public.users (
        id,
        email,
        nom,
        prenom,
        date_naissance,
        adresse_postale,
        code_postal,
        ville,
        pays,
        telephone,
        role,
        politique_confidentialite_acceptee,
        conditions_generales_acceptees,
        date_acceptation_conditions,
        date_acceptation_politique,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nom', ''),
        COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'date_naissance' IS NOT NULL 
            AND NEW.raw_user_meta_data->>'date_naissance' != '' 
            THEN (NEW.raw_user_meta_data->>'date_naissance')::DATE
            ELSE NULL
        END,
        COALESCE(NEW.raw_user_meta_data->>'adresse_postale', NULL),
        COALESCE(NEW.raw_user_meta_data->>'code_postal', NULL),
        COALESCE(NEW.raw_user_meta_data->>'ville', NULL),
        COALESCE(NEW.raw_user_meta_data->>'pays', NULL),
        COALESCE(NEW.raw_user_meta_data->>'telephone', NULL),
        user_role,
        politique_accepted,
        conditions_accepted,
        -- Date d'acceptation des conditions (timestamp actuel si acceptées)
        CASE 
            WHEN conditions_accepted THEN NOW()
            ELSE NULL
        END,
        -- Date d'acceptation de la politique (timestamp actuel si acceptée)
        CASE 
            WHEN politique_accepted THEN NOW()
            ELSE NULL
        END,
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Profil utilisateur créé automatiquement pour: % (ID: %)', NEW.email, NEW.id;
    RAISE NOTICE '📋 Rôle: %, Politique: %, Conditions: %', 
        user_role, 
        politique_accepted, 
        conditions_accepted;
    RAISE NOTICE '📅 Dates d''acceptation: Conditions=%s, Politique=%s', 
        CASE WHEN conditions_accepted THEN NOW()::TEXT ELSE 'Non acceptées' END,
        CASE WHEN politique_accepted THEN NOW()::TEXT ELSE 'Non acceptée' END;

    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'inscription
        RAISE WARNING '❌ Erreur lors de la création du profil pour %: %', NEW.email, SQLERRM;
        RAISE WARNING '📋 Les métadonnées utilisateur: %', NEW.raw_user_meta_data;
        
        -- Retourner NEW pour ne pas bloquer l'inscription
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CRÉATION DU TRIGGER SIMPLE
-- =====================================================

-- Créer le trigger sur la table auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 4. FONCTION DE VÉRIFICATION ET RÉPARATION
-- =====================================================

-- Fonction pour vérifier et créer les profils manquants
CREATE OR REPLACE FUNCTION fix_missing_profiles()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    profile_created BOOLEAN,
    message TEXT
) AS $$
DECLARE
    auth_user RECORD;
    profile_exists BOOLEAN;
    politique_accepted BOOLEAN;
    conditions_accepted BOOLEAN;
BEGIN
    -- Parcourir tous les utilisateurs auth.users
    FOR auth_user IN 
        SELECT id, email, raw_user_meta_data 
        FROM auth.users 
        ORDER BY created_at
    LOOP
        -- Vérifier si le profil existe
        SELECT EXISTS(
            SELECT 1 FROM public.users WHERE id = auth_user.id
        ) INTO profile_exists;
        
        -- Si le profil n'existe pas, le créer
        IF NOT profile_exists THEN
            BEGIN
                -- Extraire et convertir les champs légaux
                politique_accepted := CASE 
                    WHEN auth_user.raw_user_meta_data->>'politique_confidentialite_acceptee' = 'true' THEN true
                    ELSE false
                END;
                
                conditions_accepted := CASE 
                    WHEN auth_user.raw_user_meta_data->>'conditions_generales_acceptees' = 'true' THEN true
                    ELSE false
                END;

                INSERT INTO public.users (
                    id,
                    email,
                    nom,
                    prenom,
                    date_naissance,
                    adresse_postale,
                    code_postal,
                    ville,
                    pays,
                    telephone,
                    role,
                    politique_confidentialite_acceptee,
                    conditions_generales_acceptees,
                    date_acceptation_conditions,
                    date_acceptation_politique,
                    created_at,
                    updated_at
                ) VALUES (
                    auth_user.id,
                    auth_user.email,
                    COALESCE(auth_user.raw_user_meta_data->>'nom', ''),
                    COALESCE(auth_user.raw_user_meta_data->>'prenom', ''),
                    CASE 
                        WHEN auth_user.raw_user_meta_data->>'date_naissance' IS NOT NULL 
                        AND auth_user.raw_user_meta_data->>'date_naissance' != '' 
                        THEN (auth_user.raw_user_meta_data->>'date_naissance')::DATE
                        ELSE NULL
                    END,
                    COALESCE(auth_user.raw_user_meta_data->>'adresse_postale', NULL),
                    COALESCE(auth_user.raw_user_meta_data->>'code_postal', NULL),
                    COALESCE(auth_user.raw_user_meta_data->>'ville', NULL),
                    COALESCE(auth_user.raw_user_meta_data->>'pays', NULL),
                    COALESCE(auth_user.raw_user_meta_data->>'telephone', NULL),
                    COALESCE(auth_user.raw_user_meta_data->>'role', 'user'),
                    politique_accepted,
                    conditions_accepted,
                    -- Date d'acceptation des conditions (timestamp actuel si acceptées)
                    CASE 
                        WHEN conditions_accepted THEN NOW()
                        ELSE NULL
                    END,
                    -- Date d'acceptation de la politique (timestamp actuel si acceptée)
                    CASE 
                        WHEN politique_accepted THEN NOW()
                        ELSE NULL
                    END,
                    NOW(),
                    NOW()
                );
                
                RETURN QUERY SELECT 
                    auth_user.id,
                    auth_user.email::TEXT,
                    true,
                    'Profil créé avec succès'::TEXT;
                    
            EXCEPTION
                WHEN OTHERS THEN
                    RETURN QUERY SELECT 
                        auth_user.id,
                        auth_user.email::TEXT,
                        false,
                        ('Erreur: ' || SQLERRM)::TEXT;
            END;
        ELSE
            RETURN QUERY SELECT 
                auth_user.id,
                auth_user.email::TEXT,
                false,
                'Profil déjà existant'::TEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. VÉRIFICATION ET TEST
-- =====================================================

-- Vérifier que la fonction a été créée
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Vérifier que le trigger a été créé
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Trigger de création automatique du profil utilisateur configuré avec succès!';
  RAISE NOTICE '📝 Les nouveaux utilisateurs auront automatiquement leur profil créé dans public.users';
  RAISE NOTICE '📋 Les champs légaux (politique_confidentialite_acceptee, conditions_generales_acceptees) seront inclus';
  RAISE NOTICE '📅 Les dates d''acceptation (date_acceptation_conditions, date_acceptation_politique) seront automatiquement remplies';
  RAISE NOTICE '🛡️ Gestion d''erreurs robuste - l''inscription ne sera pas bloquée en cas d''erreur de profil';
  RAISE NOTICE '🔧 Fonction fix_missing_profiles() disponible pour réparer les profils manquants';
END
$$; 