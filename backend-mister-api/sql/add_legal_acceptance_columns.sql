-- Script pour ajouter les colonnes d'acceptation légale à la table users
-- À exécuter si les colonnes n'existent pas déjà

-- Vérifier si les colonnes existent déjà
DO $$
BEGIN
    -- Ajouter la colonne conditions_generales_acceptees si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'conditions_generales_acceptees'
    ) THEN
        ALTER TABLE users ADD COLUMN conditions_generales_acceptees BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne conditions_generales_acceptees ajoutée';
    ELSE
        RAISE NOTICE 'Colonne conditions_generales_acceptees existe déjà';
    END IF;

    -- Ajouter la colonne date_acceptation_conditions si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'date_acceptation_conditions'
    ) THEN
        ALTER TABLE users ADD COLUMN date_acceptation_conditions TIMESTAMP;
        RAISE NOTICE 'Colonne date_acceptation_conditions ajoutée';
    ELSE
        RAISE NOTICE 'Colonne date_acceptation_conditions existe déjà';
    END IF;

    -- Ajouter la colonne politique_confidentialite_acceptee si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'politique_confidentialite_acceptee'
    ) THEN
        ALTER TABLE users ADD COLUMN politique_confidentialite_acceptee BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne politique_confidentialite_acceptee ajoutée';
    ELSE
        RAISE NOTICE 'Colonne politique_confidentialite_acceptee existe déjà';
    END IF;

    -- Ajouter la colonne date_acceptation_politique si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'date_acceptation_politique'
    ) THEN
        ALTER TABLE users ADD COLUMN date_acceptation_politique TIMESTAMP;
        RAISE NOTICE 'Colonne date_acceptation_politique ajoutée';
    ELSE
        RAISE NOTICE 'Colonne date_acceptation_politique existe déjà';
    END IF;

END $$;

-- Vérifier la structure de la table après modification
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
    'conditions_generales_acceptees',
    'date_acceptation_conditions',
    'politique_confidentialite_acceptee',
    'date_acceptation_politique'
)
ORDER BY column_name; 