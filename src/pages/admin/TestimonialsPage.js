import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Edit, Trash2, MessageSquare, Star, Check, X } from 'lucide-react'
import '../admin/BookingsPage.css'

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentTestimonial, setCurrentTestimonial] = useState({
    id: null,
    author: '',
    role: '',
    rating: 5,
    text: '',
    photo_url: '',
    status: 'approved'
  })

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error loading testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editMode) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            author: currentTestimonial.author,
            role: currentTestimonial.role,
            rating: currentTestimonial.rating,
            text: currentTestimonial.text,
            status: currentTestimonial.status
          })
          .eq('id', currentTestimonial.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([{
            author: currentTestimonial.author,
            role: currentTestimonial.role,
            rating: currentTestimonial.rating,
            text: currentTestimonial.text,
            status: 'approved'
          }])

        if (error) throw error
      }

      loadTestimonials()
      closeModal()
    } catch (error) {
      console.error('Error saving testimonial:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce témoignage ?')) return

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadTestimonials()
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: 'approved' })
        .eq('id', id)

      if (error) throw error
      loadTestimonials()
    } catch (error) {
      console.error('Error approving testimonial:', error)
      alert('Erreur lors de l\'approbation')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Rejeter ce témoignage ?')) return

    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error
      loadTestimonials()
    } catch (error) {
      console.error('Error rejecting testimonial:', error)
      alert('Erreur lors du rejet')
    }
  }

  const openAddModal = () => {
    setCurrentTestimonial({ id: null, author: '', role: '', rating: 5, text: '', photo_url: '', status: 'approved' })
    setEditMode(false)
    setShowModal(true)
  }

  const openEditModal = (testimonial) => {
    setCurrentTestimonial(testimonial)
    setEditMode(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentTestimonial({ id: null, author: '', role: '', rating: 5, text: '', photo_url: '', status: 'approved' })
  }

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '4px', color: '#fbbf24' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#fbbf24' : 'none'}
            stroke={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'En attente', className: 'status-new' },
      'approved': { label: 'Approuvé', className: 'status-confirmed' },
      'rejected': { label: 'Rejeté', className: 'status-canceled' }
    }

    const config = statusConfig[status] || { label: status, className: 'status-new' }
    return <span className={`status-badge ${config.className}`}>{config.label}</span>
  }

  const filteredTestimonials = testimonials.filter(t => {
    if (statusFilter === 'all') return true
    return t.status === statusFilter
  })

  const pendingCount = testimonials.filter(t => t.status === 'pending').length
  const approvedCount = testimonials.filter(t => t.status === 'approved').length

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des témoignages</h1>
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
            <h1>Gestion des témoignages</h1>
            <p>{testimonials.length} témoignage(s) - {pendingCount} en attente</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter un témoignage
          </button>
        </div>

        <div className="filters-bar" style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('all')}
          >
            Tous ({testimonials.length})
          </button>
          <button
            className={`btn ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('pending')}
          >
            En attente ({pendingCount})
          </button>
          <button
            className={`btn ${statusFilter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approuvés ({approvedCount})
          </button>
        </div>

        <div className="admin-card">
          {filteredTestimonials.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} />
              <p>Aucun témoignage</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Auteur</th>
                  <th>Rôle</th>
                  <th>Note</th>
                  <th>Témoignage</th>
                  <th>Statut</th>
                  <th style={{width: '180px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id}>
                    <td>
                      {testimonial.photo_url ? (
                        <img
                          src={testimonial.photo_url}
                          alt={testimonial.author}
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: 'var(--bg-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          {testimonial.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td><strong>{testimonial.author}</strong></td>
                    <td>{testimonial.role}</td>
                    <td>{renderStars(testimonial.rating)}</td>
                    <td>
                      <div style={{
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {testimonial.text}
                      </div>
                    </td>
                    <td>{getStatusBadge(testimonial.status)}</td>
                    <td>
                      <div className="admin-actions" style={{ gap: 'var(--space-1)' }}>
                        {testimonial.status === 'pending' && (
                          <>
                            <button
                              className="admin-btn-icon"
                              onClick={() => handleApprove(testimonial.id)}
                              title="Approuver"
                              style={{ color: '#10b981' }}
                            >
                              <Check size={18} />
                            </button>
                            <button
                              className="admin-btn-icon"
                              onClick={() => handleReject(testimonial.id)}
                              title="Rejeter"
                              style={{ color: '#ef4444' }}
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          className="admin-btn-icon"
                          onClick={() => openEditModal(testimonial)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDelete(testimonial.id)}
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
                <h2>{editMode ? 'Modifier le témoignage' : 'Nouveau témoignage'}</h2>
                <button onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {currentTestimonial.photo_url && (
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                      <img
                        src={currentTestimonial.photo_url}
                        alt={currentTestimonial.author}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--border-light)'
                        }}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="author">Nom de l'auteur *</label>
                    <input
                      id="author"
                      type="text"
                      value={currentTestimonial.author}
                      onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, author: e.target.value })}
                      placeholder="Ex: Marie Dupont"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Rôle / Profession *</label>
                    <input
                      id="role"
                      type="text"
                      value={currentTestimonial.role}
                      onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, role: e.target.value })}
                      placeholder="Ex: Directrice d'entreprise"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rating">Note *</label>
                    <select
                      id="rating"
                      value={currentTestimonial.rating}
                      onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, rating: parseInt(e.target.value) })}
                      required
                    >
                      <option value={5}>5 étoiles</option>
                      <option value={4}>4 étoiles</option>
                      <option value={3}>3 étoiles</option>
                      <option value={2}>2 étoiles</option>
                      <option value={1}>1 étoile</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="text">Témoignage *</label>
                    <textarea
                      id="text"
                      value={currentTestimonial.text}
                      onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, text: e.target.value })}
                      placeholder="Écrivez le témoignage ici..."
                      rows={5}
                      required
                      style={{
                        resize: 'vertical',
                        minHeight: '100px'
                      }}
                    />
                  </div>

                  {editMode && (
                    <div className="form-group">
                      <label htmlFor="status">Statut *</label>
                      <select
                        id="status"
                        value={currentTestimonial.status || 'approved'}
                        onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, status: e.target.value })}
                        required
                      >
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvé</option>
                        <option value="rejected">Rejeté</option>
                      </select>
                    </div>
                  )}
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

export default TestimonialsPage
