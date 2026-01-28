import React, { useEffect, useState } from 'react'
import './Testimonials.css'
import { supabase } from '../../lib/supabaseClient'
import TestimonialForm from './TestimonialForm'

const localTestimonials = [
  { id: 1, author: 'Marie Dupont', text: "Service impeccable, ma maison n'a jamais été aussi propre !", rating: 5 },
  { id: 2, author: 'Jean Martin', text: 'Ponctuels et professionnels. Je recommande.', rating: 5 },
  { id: 3, author: 'Sophie Bernard', text: 'Très bonne prestation, équipe sympathique.', rating: 4 }
]

const Testimonials = ({ limit = 3, showForm = true }) => {
  const [items, setItems] = useState(localTestimonials)

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, author, role, rating, text, photo_url')
        .eq('status', 'approved') // Ne charger que les témoignages approuvés
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data && data.length) setItems(data)
    } catch (_) {
      setItems(localTestimonials)
    }
  }

  useEffect(() => {
    loadTestimonials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="testimonials-container">
      <h3>Témoignages</h3>
      <div className="testimonials-list">
        {items.slice(0, limit).map(t => (
          <article className="testimonial" key={t.id}>
            {t.photo_url && (
              <div className="testimonial-photo">
                <img src={t.photo_url} alt={t.author} />
              </div>
            )}
            <div className="testimonial-body">"{t.text}"</div>
            <div className="testimonial-meta">
              — {t.author}{t.role ? `, ${t.role}` : ''}
              <span className="rating">
                {Array.from({length: t.rating || 0}).map((_,i)=>'★').join('')}
              </span>
            </div>
          </article>
        ))}
      </div>

      {showForm && (
        <TestimonialForm onSuccess={loadTestimonials} />
      )}
    </section>
  )
}

export default Testimonials
