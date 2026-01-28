import { useEffect, useState } from 'react'
import "./service.css"
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const Service = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          // Utiliser uniquement les services de Supabase
          const supabaseServices = data.map(service => ({
            name: service.name,
            description: service.description || 'Service de nettoyage professionnel',
            image: service.image_url,
            slug: service.slug || slugify(service.name)
          }))
          setServices(supabaseServices)
        } else {
          // Aucun service dans la base
          setServices([])
        }
      } catch (error) {
        console.error('Error loading services:', error)
        // En cas d'erreur, afficher un tableau vide
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Chargement des services...</p>
      </div>
    )
  }

  return (
    <>
    {services.map((service, index) => {
      const slug = service.slug || slugify(service.name)
      return (
      <Link to={`/services/${slug}`} className="service-link" key={service.name || index}>
        <article className="service-container">

          <div className="service-image">
            {service.image ? (
              <img src={service.image} alt={service.name} />
            ) : (
              <div style={{
                width: '100%',
                height: '200px',
                background: 'var(--bg-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                Pas d'image
              </div>
            )}
          </div>

          <div className="service-head">
            <h3>{service.name}</h3>
          </div>

          <div className="service-description">
            <p>{service.description}</p>
          </div>
          <div className="button-info-wrapper">
                  <button className="button-info-service">Plus d'informations</button>
          </div>


        </article>
      </Link>
      )
    })}
    </>

  )
}

export default Service