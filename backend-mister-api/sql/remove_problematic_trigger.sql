-- =====================================================
-- SUPPRESSION DU TRIGGER PROBLÉMATIQUE
-- =====================================================
-- Ce script supprime le trigger qui cause des problèmes
-- et permet la création manuelle des profils utilisateurs

-- =====================================================
-- 1. SUPPRIMER LE TRIGGER ET LA FONCTION
-- =====================================================

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- Supprimer les fonctions s'il existent
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_new_user_simple();

-- =====================================================
-- 2. VÉRIFICATION
-- =====================================================

-- Vérifier qu'aucun trigger ne reste
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname LIKE '%auth_user_created%';

-- Vérifier qu'aucune fonction ne reste
SELECT 
  proname as function_name
FROM pg_proc 
WHERE proname LIKE '%handle_new_user%';

-- =====================================================
-- 3. MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 Trigger problématique supprimé avec succès!';
  RAISE NOTICE '📝 Les profils utilisateurs seront maintenant créés manuellement';
  RAISE NOTICE '✅ Plus d''erreur "Database error saving new user"';
  RAISE NOTICE '🧪 Testez maintenant l''inscription d''un nouvel utilisateur';
END
$$; 