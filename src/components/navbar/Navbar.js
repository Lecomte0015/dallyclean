import React, { useState, useRef, useEffect } from "react"
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import logo from "../../assets/images/logo.png"
import { supabase } from '../../lib/supabaseClient'
import "./Navbar.css"
import "./Navbar.mobile.css"
import "./Navbar.override.css"

const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const DEFAULT_NAVBAR_CONFIG = [
  { key: 'accueil', label: 'Accueil', visible: true },
  { key: 'services', label: 'Services', visible: true },
  { key: 'tarifs', label: 'Tarifs', visible: true },
  { key: 'a-propos', label: 'À propos', visible: true },
  { key: 'temoignages', label: 'Témoignages', visible: true }
]

const Navbar = () => {
  const [open, setOpen] = useState(false) // dropdown desktop
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [navbarConfig, setNavbarConfig] = useState(DEFAULT_NAVBAR_CONFIG)
  const [navbarColors, setNavbarColors] = useState({ background_color: '', text_color: '' })

  const handleHamburgerClick = () => {
    setMobileOpen(true)
  }
  const [services, setServices] = useState([])
  const [navPages, setNavPages] = useState([])
  const wrapperRef = useRef(null)
  const closeTimeout = useRef(null)

  const isLinkVisible = (key) => {
    const link = navbarConfig.find(l => l.key === key)
    return link ? link.visible : true
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current)
      }
    }
  }, [])

  // Charger les services depuis Supabase
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('name, slug')
          .order('name', { ascending: true })

        if (error) throw error
        if (data && data.length > 0) {
          const supabaseServices = data.map(service => ({
            name: service.name,
            slug: service.slug || slugify(service.name)
          }))
          setServices(supabaseServices)
        }
      } catch (error) {
        console.error('Error loading services:', error)
        setServices([])
      }
    }
    loadServices()
  }, [])

  // Charger la config de la navbar
  useEffect(() => {
    const loadNavbarConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'navbar_config')
          .single()

        if (error && error.code !== 'PGRST116') throw error
        if (data && data.value) {
          setNavbarConfig(data.value)
        }
      } catch (error) {
        console.error('Error loading navbar config:', error)
      }
    }
    loadNavbarConfig()
  }, [])

  // Charger les couleurs de la navbar
  useEffect(() => {
    const loadNavbarColors = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'navbar_colors')
          .single()

        if (error && error.code !== 'PGRST116') throw error
        if (data && data.value) {
          setNavbarColors(data.value)
        }
      } catch (error) {
        console.error('Error loading navbar colors:', error)
      }
    }
    loadNavbarColors()
  }, [])

  // Charger les pages à afficher dans la navbar
  useEffect(() => {
    const loadNavPages = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('title, slug, navbar_order')
          .eq('show_in_navbar', true)
          .eq('is_published', true)
          .order('navbar_order', { ascending: true })

        if (error) throw error
        if (data && data.length > 0) {
          setNavPages(data)
        }
      } catch (error) {
        console.error('Error loading nav pages:', error)
        setNavPages([])
      }
    }
    loadNavPages()
  }, [])

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
    }
    setOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setOpen(false)
    }, 150)
  }

  // Build header style from navbar colors
  const headerStyle = {}
  if (navbarColors.background_color) headerStyle.backgroundColor = navbarColors.background_color
  if (navbarColors.text_color) {
    headerStyle['--text-secondary'] = navbarColors.text_color
    headerStyle['--text-primary'] = navbarColors.text_color
  }

  return (
    <>
      <header className='navbar-container' ref={wrapperRef} style={headerStyle}>
        <div className='nav-left'>
          <Link to="/" className="logo-link"><img src={logo} alt='Dally Nettoyage' /></Link>
        </div>

        <nav className='nav-center' aria-label="Navigation principale">
          <ul className='nav-list'>
            {isLinkVisible('accueil') && <li><NavLink to="/" end>Accueil</NavLink></li>}

            {isLinkVisible('services') && (
              <li className='nav-item-dropdown' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button
                  className='dropdown-toggle'
                  onClick={() => setOpen(o => !o)}
                  aria-expanded={open}
                  aria-haspopup="menu"
                >Services ▾</button>

                <ul className={`dropdown-menu ${open ? 'open' : ''}`} role="menu">
                  {services.map(s => (
                    <li key={s.name}>
                      <Link
                        to={`/services/${s.slug || slugify(s.name)}`}
                        onClick={() => setOpen(false)}
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {isLinkVisible('tarifs') && <li><NavLink to="/tarifs">Tarifs</NavLink></li>}
            {isLinkVisible('a-propos') && <li><NavLink to="/a-propos">À propos</NavLink></li>}
            {isLinkVisible('temoignages') && <li><NavLink to="/testimonials">Témoignages</NavLink></li>}
            {navPages.map(page => (
              <li key={page.slug}>
                <NavLink to={`/pages/${page.slug}`}>{page.title}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className='nav-actions'>
          <Link to="/booking" className='cta btn btn-primary'>Prendre RDV</Link>

          <button className='hamburger' aria-label='Ouvrir le menu' onClick={handleHamburgerClick}>
            ☰
          </button>
        </div>
      </header>

      {/* Mobile menu via Portal - renders directly in body */}
      {mobileOpen && createPortal(
        <div
          onClick={(e) => {
            // Close if clicking on overlay (not sidebar)
            if (e.target === e.currentTarget) {
              setMobileOpen(false)
            }
          }}
          style={{
            display: 'block',
            position: 'fixed',
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            zIndex: 999999,
            margin: 0,
            padding: 0
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              backgroundColor: navbarColors.background_color || '#ffffff',
              width: '85%',
              maxWidth: '380px',
              height: '100vh',
              padding: '48px',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              margin: 0,
              ...(navbarColors.text_color ? { color: navbarColors.text_color } : {})
            }}
          >
            <button className='mobile-close' aria-label='Fermer le menu' onClick={() => setMobileOpen(false)}>✕</button>
            <ul>
              {isLinkVisible('accueil') && <li><Link to="/" onClick={() => setMobileOpen(false)}>Accueil</Link></li>}
              {isLinkVisible('services') && (
                <li>
                  <button className='mobile-accordion' onClick={() => setMobileServicesOpen(s => !s)} aria-expanded={mobileServicesOpen}>Nos services ▾</button>
                  <ul className={`mobile-submenu ${mobileServicesOpen ? 'open' : ''}`}>
                    {services.map(s => (
                      <li key={s.name}><Link to={`/services/${s.slug || slugify(s.name)}`} onClick={() => setMobileOpen(false)}>{s.name}</Link></li>
                    ))}
                  </ul>
                </li>
              )}
              {isLinkVisible('tarifs') && <li><Link to="/tarifs" onClick={() => setMobileOpen(false)}>Tarifs</Link></li>}
              {isLinkVisible('a-propos') && <li><Link to="/a-propos" onClick={() => setMobileOpen(false)}>À propos</Link></li>}
              {isLinkVisible('temoignages') && <li><Link to="/testimonials" onClick={() => setMobileOpen(false)}>Témoignages</Link></li>}
              {navPages.map(page => (
                <li key={page.slug}>
                  <Link to={`/pages/${page.slug}`} onClick={() => setMobileOpen(false)}>
                    {page.title}
                  </Link>
                </li>
              ))}
              <li><Link to="/booking" className='mobile-cta btn btn-primary' onClick={() => setMobileOpen(false)}>Prendre RDV</Link></li>
            </ul>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Navbar