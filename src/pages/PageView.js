import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import ImageLightbox from '../components/ImageLightbox'
import './PageView.css'

const PageView = () => {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [mediaImages, setMediaImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [allImages, setAllImages] = useState([])

  useEffect(() => {
    const loadPage = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single()

        if (error) throw error

        if (data) {
          setPage(data)
        } else {
          throw new Error('Page not found')
        }
      } catch (error) {
        console.error('Error loading page:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [slug])

  // Load images from media table
  useEffect(() => {
    const loadMediaImages = async () => {
      if (page && page.id) {
        console.log('Loading media images for page:', page.id, 'slug:', page.slug, 'category:', page.category)
        try {
          const { data, error } = await supabase
            .from('media')
            .select('url, description, name, image_type, after_url')
            .eq('page_id', page.id)
            .order('created_at', { ascending: true })

          if (error) throw error

          console.log('Media images loaded:', data)
          setMediaImages(data || [])
        } catch (error) {
          console.error('Error loading media images:', error)
          setMediaImages([])
        }
      }
    }

    loadMediaImages()
  }, [page])

  // Prepare images (must be before conditional returns)
  useEffect(() => {
    // Images from pages.images array (simple images)
    const pageImages = (page?.images || []).map((url, index) => ({
      type: 'single',
      url,
      alt: `${page?.title} - Image ${index + 1}`,
      key: `page-${index}`
    }))

    // Images from media table (can be single or before_after)
    const mediaImagesData = mediaImages.map((media, index) => ({
      type: media.image_type || 'single',
      url: media.url,
      afterUrl: media.after_url,
      alt: media.description || media.name || `${page?.title} - Media ${index + 1}`,
      key: `media-${index}`
    }))

    const merged = [...pageImages, ...mediaImagesData]
    setAllImages(merged)

    console.log('Page category:', page?.category)
    console.log('Page images array:', page?.images)
    console.log('Media images:', mediaImages)
    console.log('All images merged:', merged)
  }, [page, mediaImages])

  if (loading) {
    return (
      <div className="page-view-container">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (notFound || !page) {
    return (
      <div className="page-view-container">
        <div className="container">
          <div className="page-not-found">
            <h2>Page non trouvée</h2>
            <p>La page que vous recherchez n'existe pas ou n'est plus disponible.</p>
            <Link to="/" className="btn btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  return (
    <main className="page-view-container">
      <div className="container">
        <div className="page-view-content">
          <header className="page-header">
            <h1>{page.title}</h1>
          </header>

          {/* Description en haut */}
          {page.meta_description && (
            <div className="page-description-section">
              <p className="page-description-text">{page.meta_description}</p>
            </div>
          )}

          {/* Contenu texte si présent */}
          {page.content && (
            <div className="page-content-section">
              <div className="page-content" dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          )}

          {/* Galerie d'images */}
          {allImages.length > 0 ? (
            <div className="page-gallery-section">
              <h2 className="gallery-title">Galerie photos</h2>
              <div className="page-gallery">
                {allImages.map((image, index) => (
                  <div
                    key={image.key}
                    className="gallery-item"
                    onClick={() => openLightbox(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
                  >
                    {image.type === 'before_after' && image.afterUrl ? (
                      <div className="gallery-before-after-preview">
                        <BeforeAfterSlider
                          beforeImage={image.url}
                          afterImage={image.afterUrl}
                          alt={image.alt}
                          interactive={false}
                        />
                        <div className="gallery-zoom-overlay">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M11 8V14M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img src={image.url} alt={image.alt} loading="lazy" />
                        <div className="gallery-zoom-overlay">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M11 8V14M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !page.content && (
              <div className="empty-gallery">
                <p className="text-secondary">Aucune image disponible.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </main>
  )
}

export default PageView
