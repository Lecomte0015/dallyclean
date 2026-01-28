import React from 'react'
import './HomeCTA.css'
import { Link } from 'react-router-dom'
import { Calendar, Phone } from 'lucide-react'

const HomeCTA = () => {
  return (
    <section className="home-cta section">
      <div className="container">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Prêt à réserver un nettoyage ?</h2>
            <p>Demandez un devis gratuit en ligne ou contactez-nous directement pour définir votre créneau</p>
          </div>
          <div className="cta-actions">
            <Link to="/booking" className="btn btn-primary btn-lg cta-primary">
              <Calendar size={20} />
              Prendre rendez-vous
            </Link>
            <a href="tel:+33123456789" className="btn btn-outline btn-lg cta-secondary">
              <Phone size={20} />
              Nous appeler
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeCTA
