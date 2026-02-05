import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './HomeServices.css'
import { supabase } from '../../lib/supabaseClient'

const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const truncateText = (text, maxLength = 100) => {
  const clean = stripHtml(text)
  if (clean.length <= maxLength) return clean
  return clean.substring(0, maxLength) + '...'
}

const HomeServices = () => {
  const [services, setServices] = useState([])

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('name, description, image_url, slug')
          .limit(6)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data && data.length) {
          // Utiliser uniquement les données de Supabase
          const supabaseServices = data.map(service => ({
            name: service.name,
            description: service.description || 'Service de nettoyage professionnel',
            image: service.image_url,
            slug: service.slug
          }))
          setServices(supabaseServices)
        } else {
          // Aucun service dans Supabase, afficher un tableau vide
          setServices([])
        }
      } catch (_) {
        // En cas d'erreur, afficher un tableau vide
        setServices([])
      }
    }
    loadServices()
  }, [])

  return (
    <section className="home-services section">
      <div className="container">
        <div className="services-header">
          <h2>Nos services principaux</h2>
          <p className="text-secondary">
            Des solutions de nettoyage adaptées à tous vos besoins
          </p>
        </div>

        <div className="services-grid">
          {services.slice(0, 6).map((service) => (
            <article className="service-card card" key={service.name}>
              {service.image && (
                <div className="service-image">
                  <img src={service.image} alt={service.name} />
                </div>
              )}
              <div className="service-content">
                <h3>{service.name}</h3>
                <p className="text-muted">
                  {truncateText(service.description, 100) || 'Service de nettoyage professionnel et complet'}
                </p>
                <Link
                  to={`/services/${slugify(service.name)}`}
                  className="service-link"
                >
                  En savoir plus →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="services-cta">
          <Link to="/services" className="btn btn-outline btn-lg">
            Voir tous nos services
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HomeServices
