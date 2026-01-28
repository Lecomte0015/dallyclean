import React, { useState, useEffect } from 'react'
import './BookingForm.css'
import localServices from '../../assets/services'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const BookingForm = ({ bookingData }) => {
  const [form, setForm] = useState({name:'',email:'',phone:'',service:'',date:'',time:'',notes:'',city:'',address:''})
  const location = useLocation()
  const [selectedServiceData, setSelectedServiceData] = useState(bookingData || null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const city = params.get('city')
    if (city) {
      setForm(prev => ({...prev, city, notes: prev.notes || `Intervention à ${city}`}))
    }
  }, [location.search])

  // Pré-remplir le service si bookingData est fourni
  useEffect(() => {
    if (bookingData && bookingData.service_name) {
      setForm(prev => ({
        ...prev,
        service: bookingData.service_name
      }))
      setSelectedServiceData(bookingData)
    }
  }, [bookingData])

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [serviceOptions, setServiceOptions] = useState(localServices || [])

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value})
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error: err } = await supabase
          .from('services')
          .select('id, name')
          .order('name', { ascending: true })
        if (err) throw err
        if (data && data.length) {
          const normalized = data.map((s) => ({ id: s.id, name: s.name }))
          setServiceOptions(normalized)
        }
      } catch (e) {
        // fallback silently to localServices
        setServiceOptions(localServices || [])
      }
    }
    loadServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      let enrichedNotes = form.service ? `Service demandé: ${form.service}` : ''

      // Ajouter les détails des options sélectionnées dans les notes
      if (selectedServiceData && selectedServiceData.selected_options) {
        const optionsText = selectedServiceData.selected_options
          .map(opt => `${opt.option_name}: ${opt.choice_label}`)
          .join(' | ')
        enrichedNotes += optionsText ? ` | Options: ${optionsText}` : ''
      }

      // Ajouter les notes du formulaire
      if (form.notes) {
        enrichedNotes = `${enrichedNotes} | ${form.notes}`
      }

      const selected = serviceOptions.find(s => s.name === form.service)

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        service_id: selectedServiceData?.service_id || (selected ? selected.id : null),
        service_name: selectedServiceData?.service_name || form.service || null,
        base_price: selectedServiceData?.base_price || null,
        total_price: selectedServiceData?.total_price || null,
        city: form.city || null,
        address: form.address || null,
        date: form.date || null,
        time: form.time || null,
        notes: enrichedNotes || null,
        selected_options: selectedServiceData?.selected_options || []
        // status sera défini par défaut dans la base de données
      }

      // Insérer directement dans la table bookings
      const { error: insertError } = await supabase
        .from('bookings')
        .insert([payload])

      if (insertError) throw insertError

      setSubmitted(true)
      // Réinitialiser le formulaire
      setForm({name:'',email:'',phone:'',service:'',date:'',time:'',notes:'',city:'',address:''})
      setSelectedServiceData(null)
    } catch (err) {
      console.error('Booking error:', err)
      setError(err.message || 'Une erreur est survenue. Merci de réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if(submitted) return (
    <div className="booking-page">
      <div className="container section">
        <div className="booking-confirmation card">
          <div className="confirmation-icon">✓</div>
          <h2>Demande envoyée avec succès !</h2>
          <p>Merci <strong>{form.name}</strong>, nous avons bien reçu votre demande de rendez-vous.</p>
          <p>Nous vous contacterons dans les plus brefs délais pour confirmer votre intervention.</p>
          <a href="/" className="btn btn-primary">Retour à l'accueil</a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="booking-page">
      <section className="booking-hero section-sm bg-soft">
        <div className="container">
          <div className="booking-hero-content">
            <h1>Réserver un service</h1>
            <p className="text-secondary">Remplissez le formulaire ci-dessous pour prendre rendez-vous</p>
          </div>
        </div>
      </section>

      <section className="booking-form-section section">
        <div className="container">
          <form className="booking-form card" onSubmit={handleSubmit} aria-busy={submitting}>
            {error && (
              <div className="alert alert-error" role="alert">
                <strong>Erreur :</strong> {error}
              </div>
            )}

            <div className="form-section">
              <h3>Informations personnelles</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Nom complet <span className="required">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre.email@exemple.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    Téléphone <span className="required">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+41 XX XXX XX XX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">
                    Ville
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Genève, Lausanne..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Adresse complète <span className="required">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Rue, numéro, code postal, ville"
                  required
                />
                <small style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)', display: 'block' }}>
                  Exemple: 25 Rue de la Gare, 1201 Genève
                </small>
              </div>
            </div>

            <div className="form-section">
              <h3>Détails du service</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service">
                    Service souhaité <span className="required">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionnez un service</option>
                    {serviceOptions.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Résumé des options sélectionnées */}
              {selectedServiceData && selectedServiceData.selected_options && selectedServiceData.selected_options.length > 0 && (
                <div className="booking-options-summary">
                  <h4>Options sélectionnées</h4>
                  <div className="options-list">
                    {selectedServiceData.selected_options.map((option, index) => (
                      <div key={index} className="option-item">
                        <span className="option-name">{option.option_name}:</span>
                        <span className="option-value">{option.choice_label}</span>
                        {option.price_modifier !== 0 && (
                          <span className="option-price">
                            {option.price_modifier > 0 ? '+' : ''}{option.price_modifier.toFixed(2)}€
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="options-total">
                    <span className="total-label">Prix total:</span>
                    <span className="total-amount">{selectedServiceData.total_price?.toFixed(2)}€</span>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">
                    Date souhaitée <span className="required">*</span>
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">
                    Heure souhaitée <span className="required">*</span>
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  Notes additionnelles
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Précisions sur votre demande, accès, informations particulières..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg form-submit" disabled={submitting}>
              {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default BookingForm
