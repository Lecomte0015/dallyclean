import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react'
import '../admin/BookingsPage.css'

const FAQsPage = () => {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentFaq, setCurrentFaq] = useState({
    id: null,
    question: '',
    answer: ''
  })

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error('Error loading FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editMode) {
        const { error } = await supabase
          .from('faqs')
          .update({
            question: currentFaq.question,
            answer: currentFaq.answer
          })
          .eq('id', currentFaq.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([{
            question: currentFaq.question,
            answer: currentFaq.answer
          }])

        if (error) throw error
      }

      loadFaqs()
      closeModal()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette FAQ ?')) return

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadFaqs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openAddModal = () => {
    setCurrentFaq({ id: null, question: '', answer: '' })
    setEditMode(false)
    setShowModal(true)
  }

  const openEditModal = (faq) => {
    setCurrentFaq(faq)
    setEditMode(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentFaq({ id: null, question: '', answer: '' })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Gestion des FAQs</h1>
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
            <h1>Gestion des FAQs</h1>
            <p>{faqs.length} question(s)</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter une FAQ
          </button>
        </div>

        <div className="admin-card">
          {faqs.length === 0 ? (
            <div className="empty-state">
              <HelpCircle size={48} />
              <p>Aucune FAQ</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Réponse</th>
                  <th style={{width: '150px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id}>
                    <td>
                      <strong>{faq.question}</strong>
                    </td>
                    <td>
                      <div style={{
                        maxWidth: '400px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-secondary)'
                      }}>
                        {faq.answer}
                      </div>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-icon"
                          onClick={() => openEditModal(faq)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDelete(faq.id)}
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
                <h2>{editMode ? 'Modifier la FAQ' : 'Nouvelle FAQ'}</h2>
                <button onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="question">Question *</label>
                    <input
                      id="question"
                      type="text"
                      value={currentFaq.question}
                      onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                      placeholder="Ex: Quels sont vos tarifs ?"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="answer">Réponse *</label>
                    <textarea
                      id="answer"
                      value={currentFaq.answer}
                      onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                      placeholder="Écrivez la réponse ici..."
                      rows={5}
                      required
                      style={{
                        resize: 'vertical',
                        minHeight: '100px'
                      }}
                    />
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

export default FAQsPage
