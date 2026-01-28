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

const Navbar = () => {
  const [open, setOpen] = useState(false) // dropdown desktop
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)

  // Debug: log when hamburger is clicked
  const handleHamburgerClick = () => {
    console.log('Hamburger clicked! Current mobileOpen:', mobileOpen)
    setMobileOpen(true)
    console.log('Setting mobileOpen to true')
  }
  const [services, setServices] = useState([])
  const [navPages, setNavPages] = useState([])
  const wrapperRef = useRef(null)
  const closeTimeout = useRef(null)

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

  return (
    <>
      <header className='navbar-container' ref={wrapperRef}>
        <div className='nav-left'>
          <Link to="/" className="logo-link"><img src={logo} alt='Dally Nettoyage' /></Link>
        </div>

        <nav className='nav-center' aria-label="Navigation principale">
          <ul className='nav-list'>
            <li><NavLink to="/" end>Accueil</NavLink></li>

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

            <li><NavLink to="/tarifs">Tarifs</NavLink></li>
            <li><NavLink to="/a-propos">À propos</NavLink></li>
            <li><NavLink to="/testimonials">Témoignages</NavLink></li>
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
          className={`mobile-menu open`}
          role="dialog"
          aria-modal="true"
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 99999
          }}
        >
          <div
            className='mobile-menu-inner'
            style={{
              background: 'white',
              width: '85%',
              maxWidth: '380px',
              height: '100vh',
              padding: '48px',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <button className='mobile-close' aria-label='Fermer le menu' onClick={() => setMobileOpen(false)}>✕</button>
            <ul>
              <li><Link to="/" onClick={() => setMobileOpen(false)}>Accueil</Link></li>
              <li>
                <button className='mobile-accordion' onClick={() => setMobileServicesOpen(s => !s)} aria-expanded={mobileServicesOpen}>Nos services ▾</button>
                <ul className={`mobile-submenu ${mobileServicesOpen ? 'open' : ''}`}>
                  {services.map(s => (
                    <li key={s.name}><Link to={`/services/${s.slug || slugify(s.name)}`} onClick={() => setMobileOpen(false)}>{s.name}</Link></li>
                  ))}
                </ul>
              </li>
              <li><Link to="/tarifs" onClick={() => setMobileOpen(false)}>Tarifs</Link></li>
              <li><Link to="/a-propos" onClick={() => setMobileOpen(false)}>À propos</Link></li>
              <li><Link to="/testimonials" onClick={() => setMobileOpen(false)}>Témoignages</Link></li>
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