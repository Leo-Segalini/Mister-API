-- =====================================================
-- TRIGGER POUR CRÉATION AUTOMATIQUE DU PROFIL UTILISATEUR
-- =====================================================
-- Ce trigger crée automatiquement un profil dans public.users
-- quand un nouvel utilisateur s'inscrit via Supabase Auth

-- =====================================================
-- 1. FONCTION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'date_naissance', NULL),
    COALESCE(NEW.raw_user_meta_data->>'adresse_postale', NULL),
    COALESCE(NEW.raw_user_meta_data->>'code_postal', NULL),
    COALESCE(NEW.raw_user_meta_data->>'ville', NULL),
    COALESCE(NEW.raw_user_meta_data->>'pays', NULL),
    COALESCE(NEW.raw_user_meta_data->>'telephone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    -- Gérer les champs légaux avec conversion en boolean
    CASE 
      WHEN NEW.raw_user_meta_data->>'politique_confidentialite_acceptee' = 'true' THEN true
      WHEN NEW.raw_user_meta_data->>'politique_confidentialite_acceptee' = 'false' THEN false
      ELSE false
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'conditions_generales_acceptees' = 'true' THEN true
      WHEN NEW.raw_user_meta_data->>'conditions_generales_acceptees' = 'false' THEN false
      ELSE false
    END,
    NOW(),
    NOW()
  );

  RAISE NOTICE '✅ Profil utilisateur créé automatiquement pour: % (ID: %)', NEW.email, NEW.id;
  RAISE NOTICE '📋 Champs légaux: politique_confidentialite_acceptee=%, conditions_generales_acceptees=%', 
    NEW.raw_user_meta_data->>'politique_confidentialite_acceptee',
    NEW.raw_user_meta_data->>'conditions_generales_acceptees';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CRÉATION DU TRIGGER
-- =====================================================

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger sur la table auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 3. VÉRIFICATION
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
END
$$; 