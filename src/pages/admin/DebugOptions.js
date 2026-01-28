import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const DebugOptions = () => {
  const [services, setServices] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Charger tous les services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .order('name')

    // Charger toutes les options
    const { data: optionsData } = await supabase
      .from('service_options')
      .select('*, service:services(name, slug)')
      .order('service_id')

    setServices(servicesData || [])
    setOptions(optionsData || [])
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Options - Vérification des Options par Service</h1>

      <h2>Tous les Services</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th>
            <th>Nom</th>
            <th>Slug</th>
            <th>Has Options?</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>{service.id}</td>
              <td>{service.name}</td>
              <td>{service.slug}</td>
              <td>{service.has_options ? '✅ Oui' : '❌ Non'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Toutes les Options Créées</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Option ID</th>
            <th>Service ID</th>
            <th>Nom du Service</th>
            <th>Nom de l'Option</th>
            <th>Type</th>
            <th>Requis?</th>
          </tr>
        </thead>
        <tbody>
          {options.map(option => (
            <tr key={option.id} style={{ background: option.service_id ? '#fff' : '#ffcccc' }}>
              <td>{option.id}</td>
              <td><strong>{option.service_id}</strong></td>
              <td>{option.service?.name || '⚠️ SERVICE INTROUVABLE'}</td>
              <td>{option.name}</td>
              <td>{option.type}</td>
              <td>{option.is_required ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {options.length === 0 && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          ⚠️ Aucune option trouvée dans la base de données!
        </p>
      )}
    </div>
  )
}

export default DebugOptions
