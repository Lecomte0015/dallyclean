-- Migration: Ajouter le champ address à la table bookings
-- Date: 2026-01-28

-- Ajouter la colonne pour stocker l'adresse complète
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS address TEXT;

-- Commentaire explicatif
COMMENT ON COLUMN bookings.address IS 'Adresse complète du lieu d''intervention';
