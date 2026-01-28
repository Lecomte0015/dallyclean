import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Edit, Trash2, FileText, Eye, EyeOff, Menu, Upload, X, Image } from 'lucide-react'
import '../admin/BookingsPage.css'

const PagesPage = () => {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState({
    id: null,
    title: '',
    content: '',
    meta_description: '',
    category: 'page',
    show_in_navbar: false,
    navbar_order: 0,
    images: [],
    is_published: true
  })

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadedUrls = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} n'est pas une image`)
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} est trop grande (max 5MB)`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `pages/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(uploadData.path)

        uploadedUrls.push(publicUrl)
      }

      setCurrentPage({
        ...currentPage,
        images: [...(currentPage.images || []), ...uploadedUrls]
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Erreur lors de l\'upload des images')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (indexToRemove) => {
    setCurrentPage({
      ...currentPage,
      images: currentPage.images.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        title: currentPage.title,
        content: currentPage.content,
        meta_description: currentPage.meta_description || null,
        category: currentPage.category || 'page',
        show_in_navbar: currentPage.show_in_navbar || false,
        navbar_order: currentPage.navbar_order || 0,
        images: currentPage.images || [],
        is_published: currentPage.is_published
      }

      if (editMode) {
        const { error } = await supabase
          .from('pages')
          .update(payload)
          .eq('id', currentPage.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([payload])

        if (error) throw error
      }

      loadPages()
      closeModal()
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Erreur lors de la sauvegarde: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette page ?')) return

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openAddModal = () => {
    setCurrentPage({
      id: null,
      title: '',
      content: '',
      meta_description: '',
      category: 'page',
      show_in_navbar: false,
      navbar_order: 0,
      images: [],
      is_published: true
    })
    setEditMode(false)
    setShowModal(true)
  }

  const openEditModal = (page) => {
    setCurrentPage({
      id: page.id,
      title: page.title || '',
      content: page.content || '',
      meta_description: page.meta_description || '',
      category: page.category || 'page',
      show_in_navbar: page.show_in_navbar || false,
      navbar_order: page.navbar_order || 0,
      images: Array.isArray(page.images) ? page.images : [],
      is_published: page.is_published !== false
    })
    setEditMode(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentPage({
      id: null,
      title: '',
      content: '',
      meta_description: '',
      category: 'page',
      show_in_navbar: false,
      navbar_order: 0,
      images: [],
      is_published: true
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des pages</h1>
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="bookings-page">
        <div className="admin-page-header">
          <div>
            <h1>Gestion des pages</h1>
            <p>{pages.length} page(s) • {pages.filter(p => p.is_published).length} publiée(s)</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter une page
          </button>
        </div>

        <div className="admin-card">
          {pages.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>Aucune page</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Navbar</th>
                  <th>Statut</th>
                  <th>Créée le</th>
                  <th style={{width: '150px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <strong>{page.title}</strong>
                      {page.meta_description && (
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-muted)',
                          marginTop: '4px'
                        }}>
                          {page.meta_description.substring(0, 60)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        background: 'var(--bg-soft)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        {page.category === 'gallery' ? '🖼️ Galerie' :
                         page.category === 'custom' ? '⚙️ Personnalisée' :
                         '📄 Page'}
                      </span>
                    </td>
                    <td>
                      {page.show_in_navbar && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-semibold)'
                        }}>
                          <Menu size={12} />
                          #{page.navbar_order}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        background: page.is_published
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(107, 114, 128, 0.1)',
                        color: page.is_published ? '#10b981' : '#6b7280',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)'
                      }}>
                        {page.is_published ? (
                          <>
                            <Eye size={12} />
                            Publiée
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            Brouillon
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {formatDate(page.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-icon"
                          onClick={() => openEditModal(page)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDelete(page.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editMode ? 'Modifier la page' : 'Nouvelle page'}</h2>
                <button onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="title">Titre de la page *</label>
                    <input
                      id="title"
                      type="text"
                      value={currentPage.title}
                      onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                      placeholder="Ex: À propos de nous"
                      required
                    />
                    <small style={{
                      display: 'block',
                      marginTop: 'var(--space-1)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}>
                      Le slug sera généré automatiquement
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="meta_description">Description SEO</label>
                    <textarea
                      id="meta_description"
                      value={currentPage.meta_description}
                      onChange={(e) => setCurrentPage({ ...currentPage, meta_description: e.target.value })}
                      placeholder="Description pour les moteurs de recherche..."
                      rows="2"
                      style={{resize: 'vertical'}}
                      maxLength={160}
                    />
                    <small style={{
                      display: 'block',
                      marginTop: 'var(--space-1)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}>
                      Max 160 caractères
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Catégorie de la page *</label>
                    <select
                      id="category"
                      value={currentPage.category}
                      onChange={(e) => setCurrentPage({ ...currentPage, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-base)',
                        cursor: 'pointer'
                      }}
                      required
                    >
                      <option value="page">📄 Page standard</option>
                      <option value="gallery">🖼️ Galerie photos</option>
                      <option value="custom">⚙️ Page personnalisée</option>
                    </select>
                    <small style={{
                      display: 'block',
                      marginTop: 'var(--space-1)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}>
                      Choisissez le type de page à créer
                    </small>
                  </div>

                  <div className="form-group">
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <input
                        type="checkbox"
                        checked={currentPage.show_in_navbar}
                        onChange={(e) => setCurrentPage({ ...currentPage, show_in_navbar: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <span>Afficher dans la barre de navigation</span>
                      <Menu size={16} style={{color: currentPage.show_in_navbar ? '#3b82f6' : '#6b7280'}} />
                    </label>
                    {currentPage.show_in_navbar && (
                      <div style={{ marginTop: 'var(--space-2)' }}>
                        <label htmlFor="navbar_order" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          Position dans la navbar
                        </label>
                        <input
                          id="navbar_order"
                          type="number"
                          min="0"
                          value={currentPage.navbar_order}
                          onChange={(e) => setCurrentPage({ ...currentPage, navbar_order: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          style={{
                            width: '100px',
                            marginTop: 'var(--space-1)',
                            padding: 'var(--space-2)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-md)'
                          }}
                        />
                        <small style={{
                          display: 'block',
                          marginTop: 'var(--space-1)',
                          color: 'var(--text-muted)',
                          fontSize: 'var(--text-xs)'
                        }}>
                          0 = première position, 1 = deuxième, etc.
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <Image size={18} />
                        <span>Images de la page</span>
                      </div>
                    </label>

                    {currentPage.images && currentPage.images.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 'var(--space-3)',
                        marginBottom: 'var(--space-3)'
                      }}>
                        {currentPage.images.map((imageUrl, index) => (
                          <div key={index} style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            border: '2px solid var(--border-light)'
                          }}>
                            <img
                              src={imageUrl}
                              alt={`Image ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{
                      border: '2px dashed var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      background: uploading ? 'var(--bg-soft)' : 'transparent'
                    }}
                    onClick={() => document.getElementById('image-upload').click()}
                    >
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                      <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }} />
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter des images'}
                      </p>
                      <small style={{
                        display: 'block',
                        marginTop: 'var(--space-1)',
                        color: 'var(--text-muted)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        Formats acceptés: JPG, PNG, GIF (max 5MB par image)
                      </small>
                    </div>

                    <small style={{
                      display: 'block',
                      marginTop: 'var(--space-2)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}>
                      {currentPage.category === 'gallery'
                        ? 'Ces images seront affichées dans la galerie de la page'
                        : 'Vous pouvez utiliser ces images dans le contenu de la page'}
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="content">Contenu *</label>
                    <textarea
                      id="content"
                      value={currentPage.content}
                      onChange={(e) => setCurrentPage({ ...currentPage, content: e.target.value })}
                      placeholder="Écrivez le contenu de la page ici..."
                      rows={10}
                      required
                      style={{
                        resize: 'vertical',
                        minHeight: '200px',
                        fontFamily: 'monospace'
                      }}
                    />
                    <small style={{
                      display: 'block',
                      marginTop: 'var(--space-1)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}>
                      Vous pouvez utiliser du HTML pour formatter le contenu
                    </small>
                  </div>

                  <div className="form-group">
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={currentPage.is_published}
                        onChange={(e) => setCurrentPage({ ...currentPage, is_published: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <span>Publier cette page</span>
                      {currentPage.is_published ? (
                        <Eye size={16} style={{color: '#10b981'}} />
                      ) : (
                        <EyeOff size={16} style={{color: '#6b7280'}} />
                      )}
                    </label>
                    <small style={{
                      display: 'block',
                      marginTop: 'var(--space-1)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}>
                      Les pages non publiées ne seront pas visibles sur le site
                    </small>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default PagesPage
