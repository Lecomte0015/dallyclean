import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Award, Heart, Clock, Shield, Phone, Mail } from 'lucide-react'
import './AboutPage.css'

const commitments = [
  {
    icon: Award,
    title: 'Qualité professionnelle',
    description: 'Personnel formé et équipement de pointe pour des résultats impeccables'
  },
  {
    icon: Clock,
    title: 'Ponctualité garantie',
    description: 'Respect de vos horaires et flexibilité selon vos besoins'
  },
  {
    icon: Heart,
    title: 'Satisfaction client',
    description: 'Votre satisfaction est notre priorité absolue'
  },
  {
    icon: Shield,
    title: 'Produits écologiques',
    description: 'Utilisation de produits respectueux de l\'environnement et de votre santé'
  }
]

const AboutPage = () => {
  const [page, setPage] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('title, content, hero_image')
          .eq('slug', 'about')
          .limit(1)
          .maybeSingle()
        if (error) throw error
        if (data) setPage(data)
      } catch (_) {
        setPage(null)
      }
    }
    load()
  }, [])

  if (page) {
    return (
      <main className="about-page">
        <section className="about-hero section-sm bg-soft">
          <div className="container">
            <div className="about-hero-content">
              <h1>{page.title || 'À propos'}</h1>
              {page.content && (
                <div className="about-content">
                  <p style={{whiteSpace:'pre-line'}}>{page.content}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero section-sm bg-soft">
        <div className="container">
          <div className="about-hero-content">
            <h1>À propos de Dally Clean</h1>
            <p className="about-subtitle">
              Votre partenaire de confiance pour un environnement propre et sain
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission section">
        <div className="container">
          <div className="mission-content card">
            <h2>Notre Mission</h2>
            <p>
              Nous sommes une entreprise de nettoyage professionnelle spécialisée dans l'entretien
              de véhicules, domiciles et bureaux. Notre mission est de fournir un service fiable,
              soigné et accessible, avec une équipe hautement professionnelle et du matériel adapté
              à chaque type d'intervention.
            </p>
            <p>
              Basés en Suisse romande, nous intervenons dans les cantons de Genève et Vaud,
              en apportant notre expertise et notre savoir-faire pour garantir votre satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Commitments Section */}
      <section className="about-commitments section bg-secondary">
        <div className="container">
          <div className="commitments-header">
            <h2>Nos Engagements</h2>
            <p className="text-secondary">Des valeurs qui guident notre action au quotidien</p>
          </div>

          <div className="commitments-grid">
            {commitments.map((commitment, index) => {
              const Icon = commitment.icon
              return (
                <div key={index} className="commitment-card card">
                  <div className="commitment-icon">
                    <Icon size={32} />
                  </div>
                  <h3>{commitment.title}</h3>
                  <p>{commitment.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-contact section">
        <div className="container">
          <div className="contact-card card">
            <h2>Contactez-nous</h2>
            <p className="text-secondary">Nous sommes à votre écoute pour répondre à vos besoins</p>

            <div className="contact-info">
              <div className="contact-item">
                <Phone size={24} />
                <div>
                  <h4>Téléphone</h4>
                  <a href="tel:+41783239711">078 323 97 11</a>
                </div>
              </div>

              <div className="contact-item">
                <Mail size={24} />
                <div>
                  <h4>Email</h4>
                  <a href="mailto:contact@dally-nettoyage.ch">contact@dally-nettoyage.ch</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AboutPage
