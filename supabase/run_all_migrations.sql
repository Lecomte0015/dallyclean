-- Script pour exécuter toutes les migrations nécessaires
-- Date: 2026-01-28
-- À exécuter dans l'éditeur SQL de Supabase

-- Migration 1: Ajouter page_title aux services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS page_title TEXT;

COMMENT ON COLUMN services.page_title IS 'Titre personnalisé affiché sur la page produit (optionnel)';

-- Migration 2: Ajouter les champs de prix aux bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_name TEXT;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2);

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2);

COMMENT ON COLUMN bookings.service_name IS 'Nom du service réservé (copie pour historique)';
COMMENT ON COLUMN bookings.base_price IS 'Prix de base du service au moment de la réservation';
COMMENT ON COLUMN bookings.total_price IS 'Prix total avec options au moment de la réservation';

-- Migration 3: Ajouter le champ address aux bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS address TEXT;

COMMENT ON COLUMN bookings.address IS 'Adresse complète du lieu d''intervention';

-- Afficher un message de confirmation
SELECT 'Migrations exécutées avec succès!' AS status;
