import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Star, Upload, X, CheckCircle } from 'lucide-react'
import './TestimonialForm.css'

const TestimonialForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    author: '',
    role: '',
    rating: 5,
    text: '',
    photo: null
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 5 Mo')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image')
        return
      }
      setForm({ ...form, photo: file })
      setPhotoPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const removePhoto = () => {
    setForm({ ...form, photo: null })
    setPhotoPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      let photoUrl = null

      // Upload de la photo si présente
      if (form.photo) {
        const fileExt = form.photo.name.split('.').pop()
        const fileName = `testimonials/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, form.photo, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName)

        photoUrl = urlData.publicUrl
      }

      // Insérer le témoignage
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert([{
          author: form.author,
          role: form.role || null,
          rating: form.rating,
          text: form.text,
          photo_url: photoUrl,
          status: 'pending' // En attente de validation
        }])

      if (insertError) throw insertError

      setSubmitted(true)
      setForm({ author: '', role: '', rating: 5, text: '', photo: null })
      setPhotoPreview(null)

      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Testimonial submission error:', err)
      setError(err.message || 'Une erreur est survenue. Merci de réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="testimonial-form-success">
        <CheckCircle size={48} className="success-icon" />
        <h3>Merci pour votre témoignage !</h3>
        <p>Votre témoignage a été envoyé et sera publié après validation.</p>
        <button
          className="btn btn-outline"
          onClick={() => setSubmitted(false)}
        >
          Envoyer un autre témoignage
        </button>
      </div>
    )
  }

  return (
    <div className="testimonial-form-container">
      <div className="testimonial-form-header">
        <h3>Laissez votre témoignage</h3>
        <p>Partagez votre expérience avec nos services</p>
      </div>

      <form className="testimonial-form" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="author">Votre nom *</label>
            <input
              id="author"
              name="author"
              type="text"
              value={form.author}
              onChange={handleChange}
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Votre profession (optionnel)</label>
            <input
              id="role"
              name="role"
              type="text"
              value={form.role}
              onChange={handleChange}
              placeholder="Ex: Chef d'entreprise"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Votre note *</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${star <= form.rating ? 'active' : ''}`}
                onClick={() => setForm({ ...form, rating: star })}
              >
                <Star size={32} fill={star <= form.rating ? '#fbbf24' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="text">Votre témoignage *</label>
          <textarea
            id="text"
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Partagez votre expérience avec nos services..."
            rows={4}
            required
            minLength={10}
          />
        </div>

        <div className="form-group">
          <label>Photo (optionnel)</label>
          {!photoPreview ? (
            <label className="photo-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <div className="photo-upload-button">
                <Upload size={24} />
                <span>Ajouter une photo (max 5 Mo)</span>
              </div>
            </label>
          ) : (
            <div className="photo-preview">
              <img src={photoPreview} alt="Aperçu" />
              <button
                type="button"
                className="remove-photo"
                onClick={removePhoto}
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting}
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer mon témoignage'}
        </button>
      </form>
    </div>
  )
}

export default TestimonialForm
