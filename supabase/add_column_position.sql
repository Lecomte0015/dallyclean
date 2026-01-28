-- Ajouter la colonne pour la position des sections
-- Date: 2026-01-28

-- Ajouter la colonne column_position
ALTER TABLE service_sections
ADD COLUMN IF NOT EXISTS column_position VARCHAR(20) DEFAULT 'full';

-- Mettre à jour les sections existantes avec une disposition par défaut
-- Image à gauche, reste à droite
UPDATE service_sections
SET column_position = CASE
  WHEN section_type = 'image' THEN 'left'
  WHEN section_type IN ('description', 'options', 'price', 'actions') THEN 'right'
  ELSE 'full'
END;

-- Ajouter un commentaire
COMMENT ON COLUMN service_sections.column_position IS 'Position de la section: full (pleine largeur), left (colonne gauche), right (colonne droite)';

SELECT 'Column position added successfully!' AS status;
