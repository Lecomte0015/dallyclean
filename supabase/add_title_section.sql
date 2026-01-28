-- Ajouter une section 'title' pour séparer le titre de la description
-- Date: 2026-01-28

-- Pour chaque service existant, créer une section 'title'
INSERT INTO service_sections (service_id, section_type, display_order, is_visible, column_position)
SELECT
  service_id,
  'title' as section_type,
  0 as display_order, -- Le titre sera en premier
  true as is_visible,
  'full' as column_position
FROM service_sections
WHERE section_type = 'description'
ON CONFLICT (service_id, section_type) DO NOTHING;

-- Mettre à jour l'ordre d'affichage de toutes les autres sections
UPDATE service_sections
SET display_order = display_order + 1
WHERE section_type != 'title';

-- Mettre à jour la fonction d'initialisation pour inclure le titre
CREATE OR REPLACE FUNCTION initialize_service_sections(p_service_id BIGINT)
RETURNS VOID AS $$
BEGIN
  -- Insert default sections if they don't exist
  INSERT INTO service_sections (service_id, section_type, display_order, is_visible, column_position)
  VALUES
    (p_service_id, 'title', 0, true, 'full'),
    (p_service_id, 'description', 1, true, 'right'),
    (p_service_id, 'image', 2, true, 'left'),
    (p_service_id, 'options', 3, true, 'right'),
    (p_service_id, 'price', 4, true, 'right'),
    (p_service_id, 'actions', 5, true, 'right')
  ON CONFLICT (service_id, section_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT 'Title section added successfully!' AS status;
