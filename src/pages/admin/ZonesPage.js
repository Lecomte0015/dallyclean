import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'
import '../admin/BookingsPage.css'

const ZonesPage = () => {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentZone, setCurrentZone] = useState({
    id: null,
    name: '',
    description: ''
  })

  useEffect(() => {
    loadZones()
  }, [])

  const loadZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setZones(data || [])
    } catch (error) {
      console.error('Error loading zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        name: currentZone.name,
        description: currentZone.description || null
      }

      if (editMode) {
        const { error } = await supabase
          .from('zones')
          .update(payload)
          .eq('id', currentZone.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('zones')
          .insert([payload])

        if (error) throw error
      }

      loadZones()
      closeModal()
    } catch (error) {
      console.error('Error saving zone:', error)
      alert('Erreur lors de la sauvegarde: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette zone ?')) return

    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadZones()
    } catch (error) {
      console.error('Error deleting zone:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openAddModal = () => {
    setCurrentZone({ id: null, name: '', description: '' })
    setEditMode(false)
    setShowModal(true)
  }

  const openEditModal = (zone) => {
    setCurrentZone({
      id: zone.id,
      name: zone.name || '',
      description: zone.description || ''
    })
    setEditMode(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentZone({ id: null, name: '', description: '' })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des zones</h1>
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
            <h1>Gestion des zones</h1>
            <p>{zones.length} zone(s)</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter une zone
          </button>
        </div>

        <div className="admin-card">
          {zones.length === 0 ? (
            <div className="empty-state">
              <MapPin size={48} />
              <p>Aucune zone</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom de la zone</th>
                  <th>Description</th>
                  <th style={{width: '150px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td><strong>{zone.name}</strong></td>
                    <td style={{maxWidth: '400px'}}>
                      {zone.description ? (
                        <span style={{color: 'var(--text-secondary)'}}>{zone.description}</span>
                      ) : (
                        <span style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>Aucune description</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-icon"
                          onClick={() => openEditModal(zone)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDelete(zone.id)}
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
                <h2>{editMode ? 'Modifier la zone' : 'Nouvelle zone'}</h2>
                <button onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="name">Nom de la zone *</label>
                    <input
                      id="name"
                      type="text"
                      value={currentZone.name}
                      onChange={(e) => setCurrentZone({ ...currentZone, name: e.target.value })}
                      placeholder="Ex: Lausanne et environs"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={currentZone.description}
                      onChange={(e) => setCurrentZone({ ...currentZone, description: e.target.value })}
                      placeholder="Décrivez la zone géographique..."
                      rows="4"
                      style={{resize: 'vertical'}}
                    />
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

export default ZonesPage
