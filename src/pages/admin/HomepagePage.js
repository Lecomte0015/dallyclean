import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { ArrowUp, ArrowDown, Eye, EyeOff, Save } from 'lucide-react'
import '../admin/BookingsPage.css'
import './ServiceLayoutPage.css'

const DEFAULT_SECTIONS = [
  { key: 'banner', label: 'Bannière / Hero', visible: true, order: 0 },
  { key: 'services', label: 'Nos Services', visible: true, order: 1 },
  { key: 'process', label: 'Notre Processus', visible: true, order: 2 },
  { key: 'testimonials', label: 'Témoignages', visible: true, order: 3 },
  { key: 'plans', label: 'Nos Forfaits', visible: true, order: 4 },
  { key: 'areas', label: "Zones d'Intervention", visible: true, order: 5 },
  { key: 'faq', label: 'FAQ', visible: true, order: 6 },
  { key: 'cta', label: "Appel à l'Action", visible: true, order: 7 }
]

const DEFAULT_NAVBAR = [
  { key: 'accueil', label: 'Accueil', visible: true },
  { key: 'services', label: 'Services', visible: true },
  { key: 'tarifs', label: 'Tarifs', visible: true },
  { key: 'a-propos', label: 'À propos', visible: true },
  { key: 'temoignages', label: 'Témoignages', visible: true }
]

const HomepagePage = () => {
  const [sections, setSections] = useState(DEFAULT_SECTIONS)
  const [navbarLinks, setNavbarLinks] = useState(DEFAULT_NAVBAR)
  const [loading, setLoading] = useState(true)
  const [savingSections, setSavingSections] = useState(false)
  const [savingNavbar, setSavingNavbar] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['homepage_sections', 'navbar_config'])

      if (error) throw error

      if (data) {
        const sectionsData = data.find(d => d.key === 'homepage_sections')
        const navbarData = data.find(d => d.key === 'navbar_config')

        if (sectionsData && sectionsData.value) {
          setSections(sectionsData.value)
        }
        if (navbarData && navbarData.value) {
          setNavbarLinks(navbarData.value)
        }
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // --- Sections management ---
  const moveSectionUp = (index) => {
    if (index === 0) return
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index - 1]
    newSections[index - 1] = temp
    newSections.forEach((s, idx) => { s.order = idx })
    setSections(newSections)
  }

  const moveSectionDown = (index) => {
    if (index === sections.length - 1) return
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index + 1]
    newSections[index + 1] = temp
    newSections.forEach((s, idx) => { s.order = idx })
    setSections(newSections)
  }

  const toggleSectionVisibility = (index) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], visible: !newSections[index].visible }
    setSections(newSections)
  }

  const handleSaveSections = async () => {
    setSavingSections(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'homepage_sections',
          value: sections,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error
      showMessage('Sections sauvegardées avec succès!', 'success')
    } catch (error) {
      console.error('Error saving sections:', error)
      showMessage('Erreur lors de la sauvegarde des sections', 'error')
    } finally {
      setSavingSections(false)
    }
  }

  // --- Navbar management ---
  const toggleNavbarLink = (index) => {
    const newLinks = [...navbarLinks]
    newLinks[index] = { ...newLinks[index], visible: !newLinks[index].visible }
    setNavbarLinks(newLinks)
  }

  const handleSaveNavbar = async () => {
    setSavingNavbar(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'navbar_config',
          value: navbarLinks,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error
      showMessage('Configuration de la navbar sauvegardée!', 'success')
    } catch (error) {
      console.error('Error saving navbar config:', error)
      showMessage('Erreur lors de la sauvegarde de la navbar', 'error')
    } finally {
      setSavingNavbar(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Configuration de la Page d'Accueil</h1>
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="service-layout-page">
        <div className="admin-page-header">
          <div>
            <h1>Configuration de la Page d'Accueil</h1>
            <p>Gérez les sections et la navigation de votre site</p>
          </div>
        </div>

        {message && (
          <div className={`layout-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Card 1: Sections de la page d'accueil */}
        <div className="section-editor" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="editor-header">
            <h2>Sections de la page d'accueil</h2>
            <button
              onClick={handleSaveSections}
              disabled={savingSections}
              className="btn btn-primary"
            >
              <Save size={18} />
              {savingSections ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          <div className="sections-list">
            {sections.map((section, index) => (
              <div key={section.key} className="section-item">
                <div className="section-controls">
                  <button
                    onClick={() => moveSectionUp(index)}
                    disabled={index === 0}
                    className="btn-icon"
                    title="Monter"
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => moveSectionDown(index)}
                    disabled={index === sections.length - 1}
                    className="btn-icon"
                    title="Descendre"
                  >
                    <ArrowDown size={18} />
                  </button>
                </div>

                <div className="section-info">
                  <span className="section-order">{index + 1}</span>
                  <span className="section-label">{section.label}</span>
                </div>

                <button
                  onClick={() => toggleSectionVisibility(index)}
                  className={`btn-visibility ${section.visible ? 'visible' : 'hidden'}`}
                >
                  {section.visible ? (
                    <>
                      <Eye size={18} />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={18} />
                      <span>Masqué</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="editor-footer">
            <p className="help-text">
              Utilisez les flèches pour réordonner les sections. Cliquez sur l'oeil pour masquer/afficher une section sur la page d'accueil.
            </p>
          </div>
        </div>

        {/* Card 2: Liens de la navbar */}
        <div className="section-editor">
          <div className="editor-header">
            <h2>Liens de la barre de navigation</h2>
            <button
              onClick={handleSaveNavbar}
              disabled={savingNavbar}
              className="btn btn-primary"
            >
              <Save size={18} />
              {savingNavbar ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          <div className="sections-list">
            {navbarLinks.map((link, index) => (
              <div key={link.key} className="section-item">
                <div className="section-info">
                  <span className="section-label">{link.label}</span>
                </div>

                <button
                  onClick={() => toggleNavbarLink(index)}
                  className={`btn-visibility ${link.visible ? 'visible' : 'hidden'}`}
                >
                  {link.visible ? (
                    <>
                      <Eye size={18} />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={18} />
                      <span>Masqué</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="editor-footer">
            <p className="help-text">
              Masquez ou affichez les liens dans la barre de navigation. Les pages dynamiques ajoutées depuis la section "Pages" sont gérées séparément.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default HomepagePage
