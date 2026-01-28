import React from 'react'
import Service from '../components/service/service'
import './ServicesPage.css'

const ServicesPage = () => {
  return (
    <main className="services-page">
      <section className="services-hero section-sm bg-soft">
        <div className="container">
          <div className="services-hero-content">
            <h1>Nos Services</h1>
            <p className="text-secondary">Découvrez l'ensemble de nos prestations de nettoyage professionnel</p>
          </div>
        </div>
      </section>

      <section className="services-grid-section section">
        <div className="container">
          <div className="services-grid-layout">
            <Service />
          </div>
        </div>
      </section>
    </main>
  )
}

export default ServicesPage
