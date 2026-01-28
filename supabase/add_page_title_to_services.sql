-- Migration: Ajouter la colonne page_title à la table services
-- Date: 2026-01-28

-- Ajouter la colonne page_title pour permettre de personnaliser le titre des pages produit
ALTER TABLE services
ADD COLUMN IF NOT EXISTS page_title TEXT;

-- Commentaire explicatif
COMMENT ON COLUMN services.page_title IS 'Titre personnalisé affiché sur la page produit (optionnel)';
