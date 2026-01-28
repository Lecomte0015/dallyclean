import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react'
import './BookingsPage.css'

const BookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    // Filter bookings by search term
    if (searchTerm) {
      const filtered = bookings.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.phone && b.phone.includes(searchTerm))
      )
      setFilteredBookings(filtered)
    } else {
      setFilteredBookings(bookings)
    }
  }, [searchTerm, bookings])

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
      setFilteredBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh list
      loadBookings()
      setShowModal(false)
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const viewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'new': { label: 'Nouveau', className: 'status-new' },
      'confirmed': { label: 'Confirmé', className: 'status-confirmed' },
      'done': { label: 'Terminé', className: 'status-done' },
      'canceled': { label: 'Annulé', className: 'status-canceled' }
    }

    const config = statusConfig[status] || { label: status, className: 'status-default' }

    return (
      <span className={`status-badge ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des réservations</h1>
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
            <h1>Gestion des réservations</h1>
            <p>{bookings.length} réservation(s) au total</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="admin-card" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="bookings-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-outline">
              <Filter size={18} />
              Filtres
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="admin-card">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>Aucune réservation trouvée</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Date souhaitée</th>
                    <th>Reçu le</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div className="client-info">
                          <strong>{booking.name}</strong>
                          {booking.city && (
                            <span className="client-city">
                              <MapPin size={14} />
                              {booking.city}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div>{booking.email}</div>
                          {booking.phone && <div>{booking.phone}</div>}
                        </div>
                      </td>
                      <td>
                        {booking.date ? (
                          <div className="booking-schedule">
                            <div>{formatDate(booking.date)}</div>
                            {booking.time && (
                              <div className="time">{booking.time}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">Non spécifiée</span>
                        )}
                      </td>
                      <td>{formatDateTime(booking.created_at)}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-btn-icon"
                            onClick={() => viewDetails(booking)}
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="admin-btn-icon delete"
                            onClick={() => handleDelete(booking.id)}
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
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Détails de la réservation</h2>
                <button onClick={() => setShowModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h3>Informations client</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Nom complet</label>
                      <p>{selectedBooking.name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>
                        <Mail size={16} />
                        <a href={`mailto:${selectedBooking.email}`}>{selectedBooking.email}</a>
                      </p>
                    </div>
                    <div className="detail-item">
                      <label>Téléphone</label>
                      <p>
                        {selectedBooking.phone ? (
                          <>
                            <Phone size={16} />
                            <a href={`tel:${selectedBooking.phone}`}>{selectedBooking.phone}</a>
                          </>
                        ) : (
                          <span className="text-muted">Non renseigné</span>
                        )}
                      </p>
                    </div>
                    <div className="detail-item">
                      <label>Ville</label>
                      <p>
                        {selectedBooking.city ? (
                          <>
                            <MapPin size={16} />
                            {selectedBooking.city}
                          </>
                        ) : (
                          <span className="text-muted">Non renseignée</span>
                        )}
                      </p>
                    </div>
                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                      <label>Adresse complète</label>
                      <p>
                        {selectedBooking.address ? (
                          <>
                            <MapPin size={16} />
                            {selectedBooking.address}
                          </>
                        ) : (
                          <span className="text-muted">Non renseignée</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Détails de la réservation</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Date souhaitée</label>
                      <p>
                        <Calendar size={16} />
                        {selectedBooking.date ? formatDate(selectedBooking.date) : 'Non spécifiée'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <label>Heure souhaitée</label>
                      <p>
                        <Clock size={16} />
                        {selectedBooking.time || 'Non spécifiée'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <label>Reçu le</label>
                      <p>{formatDateTime(selectedBooking.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Service et Prix */}
                {(selectedBooking.service_name || selectedBooking.base_price || selectedBooking.total_price) && (
                  <div className="detail-section">
                    <h3>Service et tarification</h3>
                    <div className="detail-grid">
                      {selectedBooking.service_name && (
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                          <label>Service demandé</label>
                          <p><strong>{selectedBooking.service_name}</strong></p>
                        </div>
                      )}
                      {selectedBooking.base_price && (
                        <div className="detail-item">
                          <label>Prix de base</label>
                          <p>{parseFloat(selectedBooking.base_price).toFixed(2)}€</p>
                        </div>
                      )}
                      {selectedBooking.total_price && (
                        <div className="detail-item">
                          <label>Prix total</label>
                          <p style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', fontSize: 'var(--text-lg)' }}>
                            {parseFloat(selectedBooking.total_price).toFixed(2)}€
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Options sélectionnées */}
                {selectedBooking.selected_options && selectedBooking.selected_options.length > 0 && (
                  <div className="detail-section">
                    <h3>Options sélectionnées</h3>
                    <div className="options-selected-list">
                      {selectedBooking.selected_options.map((option, index) => (
                        <div key={index} className="selected-option-item">
                          <span className="option-name-label">{option.option_name}:</span>
                          <span className="option-choice-value">{option.choice_label}</span>
                          {option.price_modifier !== 0 && (
                            <span className={`option-modifier ${option.price_modifier > 0 ? 'positive' : 'negative'}`}>
                              {option.price_modifier > 0 ? '+' : ''}{option.price_modifier.toFixed(2)}€
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div className="detail-section">
                    <h3>Notes</h3>
                    <p className="notes">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => handleDelete(selectedBooking.id)}
                >
                  <Trash2 size={18} />
                  Supprimer
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default BookingsPage
