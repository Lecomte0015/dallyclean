import React, { useEffect, useState } from 'react'
import './HomeFAQ.css'
import { faqs as localFaqs } from '../../assets/homeContent'
import { supabase } from '../../lib/supabaseClient'

const HomeFAQ = () => {
  const [faqs, setFaqs] = useState(localFaqs)

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('question, answer')
          .order('display_order', { ascending: true })
        if (error) throw error
        if (data && data.length) {
          // Mapper les nouvelles colonnes vers l'ancien format pour compatibilité
          const mappedFaqs = data.map(faq => ({
            q: faq.question,
            a: faq.answer
          }))
          setFaqs(mappedFaqs)
        }
      } catch (_) {
        setFaqs(localFaqs)
      }
    }
    loadFaqs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="home-faq section">
      <div className="container">
        <div className="faq-header">
          <h2>Questions fréquentes</h2>
          <p className="text-secondary">Trouvez les réponses à vos questions</p>
        </div>
        <div className="faq-list">
          {faqs.map((f, idx) => (
            <details key={idx} className="faq-item card">
              <summary>
                <span className="question-text">{f.q}</span>
                <span className="faq-icon">+</span>
              </summary>
              <p className="answer-text">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeFAQ
