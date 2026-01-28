import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Upload, Trash2, Copy, Image as ImageIcon, CheckCircle, Filter, X, FileText } from 'lucide-react'
import '../admin/BookingsPage.css'

const MediaPage = () => {
  const [media, setMedia] = useState([])
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadPageId, setUploadPageId] = useState(null)
  const [uploadDescription, setUploadDescription] = useState('')
  const [filterPageId, setFilterPageId] = useState('')
  const [imageType, setImageType] = useState('single')
  const [afterImageFile, setAfterImageFile] = useState(null)

  const BUCKET_NAME = 'images'

  useEffect(() => {
    loadMedia()
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('is_published', true)
        .order('title', { ascending: true })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error('Error loading pages:', error)
    }
  }

  const loadMedia = async () => {
    try {
      let query = supabase
        .from('media')
        .select(`
          *,
          pages:page_id (
            id,
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      console.error('Error loading media:', error)
      alert('Erreur lors du chargement des médias')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Pour before_after, vérifier qu'il y a une image "après"
    if (imageType === 'before_after' && !afterImageFile) {
      alert('Veuillez sélectionner une image "après" pour le mode Avant/Après')
      return
    }

    setUploading(true)

    try {
      for (const file of files) {
        // Upload image "avant" (ou image unique)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uploadData.path)

        let afterUrl = null

        // Si mode avant/après, uploader l'image "après"
        if (imageType === 'before_after' && afterImageFile) {
          const afterFileExt = afterImageFile.name.split('.').pop()
          const afterFileName = `${Date.now()}-after-${Math.random().toString(36).substring(7)}.${afterFileExt}`

          const { data: afterUploadData, error: afterUploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(afterFileName, afterImageFile, {
              cacheControl: '3600',
              upsert: false
            })

          if (afterUploadError) throw afterUploadError

          const { data: { publicUrl: afterPublicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(afterUploadData.path)

          afterUrl = afterPublicUrl
        }

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('media')
          .insert([{
            name: fileName,
            url: publicUrl,
            page_id: uploadPageId ? parseInt(uploadPageId) : null,
            description: uploadDescription || null,
            size: file.size,
            mime_type: file.type,
            image_type: imageType,
            after_url: afterUrl
          }])

        if (dbError) throw dbError
      }

      await loadMedia()
      setShowUploadModal(false)
      setUploadPageId(null)
      setUploadDescription('')
      setImageType('single')
      setAfterImageFile(null)
      event.target.value = ''
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Erreur lors du téléchargement: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (mediaId, fileName) => {
    if (!window.confirm('Supprimer cette image ?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId)

      if (dbError) throw dbError

      loadMedia()
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMedia = filterPageId
    ? media.filter(m => {
        if (filterPageId === 'null') return m.page_id === null
        return m.page_id === parseInt(filterPageId)
      })
    : media

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des médias</h1>
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
            <h1>Gestion des médias</h1>
            <p>{filteredMedia.length} image(s) {filterPageId && '(filtrées)'}</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
            disabled={uploading}
          >
            <Upload size={18} />
            Télécharger des images
          </button>
        </div>

        {/* Filter */}
        <div className="admin-card" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              value={filterPageId}
              onChange={(e) => setFilterPageId(e.target.value)}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer'
              }}
            >
              <option value="">Toutes les images</option>
              <option value="null">Sans page associée</option>
              {pages.map(page => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
            {filterPageId && (
              <button
                onClick={() => setFilterPageId('')}
                style={{
                  padding: 'var(--space-2)',
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Media Grid */}
        <div className="admin-card">
          {filteredMedia.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={48} />
              <p>{filterPageId ? 'Aucune image pour cette page' : 'Aucune image'}</p>
              <small style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                Téléchargez des images pour commencer
              </small>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-4)'
            }}>
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-soft)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '2px solid var(--border-light)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    display: 'flex'
                  }}>
                    {item.image_type === 'before_after' && item.after_url ? (
                      <>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={item.url}
                            alt="Avant"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-semibold)'
                          }}>
                            Avant
                          </div>
                        </div>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={item.after_url}
                            alt="Après"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(34,197,94,0.9)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-semibold)'
                          }}>
                            Après
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.description || item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </div>
                  <div style={{ padding: 'var(--space-3)' }}>
                    {item.pages && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        padding: '4px 8px',
                        background: 'var(--primary-soft)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--primary)',
                        marginBottom: 'var(--space-2)'
                      }}>
                        <FileText size={12} />
                        {item.pages.title}
                      </div>
                    )}
                    {item.description && (
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-2)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.description}
                      </div>
                    )}
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      {formatFileSize(item.size)} • {formatDate(item.created_at)}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-2)'
                    }}>
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="btn btn-outline"
                        style={{
                          flex: 1,
                          fontSize: 'var(--text-sm)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--space-1)'
                        }}
                      >
                        {copiedUrl === item.url ? (
                          <>
                            <CheckCircle size={14} />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copier URL
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Télécharger des images</h2>
                <button onClick={() => setShowUploadModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="page-select">Page de destination (optionnel)</label>
                  <select
                    id="page-select"
                    value={uploadPageId || ''}
                    onChange={(e) => setUploadPageId(e.target.value || null)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-base)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Aucune page (image globale)</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                    ))}
                  </select>
                  <small style={{
                    display: 'block',
                    marginTop: 'var(--space-1)',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--text-xs)'
                  }}>
                    Associez cette image à une page spécifique
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (optionnel)</label>
                  <input
                    id="description"
                    type="text"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Ex: Photo de la salle de bain"
                  />
                </div>

                <div className="form-group">
                  <label>Type d'image</label>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-soft)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer',
                      flex: 1
                    }}>
                      <input
                        type="radio"
                        name="imageType"
                        value="single"
                        checked={imageType === 'single'}
                        onChange={(e) => setImageType(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Photo simple</span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer',
                      flex: 1
                    }}>
                      <input
                        type="radio"
                        name="imageType"
                        value="before_after"
                        checked={imageType === 'before_after'}
                        onChange={(e) => setImageType(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Avant/Après</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>{imageType === 'before_after' ? 'Photo "Avant"' : 'Sélectionner les fichiers'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple={imageType === 'single'}
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2)',
                      border: '2px dashed var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  />
                  <small style={{
                    display: 'block',
                    marginTop: 'var(--space-1)',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--text-xs)'
                  }}>
                    Formats acceptés: JPG, PNG, GIF, WebP
                  </small>
                </div>

                {imageType === 'before_after' && (
                  <div className="form-group">
                    <label>Photo "Après"</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAfterImageFile(e.target.files[0])}
                      disabled={uploading}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2)',
                        border: '2px dashed var(--border-success)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                      }}
                    />
                    {afterImageFile && (
                      <small style={{
                        display: 'block',
                        marginTop: 'var(--space-1)',
                        color: 'var(--success)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        ✓ {afterImageFile.name}
                      </small>
                    )}
                  </div>
                )}

                {uploading && (
                  <div style={{
                    padding: 'var(--space-3)',
                    background: 'var(--primary-soft)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--primary)',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    Upload en cours...
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default MediaPage
