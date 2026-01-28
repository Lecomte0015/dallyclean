import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Edit, Trash2, Package, X, Star } from 'lucide-react'
import '../admin/BookingsPage.css'

const PlansPage = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentPlan, setCurrentPlan] = useState({
    id: null,
    name: '',
    price_label: '',
    points: [''],
    popular: false
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Filter out empty points
    const filteredPoints = currentPlan.points.filter(point => point.trim() !== '')

    if (filteredPoints.length === 0) {
      alert('Veuillez ajouter au moins une caractéristique')
      return
    }

    try {
      const planData = {
        name: currentPlan.name,
        price_label: currentPlan.price_label,
        points: filteredPoints,
        popular: currentPlan.popular
      }

      if (editMode) {
        const { error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', currentPlan.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('plans')
          .insert([planData])

        if (error) throw error
      }

      loadPlans()
      closeModal()
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce forfait ?')) return

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPlans()
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openAddModal = () => {
    setCurrentPlan({ id: null, name: '', price_label: '', points: [''], popular: false })
    setEditMode(false)
    setShowModal(true)
  }

  const openEditModal = (plan) => {
    setCurrentPlan({
      ...plan,
      points: plan.points && plan.points.length > 0 ? plan.points : ['']
    })
    setEditMode(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentPlan({ id: null, name: '', price_label: '', points: [''], popular: false })
  }

  const addPoint = () => {
    setCurrentPlan({
      ...currentPlan,
      points: [...currentPlan.points, '']
    })
  }

  const removePoint = (index) => {
    const newPoints = currentPlan.points.filter((_, i) => i !== index)
    setCurrentPlan({
      ...currentPlan,
      points: newPoints.length > 0 ? newPoints : ['']
    })
  }

  const updatePoint = (index, value) => {
    const newPoints = [...currentPlan.points]
    newPoints[index] = value
    setCurrentPlan({
      ...currentPlan,
      points: newPoints
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des forfaits</h1>
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="bookings-page">
        <div className="admin-page-header">
          <div>
            <h1>Gestion des forfaits</h1>
            <p>{plans.length} forfait(s)</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter un forfait
          </button>
        </div>

        <div className="admin-card">
          {plans.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>Aucun forfait</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom du forfait</th>
                  <th>Prix</th>
                  <th>Caractéristiques</th>
                  <th>Populaire</th>
                  <th style={{width: '150px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td><strong>{plan.name}</strong></td>
                    <td>
                      <span style={{
                        color: 'var(--color-primary)',
                        fontWeight: 'var(--font-semibold)'
                      }}>
                        {plan.price_label}
                      </span>
                    </td>
                    <td>
                      <div style={{
                        maxWidth: '300px',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)'
                      }}>
                        {plan.points && plan.points.length > 0
                          ? `${plan.points.length} caractéristique(s)`
                          : 'Aucune'}
                      </div>
                    </td>
                    <td>
                      {plan.popular && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: 'rgba(251, 191, 36, 0.1)',
                          color: '#f59e0b',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-semibold)'
                        }}>
                          <Star size={14} fill="#f59e0b" />
                          Populaire
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-icon"
                          onClick={() => openEditModal(plan)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDelete(plan.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editMode ? 'Modifier le forfait' : 'Nouveau forfait'}</h2>
                <button onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="name">Nom du forfait *</label>
                    <input
                      id="name"
                      type="text"
                      value={currentPlan.name}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                      placeholder="Ex: Nettoyage Voiture"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price_label">Prix affiché *</label>
                    <input
                      id="price_label"
                      type="text"
                      value={currentPlan.price_label}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, price_label: e.target.value })}
                      placeholder="Ex: 39€ ou Sur devis"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Caractéristiques du forfait *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {currentPlan.points.map((point, index) => (
                        <div key={index} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => updatePoint(index, e.target.value)}
                            placeholder={`Caractéristique ${index + 1}`}
                            style={{ flex: 1 }}
                          />
                          {currentPlan.points.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePoint(index)}
                              style={{
                                padding: '8px 12px',
                                background: 'var(--bg-soft)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'var(--text-muted)'
                              }}
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPoint}
                        className="btn btn-outline"
                        style={{ alignSelf: 'flex-start' }}
                      >
                        <Plus size={18} />
                        Ajouter une caractéristique
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentPlan.popular}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, popular: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <span>Marquer comme populaire</span>
                      <Star size={16} fill={currentPlan.popular ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default PlansPage
