-- Migration: Ajouter les champs de prix et service_name à la table bookings
-- Date: 2026-01-28

-- Ajouter les colonnes pour stocker les informations de tarification
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_name TEXT;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2);

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2);

-- Commentaires explicatifs
COMMENT ON COLUMN bookings.service_name IS 'Nom du service réservé (copie pour historique)';
COMMENT ON COLUMN bookings.base_price IS 'Prix de base du service au moment de la réservation';
COMMENT ON COLUMN bookings.total_price IS 'Prix total avec options au moment de la réservation';
