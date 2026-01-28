-- Migration: Service Layout Customization
-- Date: 2026-01-28
-- Description: Allow customizable section ordering for service detail pages

-- Create table for service sections layout
CREATE TABLE IF NOT EXISTS service_sections (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique section per service
  UNIQUE(service_id, section_type)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_sections_service_id ON service_sections(service_id);
CREATE INDEX IF NOT EXISTS idx_service_sections_order ON service_sections(service_id, display_order);

-- Add comments
COMMENT ON TABLE service_sections IS 'Stores the customizable layout configuration for service detail pages';
COMMENT ON COLUMN service_sections.service_id IS 'Reference to the service';
COMMENT ON COLUMN service_sections.section_type IS 'Type of section: description, image, options, price, actions';
COMMENT ON COLUMN service_sections.display_order IS 'Order in which the section appears (lower = first)';
COMMENT ON COLUMN service_sections.is_visible IS 'Whether the section is displayed';

-- Function to initialize default sections for a service
CREATE OR REPLACE FUNCTION initialize_service_sections(p_service_id BIGINT)
RETURNS VOID AS $$
BEGIN
  -- Insert default sections if they don't exist
  INSERT INTO service_sections (service_id, section_type, display_order, is_visible)
  VALUES
    (p_service_id, 'description', 1, true),
    (p_service_id, 'image', 2, true),
    (p_service_id, 'options', 3, true),
    (p_service_id, 'price', 4, true),
    (p_service_id, 'actions', 5, true)
  ON CONFLICT (service_id, section_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Initialize sections for all existing services
DO $$
DECLARE
  service_record RECORD;
BEGIN
  FOR service_record IN SELECT id FROM services
  LOOP
    PERFORM initialize_service_sections(service_record.id);
  END LOOP;
END $$;

-- Trigger to auto-initialize sections for new services
CREATE OR REPLACE FUNCTION auto_initialize_service_sections()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_service_sections(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_initialize_service_sections
AFTER INSERT ON services
FOR EACH ROW
EXECUTE FUNCTION auto_initialize_service_sections();

-- Success message
SELECT 'Service layout migration completed successfully!' AS status;
