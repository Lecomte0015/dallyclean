import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Save, Upload, Image, Type, Palette, Move, Maximize2, Layers, Trash2, Play } from 'lucide-react'
import RichTextEditor from '../../components/editor/RichTextEditor'
import '../admin/BookingsPage.css'

const HeroPage = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [heroData, setHeroData] = useState({
    title: 'Un nettoyage à la perfection à votre domicile',
    subtitle: 'Des services de nettoyage résidentiel et commercial fiables et abordables pour un environnement impeccable',
    image_url: '',
    primary_button_text: 'Obtenez un devis gratuit',
    primary_button_link: '/booking',
    secondary_button_text: 'Nos services',
    secondary_button_link: '/services',
    // Couleurs
    background_color: '#f8fafc',
    title_color: '#1e293b',
    subtitle_color: '#64748b',
    primary_button_bg: '#3b82f6',
    primary_button_text_color: '#ffffff',
    secondary_button_bg: 'transparent',
    secondary_button_text_color: '#3b82f6',
    secondary_button_border_color: '#3b82f6',
    // Positions
    layout: 'text-left',
    content_align: 'left',
    // Taille image
    image_size: 'medium', // small, medium, large, full
    image_max_width: '500px',
    image_max_height: '400px',
    // Diaporama arrière-plan
    background_images: [],
    slideshow_enabled: false,
    slideshow_direction: 'left-to-right', // 'left-to-right' ou 'right-to-left'
    slideshow_speed: 5, // secondes entre chaque transition
    slideshow_overlay: 'rgba(0,0,0,0.3)' // overlay pour lisibilité du texte
  })
  const [uploadingBg, setUploadingBg] = useState(false)

  useEffect(() => {
    loadHeroData()
  }, [])

  const loadHeroData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'hero')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data && data.value) {
        setHeroData(prev => ({ ...prev, ...data.value }))
      }
    } catch (error) {
      console.error('Error loading hero data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'hero',
          value: heroData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error
      alert('Hero sauvegardé avec succès!')
    } catch (error) {
      console.error('Error saving hero:', error)
      alert('Erreur lors de la sauvegarde: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande (max 5MB)')
      return
    }

    try {
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `hero/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path)

      setHeroData(prev => ({ ...prev, image_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
    }
  }

  // Upload d'image d'arrière-plan pour le diaporama
  const handleBackgroundImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande (max 5MB)')
      return
    }

    try {
      setUploadingBg(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `hero/bg_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path)

      setHeroData(prev => ({
        ...prev,
        background_images: [...(prev.background_images || []), publicUrl]
      }))
    } catch (error) {
      console.error('Error uploading background image:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploadingBg(false)
    }
  }

  // Supprimer une image d'arrière-plan
  const removeBackgroundImage = (index) => {
    setHeroData(prev => ({
      ...prev,
      background_images: prev.background_images.filter((_, i) => i !== index)
    }))
  }

  // Fonction pour obtenir la taille de l'image selon le choix
  const getImageSizeStyle = () => {
    switch (heroData.image_size) {
      case 'small':
        return { maxWidth: '300px', maxHeight: '250px' }
      case 'large':
        return { maxWidth: '700px', maxHeight: '550px' }
      case 'full':
        return { maxWidth: '100%', maxHeight: '600px' }
      case 'custom':
        return { maxWidth: heroData.image_max_width || '500px', maxHeight: heroData.image_max_height || '400px' }
      default: // medium
        return { maxWidth: '500px', maxHeight: '400px' }
    }
  }

  // Fonction pour obtenir le style de la prévisualisation selon le layout
  const getPreviewStyle = () => {
    const base = {
      background: heroData.background_color,
      padding: 'var(--space-6)',
      borderRadius: 'var(--radius-lg)',
      minHeight: '300px'
    }

    switch (heroData.layout) {
      case 'text-right':
        return { ...base, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'center' }
      case 'text-center-top':
        return { ...base, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
      case 'text-center-bottom':
        return { ...base, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', textAlign: 'center' }
      default:
        return { ...base, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'center' }
    }
  }

  const getContentOrder = () => {
    if (heroData.layout === 'text-right') return { content: 2, image: 1 }
    return { content: 1, image: 2 }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Section Hero</h1>
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Section Hero</h1>
          <p>Personnalisez la bannière principale de votre site</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={18} />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="admin-grid-2">
        {/* Colonne gauche - Textes */}
        <div className="admin-card" style={{ padding: 'var(--space-4)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Type size={20} />
            Contenu texte
          </h3>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label>Titre principal</label>
            <RichTextEditor
              value={heroData.title || ''}
              onChange={(value) => setHeroData(prev => ({ ...prev, title: value }))}
              placeholder="Titre du hero..."
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Le titre principal qui s'affiche en grand
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label>Sous-titre</label>
            <RichTextEditor
              value={heroData.subtitle || ''}
              onChange={(value) => setHeroData(prev => ({ ...prev, subtitle: value }))}
              placeholder="Sous-titre du hero..."
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Le texte descriptif sous le titre
            </small>
          </div>

          <div className="admin-grid-2">
            <div className="form-group">
              <label>Texte bouton principal</label>
              <input
                type="text"
                value={heroData.primary_button_text}
                onChange={(e) => setHeroData(prev => ({ ...prev, primary_button_text: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
            <div className="form-group">
              <label>Lien bouton principal</label>
              <input
                type="text"
                value={heroData.primary_button_link}
                onChange={(e) => setHeroData(prev => ({ ...prev, primary_button_link: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>

          <div className="admin-grid-2" style={{ marginTop: 'var(--space-3)' }}>
            <div className="form-group">
              <label>Texte bouton secondaire</label>
              <input
                type="text"
                value={heroData.secondary_button_text}
                onChange={(e) => setHeroData(prev => ({ ...prev, secondary_button_text: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
            <div className="form-group">
              <label>Lien bouton secondaire</label>
              <input
                type="text"
                value={heroData.secondary_button_link}
                onChange={(e) => setHeroData(prev => ({ ...prev, secondary_button_link: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>
        </div>

        {/* Colonne droite - Image et Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Image */}
          <div className="admin-card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Image size={20} />
              Image Hero
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {heroData.image_url && (
                <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <img
                    src={heroData.image_url}
                    alt="Hero preview"
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setHeroData(prev => ({ ...prev, image_url: '' }))}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white'
                    }}
                    title="Supprimer l'image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <label className="btn btn-secondary" style={{ cursor: 'pointer', justifyContent: 'center' }}>
                <Upload size={18} />
                {uploading ? 'Upload en cours...' : heroData.image_url ? 'Changer l\'image' : 'Ajouter une image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Diaporama arrière-plan */}
          <div className="admin-card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Layers size={20} />
              Diaporama arrière-plan
            </h3>

            {/* Activer/Désactiver le diaporama */}
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={heroData.slideshow_enabled || false}
                  onChange={(e) => setHeroData(prev => ({ ...prev, slideshow_enabled: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Activer le diaporama d'arrière-plan</span>
              </label>
            </div>

            {heroData.slideshow_enabled && (
              <>
                {/* Liste des images */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
                    Images du diaporama ({(heroData.background_images || []).length})
                  </label>

                  {(heroData.background_images || []).length > 0 && (
                    <div className="admin-grid-3" style={{ marginBottom: 'var(--space-2)' }}>
                      {(heroData.background_images || []).map((img, index) => (
                        <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                          <img
                            src={img}
                            alt={`Background ${index + 1}`}
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeBackgroundImage(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'white'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                          <span style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '4px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px'
                          }}>
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={16} />
                    {uploadingBg ? 'Upload...' : 'Ajouter une image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingBg}
                    />
                  </label>
                </div>

                {/* Direction du défilement */}
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label>Direction du défilement</label>
                  <select
                    value={heroData.slideshow_direction || 'left-to-right'}
                    onChange={(e) => setHeroData(prev => ({ ...prev, slideshow_direction: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
                  >
                    <option value="left-to-right">De gauche à droite →</option>
                    <option value="right-to-left">De droite à gauche ←</option>
                    <option value="fade">Fondu enchaîné</option>
                  </select>
                </div>

                {/* Vitesse du diaporama */}
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label>Vitesse de transition ({heroData.slideshow_speed || 5} secondes)</label>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={heroData.slideshow_speed || 5}
                    onChange={(e) => setHeroData(prev => ({ ...prev, slideshow_speed: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Rapide (2s)</span>
                    <span>Lent (15s)</span>
                  </div>
                </div>

                {/* Overlay */}
                <div className="form-group">
                  <label>Overlay (assombrir pour lisibilité)</label>
                  <select
                    value={heroData.slideshow_overlay || 'rgba(0,0,0,0.3)'}
                    onChange={(e) => setHeroData(prev => ({ ...prev, slideshow_overlay: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
                  >
                    <option value="rgba(0,0,0,0)">Aucun</option>
                    <option value="rgba(0,0,0,0.2)">Léger</option>
                    <option value="rgba(0,0,0,0.3)">Moyen</option>
                    <option value="rgba(0,0,0,0.5)">Fort</option>
                    <option value="rgba(0,0,0,0.7)">Très fort</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Taille de l'image */}
          <div className="admin-card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Maximize2 size={20} />
              Taille de l'image
            </h3>

            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label>Taille prédéfinie</label>
              <select
                value={heroData.image_size}
                onChange={(e) => setHeroData(prev => ({ ...prev, image_size: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              >
                <option value="small">Petite (300px max)</option>
                <option value="medium">Moyenne (500px max)</option>
                <option value="large">Grande (700px max)</option>
                <option value="full">Pleine largeur</option>
                <option value="custom">Personnalisée</option>
              </select>
            </div>

            {heroData.image_size === 'custom' && (
              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Largeur max</label>
                  <input
                    type="text"
                    value={heroData.image_max_width}
                    onChange={(e) => setHeroData(prev => ({ ...prev, image_max_width: e.target.value }))}
                    placeholder="ex: 500px"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
                  />
                </div>
                <div className="form-group">
                  <label>Hauteur max</label>
                  <input
                    type="text"
                    value={heroData.image_max_height}
                    onChange={(e) => setHeroData(prev => ({ ...prev, image_max_height: e.target.value }))}
                    placeholder="ex: 400px"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Layout / Position */}
          <div className="admin-card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Move size={20} />
              Disposition
            </h3>

            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label>Position de l'image</label>
              <select
                value={heroData.layout}
                onChange={(e) => setHeroData(prev => ({ ...prev, layout: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              >
                <option value="text-left">Image à droite (Texte à gauche)</option>
                <option value="text-right">Image à gauche (Texte à droite)</option>
                <option value="text-center-top">Image en bas (Texte en haut)</option>
                <option value="text-center-bottom">Image en haut (Texte en bas)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Alignement du contenu</label>
              <select
                value={heroData.content_align}
                onChange={(e) => setHeroData(prev => ({ ...prev, content_align: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              >
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
                <option value="right">Droite</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Couleurs */}
      <div className="admin-card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Palette size={20} />
          Couleurs
        </h3>

        <div className="admin-grid-4">
          {/* Fond */}
          <div className="form-group">
            <label>Fond de section</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="color"
                value={heroData.background_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, background_color: e.target.value }))}
                style={{ width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }}
              />
              <input
                type="text"
                value={heroData.background_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, background_color: e.target.value }))}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>

          {/* Titre */}
          <div className="form-group">
            <label>Couleur du titre</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="color"
                value={heroData.title_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, title_color: e.target.value }))}
                style={{ width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }}
              />
              <input
                type="text"
                value={heroData.title_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, title_color: e.target.value }))}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>

          {/* Sous-titre */}
          <div className="form-group">
            <label>Couleur sous-titre</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="color"
                value={heroData.subtitle_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, subtitle_color: e.target.value }))}
                style={{ width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }}
              />
              <input
                type="text"
                value={heroData.subtitle_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, subtitle_color: e.target.value }))}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>

          {/* Espace */}
          <div></div>

          {/* Bouton Principal - Fond */}
          <div className="form-group">
            <label>Bouton principal (fond)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="color"
                value={heroData.primary_button_bg}
                onChange={(e) => setHeroData(prev => ({ ...prev, primary_button_bg: e.target.value }))}
                style={{ width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }}
              />
              <input
                type="text"
                value={heroData.primary_button_bg}
                onChange={(e) => setHeroData(prev => ({ ...prev, primary_button_bg: e.target.value }))}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>

          {/* Bouton Principal - Texte */}
          <div className="form-group">
            <label>Bouton principal (texte)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="color"
                value={heroData.primary_button_text_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, primary_button_text_color: e.target.value }))}
                style={{ width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }}
              />
              <input
                type="text"
                value={heroData.primary_button_text_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, primary_button_text_color: e.target.value }))}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>

          {/* Bouton Secondaire - Texte */}
          <div className="form-group">
            <label>Bouton secondaire (texte)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="color"
                value={heroData.secondary_button_text_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, secondary_button_text_color: e.target.value, secondary_button_border_color: e.target.value }))}
                style={{ width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }}
              />
              <input
                type="text"
                value={heroData.secondary_button_text_color}
                onChange={(e) => setHeroData(prev => ({ ...prev, secondary_button_text_color: e.target.value, secondary_button_border_color: e.target.value }))}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>

          {/* Bouton Secondaire - Fond */}
          <div className="form-group">
            <label>Bouton secondaire (fond)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="color"
                value={heroData.secondary_button_bg === 'transparent' ? '#ffffff' : heroData.secondary_button_bg}
                onChange={(e) => setHeroData(prev => ({ ...prev, secondary_button_bg: e.target.value }))}
                style={{ width: '50px', height: '40px', padding: '2px', cursor: 'pointer', border: '2px solid var(--border-default)', borderRadius: '8px' }}
              />
              <input
                type="text"
                value={heroData.secondary_button_bg}
                onChange={(e) => setHeroData(prev => ({ ...prev, secondary_button_bg: e.target.value }))}
                placeholder="transparent"
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid var(--border-default)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prévisualisation */}
      <div className="admin-card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Prévisualisation</h3>
        <div style={getPreviewStyle()}>
          {/* Contenu texte */}
          <div style={{
            order: getContentOrder().content,
            textAlign: heroData.content_align,
            display: 'flex',
            flexDirection: 'column',
            alignItems: heroData.content_align === 'center' ? 'center' : heroData.content_align === 'right' ? 'flex-end' : 'flex-start'
          }}>
            <h1 style={{
              color: heroData.title_color,
              fontSize: '1.8rem',
              fontWeight: 'bold',
              marginBottom: 'var(--space-3)',
              margin: '0 0 var(--space-3) 0'
            }}>
              {heroData.title}
            </h1>
            <p style={{
              color: heroData.subtitle_color,
              marginBottom: 'var(--space-4)',
              margin: '0 0 var(--space-4) 0'
            }}>
              {heroData.subtitle}
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: heroData.content_align === 'center' ? 'center' : heroData.content_align === 'right' ? 'flex-end' : 'flex-start'
            }}>
              <button
                style={{
                  background: heroData.primary_button_bg,
                  color: heroData.primary_button_text_color,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {heroData.primary_button_text}
              </button>
              <button
                style={{
                  background: heroData.secondary_button_bg,
                  color: heroData.secondary_button_text_color,
                  padding: '12px 24px',
                  border: `2px solid ${heroData.secondary_button_border_color}`,
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {heroData.secondary_button_text}
              </button>
            </div>
          </div>

          {/* Image */}
          {heroData.image_url && (
            <div style={{
              order: getContentOrder().image,
              textAlign: 'center',
              padding: heroData.layout.includes('center') ? 'var(--space-4) 0' : '0'
            }}>
              <img
                src={heroData.image_url}
                alt="Hero"
                style={{
                  ...getImageSizeStyle(),
                  borderRadius: '12px',
                  objectFit: 'cover',
                  width: '100%'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default HeroPage
