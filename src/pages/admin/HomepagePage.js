import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { ArrowUp, ArrowDown, Eye, EyeOff, Save, Palette } from 'lucide-react'
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

const colorPickerStyle = { width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }
const colorTextStyle = { flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)', fontSize: '13px' }

const ColorPicker = ({ label, value, onChange }) => (
  <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
    <label style={{ fontSize: 'var(--text-sm)', marginBottom: '4px', display: 'block' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} style={colorPickerStyle} />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Par défaut" style={colorTextStyle} />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{ padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: '8px', background: 'var(--bg-soft)', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}
          title="Réinitialiser"
        >
          ✕
        </button>
      )}
    </div>
  </div>
)

const HomepagePage = () => {
  const [sections, setSections] = useState(DEFAULT_SECTIONS)
  const [navbarLinks, setNavbarLinks] = useState(DEFAULT_NAVBAR)
  const [navbarColors, setNavbarColors] = useState({ background_color: '', text_color: '' })
  const [loading, setLoading] = useState(true)
  const [savingSections, setSavingSections] = useState(false)
  const [savingNavbar, setSavingNavbar] = useState(false)
  const [message, setMessage] = useState(null)
  const [expandedColorSection, setExpandedColorSection] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['homepage_sections', 'navbar_config', 'navbar_colors'])

      if (error) throw error

      if (data) {
        const sectionsData = data.find(d => d.key === 'homepage_sections')
        const navbarData = data.find(d => d.key === 'navbar_config')
        const navColorsData = data.find(d => d.key === 'navbar_colors')

        if (sectionsData && sectionsData.value) {
          setSections(sectionsData.value)
        }
        if (navbarData && navbarData.value) {
          setNavbarLinks(navbarData.value)
        }
        if (navColorsData && navColorsData.value) {
          setNavbarColors(navColorsData.value)
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

  const updateSectionColor = (index, field, value) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
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
      // Save links config
      const { error: linksError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'navbar_config',
          value: navbarLinks,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (linksError) throw linksError

      // Save navbar colors
      const { error: colorsError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'navbar_colors',
          value: navbarColors,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (colorsError) throw colorsError

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
              <div key={section.key}>
                <div className="section-item">
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

                  {section.key !== 'banner' && (
                    <button
                      onClick={() => setExpandedColorSection(expandedColorSection === section.key ? null : section.key)}
                      className="btn-icon"
                      title="Couleurs"
                      style={{
                        color: expandedColorSection === section.key ? 'var(--color-primary)' : undefined,
                        borderColor: expandedColorSection === section.key ? 'var(--color-primary)' : undefined
                      }}
                    >
                      <Palette size={18} />
                    </button>
                  )}

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

                {/* Color pickers panel */}
                {expandedColorSection === section.key && section.key !== 'banner' && (
                  <div style={{
                    padding: 'var(--space-4)',
                    background: 'var(--bg-soft)',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    marginTop: '-2px',
                    border: '2px solid var(--color-primary)',
                    borderTop: '1px dashed var(--border-default)'
                  }}>
                    <div className="admin-grid-3">
                      <ColorPicker
                        label="Couleur de fond"
                        value={section.background_color || ''}
                        onChange={(val) => updateSectionColor(index, 'background_color', val)}
                      />
                      <ColorPicker
                        label="Couleur du texte"
                        value={section.text_color || ''}
                        onChange={(val) => updateSectionColor(index, 'text_color', val)}
                      />
                      <ColorPicker
                        label="Couleur des boutons"
                        value={section.button_color || ''}
                        onChange={(val) => updateSectionColor(index, 'button_color', val)}
                      />
                    </div>
                    {(section.background_color || section.text_color || section.button_color) && (
                      <div style={{
                        marginTop: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: section.background_color || 'var(--bg-primary)',
                        color: section.text_color || 'var(--text-primary)',
                        border: '1px solid var(--border-default)'
                      }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                          Aperçu : Texte d'exemple
                        </span>
                        {section.button_color && (
                          <span style={{
                            marginLeft: 'var(--space-3)',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: section.button_color,
                            color: '#ffffff',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-semibold)'
                          }}>
                            Bouton
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="editor-footer">
            <p className="help-text">
              Utilisez les flèches pour réordonner les sections. Cliquez sur l'oeil pour masquer/afficher. Cliquez sur la palette pour personnaliser les couleurs. La section Hero est gérée depuis sa propre page.
            </p>
          </div>
        </div>

        {/* Card 2: Liens et couleurs de la navbar */}
        <div className="section-editor">
          <div className="editor-header">
            <h2>Barre de navigation</h2>
            <button
              onClick={handleSaveNavbar}
              disabled={savingNavbar}
              className="btn btn-primary"
            >
              <Save size={18} />
              {savingNavbar ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
            Liens de navigation
          </h3>
          <div className="sections-list" style={{ marginBottom: 'var(--space-5)' }}>
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

          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Palette size={18} />
            Couleurs de la navbar
          </h3>
          <div className="admin-grid-2" style={{ marginBottom: 'var(--space-4)' }}>
            <ColorPicker
              label="Couleur de fond"
              value={navbarColors.background_color || ''}
              onChange={(val) => setNavbarColors(prev => ({ ...prev, background_color: val }))}
            />
            <ColorPicker
              label="Couleur du texte"
              value={navbarColors.text_color || ''}
              onChange={(val) => setNavbarColors(prev => ({ ...prev, text_color: val }))}
            />
          </div>

          {(navbarColors.background_color || navbarColors.text_color) && (
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: navbarColors.background_color || '#ffffff',
              color: navbarColors.text_color || 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              gap: 'var(--space-4)',
              alignItems: 'center',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)'
            }}>
              <span>Aperçu :</span>
              <span>Accueil</span>
              <span>Services</span>
              <span>Tarifs</span>
            </div>
          )}

          <div className="editor-footer">
            <p className="help-text">
              Masquez ou affichez les liens dans la barre de navigation. Personnalisez les couleurs du fond et du texte. Les pages dynamiques ajoutées depuis "Pages" sont gérées séparément.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default HomepagePage
