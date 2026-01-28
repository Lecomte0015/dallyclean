-- Vérifier tous les services et leurs options
SELECT 
  s.id as service_id,
  s.name as service_name,
  s.slug as service_slug,
  COUNT(so.id) as nombre_options
FROM services s
LEFT JOIN service_options so ON s.id = so.service_id
GROUP BY s.id, s.name, s.slug
ORDER BY s.name;

-- Vérifier en détail les options créées
SELECT 
  s.name as service_name,
  so.id as option_id,
  so.name as option_name,
  so.service_id
FROM service_options so
JOIN services s ON so.service_id = s.id
ORDER BY s.name, so.display_order;
