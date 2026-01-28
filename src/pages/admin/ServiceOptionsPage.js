import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, ChevronLeft } from 'lucide-react'
import './BookingsPage.css'

const ServiceOptionsPage = () => {
  const { serviceId } = useParams()
  const [service, setService] = useState(null)
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingOption, setEditingOption] = useState(null)
  const [showNewOptionModal, setShowNewOptionModal] = useState(false)
  const [showNewChoiceModal, setShowNewChoiceModal] = useState(null)

  // Formulaire nouvelle option
  const [newOption, setNewOption] = useState({
    name: '',
    type: 'select',
    is_required: true
  })

  // Formulaire nouveau choix
  const [newChoice, setNewChoice] = useState({
    label: '',
    price_modifier: 0
  })

  useEffect(() => {
    loadService()
    loadOptions()
  }, [serviceId])

  const loadService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (error) throw error
      setService(data)
    } catch (error) {
      console.error('Error loading service:', error)
      alert('Erreur lors du chargement du service')
    }
  }

  const loadOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('service_options')
        .select(`
          *,
          choices:service_option_choices(*)
        `)
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true })

      if (error) throw error

      // Trier les choix par display_order
      const optionsWithSortedChoices = (data || []).map(option => ({
        ...option,
        choices: (option.choices || []).sort((a, b) => a.display_order - b.display_order)
      }))

      setOptions(optionsWithSortedChoices)
    } catch (error) {
      console.error('Error loading options:', error)
    } finally {
      setLoading(false)
    }
  }

  const createOption = async () => {
    if (!newOption.name.trim()) {
      alert('Le nom de l\'option est requis')
      return
    }

    try {
      const { error } = await supabase
        .from('service_options')
        .insert([{
          service_id: serviceId,
          name: newOption.name,
          type: newOption.type,
          is_required: newOption.is_required,
          display_order: options.length
        }])

      if (error) throw error

      // Activer les options pour ce service
      await supabase
        .from('services')
        .update({ has_options: true })
        .eq('id', serviceId)

      setNewOption({ name: '', type: 'select', is_required: true })
      setShowNewOptionModal(false)
      loadOptions()
      loadService()
    } catch (error) {
      console.error('Error creating option:', error)
      alert('Erreur lors de la création de l\'option')
    }
  }

  const deleteOption = async (optionId) => {
    if (!window.confirm('Supprimer cette option et tous ses choix ?')) return

    try {
      const { error } = await supabase
        .from('service_options')
        .delete()
        .eq('id', optionId)

      if (error) throw error
      loadOptions()
    } catch (error) {
      console.error('Error deleting option:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const createChoice = async (optionId) => {
    if (!newChoice.label.trim()) {
      alert('Le label du choix est requis')
      return
    }

    try {
      const option = options.find(o => o.id === optionId)
      const { error } = await supabase
        .from('service_option_choices')
        .insert([{
          option_id: optionId,
          label: newChoice.label,
          price_modifier: parseFloat(newChoice.price_modifier) || 0,
          display_order: option.choices?.length || 0
        }])

      if (error) throw error

      setNewChoice({ label: '', price_modifier: 0 })
      setShowNewChoiceModal(null)
      loadOptions()
    } catch (error) {
      console.error('Error creating choice:', error)
      alert('Erreur lors de la création du choix')
    }
  }

  const deleteChoice = async (choiceId) => {
    if (!window.confirm('Supprimer ce choix ?')) return

    try {
      const { error } = await supabase
        .from('service_option_choices')
        .delete()
        .eq('id', choiceId)

      if (error) throw error
      loadOptions()
    } catch (error) {
      console.error('Error deleting choice:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const updateServiceBasePrice = async (price) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ base_price: parseFloat(price) || 0 })
        .eq('id', serviceId)

      if (error) throw error
      loadService()
    } catch (error) {
      console.error('Error updating price:', error)
      alert('Erreur lors de la mise à jour du prix')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Options du service</h1>
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!service) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Service introuvable</h1>
          <Link to="/admin/services" className="btn btn-outline">
            <ChevronLeft size={18} />
            Retour aux services
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="bookings-page">
        <div className="admin-page-header">
          <div>
            <Link
              to="/admin/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)'
              }}
            >
              <ChevronLeft size={16} />
              Retour aux services
            </Link>
            <h1>Options : {service.title}</h1>
            <p>{options.length} option(s) configurée(s)</p>
          </div>
          <button
            onClick={() => setShowNewOptionModal(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Nouvelle option
          </button>
        </div>

        {/* Prix de base */}
        <div className="admin-card" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
              Prix de base du service
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <input
                type="number"
                step="0.01"
                value={service.base_price || 0}
                onChange={(e) => setService({ ...service, base_price: e.target.value })}
                onBlur={(e) => updateServiceBasePrice(e.target.value)}
                style={{
                  width: '150px',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)'
                }}
              />
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>€</span>
              <small style={{ color: 'var(--text-muted)' }}>
                Les options peuvent modifier ce prix
              </small>
            </div>
          </div>
        </div>

        {/* Liste des options */}
        {options.length === 0 ? (
          <div className="admin-card">
            <div className="empty-state">
              <Plus size={48} />
              <p>Aucune option configurée</p>
              <small style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                Créez des options (type de véhicule, surface, etc.) pour ce service
              </small>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {options.map((option) => (
              <div key={option.id} className="admin-card">
                <div style={{ padding: 'var(--space-4)' }}>
                  {/* En-tête de l'option */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-4)',
                    paddingBottom: 'var(--space-3)',
                    borderBottom: '2px solid var(--border-light)'
                  }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>
                        {option.name}
                      </h3>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                        <span>Type: {option.type}</span>
                        <span>•</span>
                        <span>{option.is_required ? 'Requis' : 'Optionnel'}</span>
                        <span>•</span>
                        <span>{option.choices?.length || 0} choix</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteOption(option.id)}
                      style={{
                        padding: 'var(--space-2)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Choix de l'option */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {option.choices?.map((choice) => (
                      <div
                        key={choice.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'var(--space-3)',
                          background: 'var(--bg-soft)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 'var(--font-medium)' }}>{choice.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: choice.price_modifier > 0 ? 'var(--success-soft)' : choice.price_modifier < 0 ? 'var(--error-soft)' : 'var(--bg-secondary)',
                            color: choice.price_modifier > 0 ? 'var(--success)' : choice.price_modifier < 0 ? '#ef4444' : 'var(--text-secondary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-semibold)'
                          }}>
                            {choice.price_modifier > 0 && '+'}{choice.price_modifier}€
                          </span>
                          <button
                            onClick={() => deleteChoice(choice.id)}
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Bouton ajouter un choix */}
                    <button
                      onClick={() => setShowNewChoiceModal(option.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3)',
                        background: 'transparent',
                        border: '2px dashed var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.color = 'var(--primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-default)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }}
                    >
                      <Plus size={16} />
                      Ajouter un choix
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal nouvelle option */}
        {showNewOptionModal && (
          <div className="modal-overlay" onClick={() => setShowNewOptionModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouvelle option</h2>
                <button onClick={() => setShowNewOptionModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Nom de l'option *</label>
                  <input
                    type="text"
                    value={newOption.name}
                    onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                    placeholder="Ex: Type de véhicule, Surface"
                  />
                </div>

                <div className="form-group">
                  <label>Type de sélection</label>
                  <select
                    value={newOption.type}
                    onChange={(e) => setNewOption({ ...newOption, type: e.target.value })}
                  >
                    <option value="select">Liste déroulante</option>
                    <option value="radio">Boutons radio</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <input
                      type="checkbox"
                      checked={newOption.is_required}
                      onChange={(e) => setNewOption({ ...newOption, is_required: e.target.checked })}
                    />
                    <span>Option requise</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowNewOptionModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={createOption}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal nouveau choix */}
        {showNewChoiceModal && (
          <div className="modal-overlay" onClick={() => setShowNewChoiceModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouveau choix</h2>
                <button onClick={() => setShowNewChoiceModal(null)}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Label *</label>
                  <input
                    type="text"
                    value={newChoice.label}
                    onChange={(e) => setNewChoice({ ...newChoice, label: e.target.value })}
                    placeholder="Ex: Berline, Citadine, Break"
                  />
                </div>

                <div className="form-group">
                  <label>Modification du prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newChoice.price_modifier}
                    onChange={(e) => setNewChoice({ ...newChoice, price_modifier: e.target.value })}
                    placeholder="Ex: 10, -5, 0"
                  />
                  <small style={{ display: 'block', marginTop: 'var(--space-1)', color: 'var(--text-muted)' }}>
                    Montant ajouté (+) ou soustrait (-) au prix de base
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowNewChoiceModal(null)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => createChoice(showNewChoiceModal)}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default ServiceOptionsPage
