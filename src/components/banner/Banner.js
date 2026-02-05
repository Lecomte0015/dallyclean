import React, { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import "./Banner.css"
import "./Banner.override.css"
import { ArrowRight } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

const Banner = () => {
  const [heroData, setHeroData] = useState({
    title: 'Un nettoyage à la perfection à votre domicile',
    subtitle: 'Des services de nettoyage résidentiel et commercial fiables et abordables pour un environnement impeccable',
    image_url: '',
    primary_button_text: 'Obtenez un devis gratuit',
    primary_button_link: '/booking',
    secondary_button_text: 'Nos services',
    secondary_button_link: '/services',
    background_color: '',
    title_color: '',
    subtitle_color: '',
    primary_button_bg: '',
    primary_button_text_color: '',
    secondary_button_bg: '',
    secondary_button_text_color: '',
    secondary_button_border_color: '',
    layout: 'text-left',
    content_align: 'left',
    image_size: 'medium',
    image_max_width: '500px',
    image_max_height: '400px',
    // Slideshow
    background_images: [],
    slideshow_enabled: false,
    slideshow_direction: 'left-to-right',
    slideshow_speed: 5,
    slideshow_overlay: 'rgba(0,0,0,0.3)'
  })

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const loadHeroData = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'hero')
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading hero data:', error)
          return
        }

        if (data && data.value) {
          setHeroData(prev => ({ ...prev, ...data.value }))
        }
      } catch (error) {
        console.error('Error loading hero data:', error)
      }
    }
    loadHeroData()
  }, [])

  // Slideshow effect
  const nextSlide = useCallback(() => {
    if (heroData.background_images && heroData.background_images.length > 1) {
      setCurrentSlide(prev => (prev + 1) % heroData.background_images.length)
    }
  }, [heroData.background_images])

  useEffect(() => {
    if (heroData.slideshow_enabled && heroData.background_images && heroData.background_images.length > 1) {
      const interval = setInterval(nextSlide, (heroData.slideshow_speed || 5) * 1000)
      return () => clearInterval(interval)
    }
  }, [heroData.slideshow_enabled, heroData.slideshow_speed, heroData.background_images, nextSlide])

  // Styles dynamiques
  const containerStyle = heroData.background_color
    ? { background: heroData.background_color }
    : {}

  const titleStyle = heroData.title_color
    ? { color: heroData.title_color }
    : {}

  const subtitleStyle = heroData.subtitle_color
    ? { color: heroData.subtitle_color }
    : {}

  const primaryButtonStyle = {
    ...(heroData.primary_button_bg && { background: heroData.primary_button_bg, borderColor: heroData.primary_button_bg }),
    ...(heroData.primary_button_text_color && { color: heroData.primary_button_text_color })
  }

  const secondaryButtonStyle = {
    ...(heroData.secondary_button_bg && heroData.secondary_button_bg !== 'transparent' && { background: heroData.secondary_button_bg }),
    ...(heroData.secondary_button_text_color && { color: heroData.secondary_button_text_color }),
    ...(heroData.secondary_button_border_color && { borderColor: heroData.secondary_button_border_color })
  }

  // Classes pour le layout
  const getLayoutClass = () => {
    switch (heroData.layout) {
      case 'text-right':
        return 'banner-layout-text-right'
      case 'text-center-top':
        return 'banner-layout-text-top'
      case 'text-center-bottom':
        return 'banner-layout-text-bottom'
      default:
        return ''
    }
  }

  // Style pour la taille de l'image
  const getImageStyle = () => {
    const baseStyle = {}

    switch (heroData.image_size) {
      case 'small':
        baseStyle.maxWidth = '300px'
        baseStyle.maxHeight = '250px'
        break
      case 'medium':
        baseStyle.maxWidth = '500px'
        baseStyle.maxHeight = '400px'
        break
      case 'large':
        baseStyle.maxWidth = '700px'
        baseStyle.maxHeight = '550px'
        break
      case 'full':
        baseStyle.maxWidth = '100%'
        baseStyle.maxHeight = 'none'
        break
      case 'custom':
        if (heroData.image_max_width) baseStyle.maxWidth = heroData.image_max_width
        if (heroData.image_max_height) baseStyle.maxHeight = heroData.image_max_height
        break
      default:
        baseStyle.maxWidth = '500px'
        baseStyle.maxHeight = '400px'
    }

    return baseStyle
  }

  const getContentAlignClass = () => {
    switch (heroData.content_align) {
      case 'center':
        return 'banner-content-center'
      case 'right':
        return 'banner-content-right'
      default:
        return ''
    }
  }

  // Check if title/subtitle contain HTML tags
  const titleHasHtml = heroData.title && heroData.title.includes('<')
  const subtitleHasHtml = heroData.subtitle && heroData.subtitle.includes('<')

  // Check if slideshow is active
  const hasSlideshow = heroData.slideshow_enabled && heroData.background_images && heroData.background_images.length > 0

  // Get animation class for slideshow
  const getSlideshowAnimationClass = () => {
    if (heroData.slideshow_direction === 'right-to-left') {
      return 'slideshow-rtl'
    } else if (heroData.slideshow_direction === 'fade') {
      return 'slideshow-fade'
    }
    return 'slideshow-ltr'
  }

  const hasImage = Boolean(heroData.image_url)

  return (
    <div className={`banner-container ${getLayoutClass()} ${hasSlideshow ? 'has-slideshow' : ''} ${!hasImage ? 'no-image' : ''}`} style={containerStyle}>
      {/* Background Slideshow */}
      {hasSlideshow && (
        <div className="banner-slideshow">
          {heroData.background_images.map((img, index) => (
            <div
              key={index}
              className={`slideshow-slide ${getSlideshowAnimationClass()} ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${img})`,
                animationDuration: `${heroData.slideshow_speed || 5}s`
              }}
            />
          ))}
          {/* Overlay */}
          <div
            className="slideshow-overlay"
            style={{ background: heroData.slideshow_overlay || 'rgba(0,0,0,0.3)' }}
          />
        </div>
      )}

      <div className={`banner-content ${getContentAlignClass()}`}>
        <div className="banner-heading">
          {titleHasHtml ? (
            <div className="banner-title-html" style={titleStyle} dangerouslySetInnerHTML={{ __html: heroData.title }} />
          ) : (
            <h1 style={titleStyle}>{heroData.title}</h1>
          )}
        </div>

        <div className="banner-subheading">
          {subtitleHasHtml ? (
            <div className="banner-subtitle-html" style={subtitleStyle} dangerouslySetInnerHTML={{ __html: heroData.subtitle }} />
          ) : (
            <p style={subtitleStyle}>{heroData.subtitle}</p>
          )}
        </div>

        <div className="banner-buttons">
          <Link
            to={heroData.primary_button_link}
            className="btn btn-primary btn-lg banner-cta-primary"
            style={primaryButtonStyle}
          >
            {heroData.primary_button_text}
            <ArrowRight size={20} />
          </Link>
          <Link
            to={heroData.secondary_button_link}
            className="btn btn-outline btn-lg banner-cta-secondary"
            style={secondaryButtonStyle}
          >
            {heroData.secondary_button_text}
          </Link>
        </div>
      </div>

      {heroData.image_url && (
        <div className="banner-image">
          <div className="banner-image-wrapper" style={getImageStyle()}>
            <img
              src={heroData.image_url}
              alt="Service de nettoyage professionnel Dally"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Banner
