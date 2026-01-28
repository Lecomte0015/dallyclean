import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Star } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import './TarifsPage.css'

const TarifsPage = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setPlans(data)
        } else {
          setPlans([])
        }
      } catch (error) {
        console.error('Error loading plans:', error)
        setPlans([])
      } finally {
        setLoading(false)
      }
    }
    loadPlans()
  }, [])
  if (loading) {
    return (
      <main className="tarifs-page">
        <section className="tarifs-hero section-sm bg-soft">
          <div className="container">
            <div className="tarifs-hero-content">
              <h1>Nos Tarifs</h1>
              <p className="text-secondary">Chargement...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="tarifs-page">
      <section className="tarifs-hero section-sm bg-soft">
        <div className="container">
          <div className="tarifs-hero-content">
            <h1>Nos Tarifs</h1>
            <p className="text-secondary">Des prix transparents et compétitifs pour des services de qualité professionnelle</p>
          </div>
        </div>
      </section>

      <section className="tarifs-pricing section">
        <div className="container">
          {plans.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <p className="text-secondary">Aucun forfait disponible pour le moment.</p>
              <Link to="/booking" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                Demander un devis personnalisé
              </Link>
            </div>
          ) : (
            <>
              <div className="pricing-grid">
                {plans.map((plan) => (
                  <article key={plan.id} className={`pricing-card card ${plan.popular ? 'featured' : ''}`}>
                    {plan.popular && (
                      <div className="popular-badge">
                        <Star size={14} />
                        <span>Populaire</span>
                      </div>
                    )}

                    <div className="pricing-header">
                      <h3>{plan.name}</h3>
                    </div>

                    <div className="pricing-price">
                      <div className="price-custom">{plan.price_label}</div>
                    </div>

                    <ul className="pricing-features">
                      {plan.points && plan.points.length > 0 ? (
                        plan.points.map((feature, idx) => (
                          <li key={idx}>
                            <Check size={18} />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li>
                          <Check size={18} />
                          <span>Contactez-nous pour plus de détails</span>
                        </li>
                      )}
                    </ul>

                    <Link to="/booking" className="btn btn-primary pricing-cta">
                      Réserver maintenant
                      <ArrowRight size={18} />
                    </Link>
                  </article>
                ))}
              </div>

              <div className="tarifs-info card">
                <h3>Formules d'abonnement disponibles</h3>
                <p>
                  Pour des interventions régulières (hebdomadaire, bi-mensuel, mensuel),
                  nous proposons des formules d'abonnement avec des tarifs préférentiels.
                  Contactez-nous pour obtenir un devis personnalisé adapté à vos besoins.
                </p>
                <Link to="/booking" className="btn btn-outline">
                  Demander un devis personnalisé
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default TarifsPage
