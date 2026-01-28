import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Check, AlertCircle } from 'lucide-react'
import './service-detail.css'

const ServiceDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    console.log('🔄 USEEFFECT DÉCLENCHÉ - slug:', slug)
    // IMPORTANT: Réinitialiser les options à chaque changement de service
    setOptions([])
    setSelectedOptions({})
    setTotalPrice(0)
    loadServiceAndOptions()
  }, [slug])

  // Calculer le prix total quand les options changent
  useEffect(() => {
    if (service) {
      calculateTotalPrice()
    }
  }, [selectedOptions, service])

  const loadServiceAndOptions = async () => {
    try {
      // Charger le service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single()

      if (serviceError) throw serviceError

      if (!serviceData) {
        throw new Error('Service not found')
      }

      console.log('🔍 SERVICE CHARGÉ:', {
        id: serviceData.id,
        name: serviceData.name,
        slug: serviceData.slug,
        has_options: serviceData.has_options
      })

      setService(serviceData)

      // Charger les options et leurs choix si le service a des options
      if (serviceData.has_options) {
        const { data: optionsData, error: optionsError } = await supabase
          .from('service_options')
          .select(`
            *,
            choices:service_option_choices(*)
          `)
          .eq('service_id', serviceData.id)
          .order('display_order', { ascending: true })

        if (optionsError) throw optionsError

        console.log('📋 OPTIONS CHARGÉES:', optionsData)
        console.log('📋 Nombre d\'options:', optionsData?.length || 0)

        // Trier les choix par display_order
        const sortedOptions = (optionsData || []).map(option => ({
          ...option,
          choices: (option.choices || []).sort((a, b) => a.display_order - b.display_order)
        }))

        console.log('✅ OPTIONS TRIÉES:', sortedOptions)

        // Debug: afficher chaque option en détail
        sortedOptions.forEach((opt, index) => {
          console.log(`📌 OPTION ${index + 1}:`, {
            id: opt.id,
            name: opt.name,
            type: opt.type,
            is_required: opt.is_required,
            nombre_choix: opt.choices?.length || 0,
            choix: opt.choices?.map(c => ({ id: c.id, label: c.label, price_modifier: c.price_modifier }))
          })
        })

        setOptions(sortedOptions)

        // Initialiser les options requises avec le premier choix
        const initialSelections = {}
        sortedOptions.forEach(option => {
          if (option.is_required && option.choices.length > 0) {
            initialSelections[option.id] = option.choices[0].id
          }
        })
        setSelectedOptions(initialSelections)
      }
    } catch (error) {
      console.error('Error loading service:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalPrice = () => {
    let total = parseFloat(service.base_price || 0)

    // Ajouter les modificateurs de prix des options sélectionnées
    Object.entries(selectedOptions).forEach(([optionId, choiceId]) => {
      const option = options.find(o => o.id === parseInt(optionId))
      if (option) {
        const choice = option.choices.find(c => c.id === choiceId)
        if (choice) {
          total += parseFloat(choice.price_modifier || 0)
        }
      }
    })

    setTotalPrice(total)
  }

  const handleOptionChange = (optionId, choiceId) => {
    setSelectedOptions({
      ...selectedOptions,
      [optionId]: choiceId
    })
  }

  const handleBooking = () => {
    // Préparer les données à transmettre au formulaire de réservation
    const bookingData = {
      service_id: service.id,
      service_name: service.name,
      base_price: service.base_price,
      total_price: totalPrice,
      selected_options: Object.entries(selectedOptions).map(([optionId, choiceId]) => {
        const option = options.find(o => o.id === parseInt(optionId))
        const choice = option?.choices.find(c => c.id === choiceId)
        return {
          option_id: parseInt(optionId),
          option_name: option?.name,
          choice_id: choiceId,
          choice_label: choice?.label,
          price_modifier: choice?.price_modifier || 0
        }
      })
    }

    // Naviguer vers la page de réservation avec les données
    navigate('/booking', { state: { bookingData } })
  }

  const canBook = () => {
    // Vérifier que toutes les options requises sont sélectionnées
    return options.every(option => {
      if (option.is_required) {
        return selectedOptions[option.id] !== undefined
      }
      return true
    })
  }

  if (loading) {
    return (
      <div className="service-detail-container">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (notFound || !service) {
    return (
      <div className="service-detail-container">
        <div className="container">
          <div className="service-not-found">
            <h2>Service non trouvé</h2>
            <p>Le service que vous recherchez n'existe pas.</p>
            <Link to="/services" className="btn btn-primary">
              Voir tous les services
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="service-detail-container">
      <div className="container">
        <div className="service-detail-content">
          <div className="service-detail-header">
            <Link to="/services" className="back-link">
              ← Retour aux services
            </Link>
            
          </div>

          <div className="service-detail-grid">
            {service.image_url && (
              <div className="service-detail-image">
                <img src={service.image_url} alt={service.name} />
              </div>
            )}

            <div className="service-detail-info">
              {/* Description */}
              <div className="service-detail-section">
                <h1>{service.page_title || 'Configurez votre service'}</h1>
              </div>

              {/* Options configurables */}
              {options.length > 0 && (
                <div className="service-detail-section">
                  

                  {options.map((option) => (
                    <div key={option.id} className="service-option">
                      <div className="option-header">
                        <label className="option-label">
                          {option.name}
                          {option.is_required && <span className="required-badge">Requis</span>}
                        </label>
                      </div>

                      {option.choices && option.choices.length === 0 && (
                        <div style={{
                          padding: '12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          color: '#ef4444',
                          fontSize: '14px',
                          marginBottom: '12px'
                        }}>
                          ⚠️ Aucun choix disponible pour cette option. Veuillez créer des choix dans le back-office.
                        </div>
                      )}

                      <div className="option-choices">
                        {option.type === 'select' ? (
                          <select
                            value={selectedOptions[option.id] || ''}
                            onChange={(e) => handleOptionChange(option.id, parseInt(e.target.value))}
                            className="option-select"
                            required={option.is_required}
                          >
                            {!option.is_required && <option value="">-- Aucun --</option>}
                            {option.choices.map((choice) => (
                              <option key={choice.id} value={choice.id}>
                                {choice.label}
                                {choice.price_modifier !== 0 && ` (${choice.price_modifier > 0 ? '+' : ''}${choice.price_modifier}€)`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="option-radio-group">
                            {option.choices.map((choice) => {
                              const isSelected = selectedOptions[option.id] === choice.id
                              return (
                                <label
                                  key={choice.id}
                                  className={`option-radio-item ${isSelected ? 'selected' : ''}`}
                                  style={{
                                    borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
                                    background: isSelected ? 'rgba(59, 130, 246, 0.1)' : '#fff',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.background = isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.05)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.15)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : '#e5e7eb'
                                    e.currentTarget.style.background = isSelected ? 'rgba(59, 130, 246, 0.1)' : '#fff'
                                    e.currentTarget.style.transform = ''
                                    e.currentTarget.style.boxShadow = isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : ''
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`option-${option.id}`}
                                    value={choice.id}
                                    checked={isSelected}
                                    onChange={() => handleOptionChange(option.id, choice.id)}
                                    required={option.is_required}
                                    style={{ accentColor: '#3b82f6' }}
                                  />
                                  <div className="radio-content">
                                    <span className="radio-label">{choice.label}</span>
                                    {choice.price_modifier !== 0 && (
                                      <span className="radio-price" style={{ color: '#3b82f6' }}>
                                        {choice.price_modifier > 0 ? '+' : ''}{choice.price_modifier}€
                                      </span>
                                    )}
                                    {isSelected && (
                                      <Check size={18} className="radio-check" />
                                    )}
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prix */}
              <div className="service-detail-section">
                <div className="service-price-summary">
                  <div className="price-breakdown">
                    {service.has_options && options.length > 0 ? (
                      <>
                        <div className="price-line">
                          <span>Prix de base</span>
                          <span>{service.base_price?.toFixed(2) || '0.00'}€</span>
                        </div>
                        {Object.entries(selectedOptions).map(([optionId, choiceId]) => {
                          const option = options.find(o => o.id === parseInt(optionId))
                          const choice = option?.choices.find(c => c.id === choiceId)
                          if (choice && choice.price_modifier !== 0) {
                            return (
                              <div key={optionId} className="price-line modifier">
                                <span>{option.name}: {choice.label}</span>
                                <span>{choice.price_modifier > 0 ? '+' : ''}{choice.price_modifier.toFixed(2)}€</span>
                              </div>
                            )
                          }
                          return null
                        })}
                        <div className="price-line total">
                          <span>Total</span>
                          <span className="total-amount">{totalPrice.toFixed(2)}€</span>
                        </div>
                      </>
                    ) : service.price ? (
                      <div className="price-line total">
                        <span>Tarif</span>
                        <span className="total-amount">{service.price}</span>
                      </div>
                    ) : (
                      <p className="text-secondary">Tarif sur devis</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="service-detail-actions">
                {!canBook() && (
                  <div className="booking-warning">
                    <AlertCircle size={18} />
                    <span>Veuillez sélectionner toutes les options requises</span>
                  </div>
                )}
                <button
                  onClick={handleBooking}
                  disabled={!canBook()}
                  className="btn btn-primary btn-lg"
                >
                  Réserver ce service
                </button>
                <Link to="/contact" className="btn btn-outline btn-lg">
                  Demander un devis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ServiceDetail
