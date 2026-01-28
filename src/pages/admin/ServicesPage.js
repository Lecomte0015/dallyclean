import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Edit, Trash2, Briefcase, Upload, X, Settings } from 'lucide-react'
import '../admin/BookingsPage.css'

const ServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentService, setCurrentService] = useState({
    id: null,
    name: '',
    page_title: '',
    description: '',
    price: '',
    image_url: ''
  })
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande (max 5MB)')
      return
    }

    try {
      setUploading(true)

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `services/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path)

      setCurrentService({ ...currentService, image_url: publicUrl })
      setImagePreview(URL.createObjectURL(file))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setCurrentService({ ...currentService, image_url: '' })
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        name: currentService.name,
        page_title: currentService.page_title || null,
        description: currentService.description || null,
        price: currentService.price || null,
        image_url: currentService.image_url || null
      }

      if (editMode) {
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', currentService.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('services')
          .insert([payload])

        if (error) throw error
      }

      loadServices()
      closeModal()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Erreur lors de la sauvegarde: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openAddModal = () => {
    setCurrentService({
      id: null,
      name: '',
      page_title: '',
      description: '',
      price: '',
      image_url: ''
    })
    setImagePreview(null)
    setEditMode(false)
    setShowModal(true)
  }

  const openEditModal = (service) => {
    setCurrentService({
      id: service.id,
      name: service.name || '',
      page_title: service.page_title || '',
      description: service.description || '',
      price: service.price || '',
      image_url: service.image_url || ''
    })
    setImagePreview(service.image_url || null)
    setEditMode(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentService({
      id: null,
      name: '',
      page_title: '',
      description: '',
      price: '',
      image_url: ''
    })
    setImagePreview(null)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des services</h1>
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
            <h1>Gestion des services</h1>
            <p>{services.length} service(s)</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter un service
          </button>
        </div>

        <div className="admin-card">
          {services.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={48} />
              <p>Aucun service</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{width: '80px'}}>Image</th>
                  <th>Nom du service</th>
                  <th>Description</th>
                  <th style={{width: '120px'}}>Prix</th>
                  <th style={{width: '150px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            background: 'var(--bg-soft)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Briefcase size={20} style={{color: 'var(--text-muted)'}} />
                        </div>
                      )}
                    </td>
                    <td><strong>{service.name}</strong></td>
                    <td style={{maxWidth: '300px'}}>
                      {service.description ? (
                        <span style={{color: 'var(--text-secondary)'}}>{service.description}</span>
                      ) : (
                        <span style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>Aucune description</span>
                      )}
                    </td>
                    <td>
                      {service.price ? (
                        <span style={{fontWeight: '500'}}>{service.price}</span>
                      ) : (
                        <span style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          to={`/admin/services/${service.id}/options`}
                          className="admin-btn-icon"
                          title="Options & Prix"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Settings size={18} />
                        </Link>
                        <button
                          className="admin-btn-icon"
                          onClick={() => openEditModal(service)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDelete(service.id)}
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
                <h2>{editMode ? 'Modifier le service' : 'Nouveau service'}</h2>
                <button onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="name">Nom du service *</label>
                    <input
                      id="name"
                      type="text"
                      value={currentService.name}
                      onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                      placeholder="Ex: Nettoyage voiture"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="page_title">Titre de la page produit</label>
                    <input
                      id="page_title"
                      type="text"
                      value={currentService.page_title}
                      onChange={(e) => setCurrentService({ ...currentService, page_title: e.target.value })}
                      placeholder="Ex: Configurez votre nettoyage de voiture"
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)', display: 'block' }}>
                      Ce titre s'affichera en haut de la page produit. Si vide, un titre par défaut sera utilisé.
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={currentService.description}
                      onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                      placeholder="Décrivez le service..."
                      rows="4"
                      style={{resize: 'vertical'}}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Prix</label>
                    <input
                      id="price"
                      type="text"
                      value={currentService.price}
                      onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
                      placeholder="Ex: À partir de 50€"
                    />
                  </div>

                  <div className="form-group">
                    <label>Image</label>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
                      {imagePreview ? (
                        <div style={{position: 'relative', display: 'inline-block'}}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: '100%',
                              maxWidth: '300px',
                              height: '200px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'var(--bg-primary)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '300px',
                            height: '200px',
                            border: '2px dashed var(--border-color)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-2)',
                            background: 'var(--bg-soft)',
                            cursor: 'pointer'
                          }}
                          onClick={() => document.getElementById('image-upload').click()}
                        >
                          <Upload size={32} style={{color: 'var(--text-muted)'}} />
                          <p style={{color: 'var(--text-muted)', margin: 0}}>
                            Cliquez pour ajouter une image
                          </p>
                          <p style={{color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0}}>
                            JPG, PNG (max 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{display: 'none'}}
                      />
                      {!imagePreview && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => document.getElementById('image-upload').click()}
                          disabled={uploading}
                        >
                          <Upload size={18} />
                          {uploading ? 'Upload en cours...' : 'Choisir une image'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
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

export default ServicesPage
