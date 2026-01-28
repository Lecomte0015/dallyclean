import React, { useEffect, useState } from 'react'
import './HomePlans.css'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const HomePlans = () => {
  const [plans, setPlans] = useState([])

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('name, price_label, points, popular')
          .order('created_at', { ascending: true })
          .limit(3)
        if (error) throw error
        if (data && data.length) {
          // Normaliser le format attendu par le composant
          const normalized = data.map(p => ({
            name: p.name,
            price: p.price_label || '',
            points: Array.isArray(p.points) ? p.points : [],
            popular: p.popular || false
          }))
          setPlans(normalized)
        } else {
          // Aucun plan dans Supabase
          setPlans([])
        }
      } catch (_) {
        // En cas d'erreur, afficher un tableau vide
        setPlans([])
      }
    }
    loadPlans()
  }, [])
  return (
    <section className="home-plans section">
      <div className="container">
        <div className="plans-header">
          <h2>Nos forfaits populaires</h2>
          <p className="text-secondary">Découvrez nos offres les plus demandées</p>
        </div>
        <div className="plans-grid">
          {plans.map((p) => (
            <article className={`plan-card card ${p.popular ? 'featured' : ''}`} key={p.name}>
              {p.popular && <div className="featured-badge"></div>}
              <div className="plan-header">
                <h3>{p.name}</h3>
                <div className="price">{p.price}</div>
              </div>
              <ul className="points">
                {p.points.map(pt => (
                  <li key={pt}>
                    <span className="check-icon">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="actions">
                <Link to="/booking" className="btn btn-primary plan-cta">Obtenir un devis</Link>
                <Link to="/services" className="btn btn-ghost">En savoir plus</Link>
              </div>
            </article>
          ))}
        </div>

        <div className="plans-cta">
          <Link to="/tarifs" className="btn btn-outline btn-lg">
            Voir tous les tarifs
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HomePlans
