import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { ArrowUp, ArrowDown, Eye, EyeOff, Save } from 'lucide-react'
import './ServiceLayoutPage.css'

const SECTION_LABELS = {
  title: 'Titre de la page',
  description: 'Description du service',
  image: 'Image principale',
  options: 'Options configurables',
  price: 'Résumé des prix',
  actions: 'Boutons d\'action'
}

const POSITION_OPTIONS = {
  full: 'Pleine largeur',
  left: 'Colonne gauche',
  right: 'Colonne droite'
}

const ServiceLayoutPage = () => {
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    if (selectedService) {
      loadServiceSections(selectedService.id)
    }
  }, [selectedService])

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, slug')
        .order('name')

      if (error) throw error
      setServices(data || [])
      if (data && data.length > 0) {
        setSelectedService(data[0])
      }
    } catch (error) {
      console.error('Error loading services:', error)
      showMessage('Erreur lors du chargement des services', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadServiceSections = async (serviceId) => {
    try {
      const { data, error } = await supabase
        .from('service_sections')
        .select('*')
        .eq('service_id', serviceId)
        .order('display_order')

      if (error) throw error
      setSections(data || [])
    } catch (error) {
      console.error('Error loading sections:', error)
      showMessage('Erreur lors du chargement des sections', 'error')
    }
  }

  const moveSectionUp = (index) => {
    if (index === 0) return
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index - 1]
    newSections[index - 1] = temp

    // Update display_order
    newSections.forEach((section, idx) => {
      section.display_order = idx + 1
    })
    setSections(newSections)
  }

  const moveSectionDown = (index) => {
    if (index === sections.length - 1) return
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index + 1]
    newSections[index + 1] = temp

    // Update display_order
    newSections.forEach((section, idx) => {
      section.display_order = idx + 1
    })
    setSections(newSections)
  }

  const toggleVisibility = (index) => {
    const newSections = [...sections]
    newSections[index].is_visible = !newSections[index].is_visible
    setSections(newSections)
  }

  const handlePositionChange = (index, position) => {
    const newSections = [...sections]
    newSections[index].column_position = position
    setSections(newSections)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update all sections
      const updates = sections.map(section => ({
        id: section.id,
        display_order: section.display_order,
        is_visible: section.is_visible,
        column_position: section.column_position || 'full'
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('service_sections')
          .update({
            display_order: update.display_order,
            is_visible: update.is_visible,
            column_position: update.column_position,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id)

        if (error) throw error
      }

      showMessage('Configuration enregistrée avec succès!', 'success')
    } catch (error) {
      console.error('Error saving layout:', error)
      showMessage('Erreur lors de l\'enregistrement', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Configuration des Pages Produits</h1>
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="service-layout-page">
        <div className="admin-page-header">
          <h1>Configuration des Pages Produits</h1>
          <p>Personnalisez l'ordre et la visibilité des sections pour chaque service</p>
        </div>

        {message && (
          <div className={`layout-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="layout-container">
          {/* Service selector */}
          <div className="service-selector">
            <h2>Sélectionner un service</h2>
            <div className="service-list">
              {services.map(service => (
                <button
                  key={service.id}
                  className={`service-item ${selectedService?.id === service.id ? 'active' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section editor */}
          {selectedService && (
            <div className="section-editor">
              <div className="editor-header">
                <h2>Configuration: {selectedService.name}</h2>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  <Save size={18} />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>

              <div className="sections-list">
                {sections.map((section, index) => (
                  <div key={section.id} className="section-item">
                    <div className="section-controls">
                      <button
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                        className="btn-icon"
                        title="Monter"
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        onClick={() => moveSectionDown(index)}
                        disabled={index === sections.length - 1}
                        className="btn-icon"
                        title="Descendre"
                      >
                        <ArrowDown size={18} />
                      </button>
                    </div>

                    <div className="section-info">
                      <span className="section-order">{index + 1}</span>
                      <span className="section-label">
                        {SECTION_LABELS[section.section_type] || section.section_type}
                      </span>
                    </div>

                    <select
                      value={section.column_position || 'full'}
                      onChange={(e) => handlePositionChange(index, e.target.value)}
                      className="position-select"
                    >
                      <option value="full">Pleine largeur</option>
                      <option value="left">Colonne gauche</option>
                      <option value="right">Colonne droite</option>
                    </select>

                    <button
                      onClick={() => toggleVisibility(index)}
                      className={`btn-visibility ${section.is_visible ? 'visible' : 'hidden'}`}
                    >
                      {section.is_visible ? (
                        <>
                          <Eye size={18} />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={18} />
                          <span>Masqué</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="editor-footer">
                <p className="help-text">
                  💡 Utilisez les flèches pour changer l'ordre vertical. Sélectionnez la position (pleine largeur, gauche ou droite) pour créer une disposition en colonnes. Cliquez sur l'œil pour masquer/afficher une section.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default ServiceLayoutPage
