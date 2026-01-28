import React from 'react'
import './HomeProcess.css'
import { processSteps } from '../../assets/homeContent'

const HomeProcess = () => {
  return (
    <section className="home-process section">
      <div className="container">
        <div className="process-header">
          <h2>Comment ça se passe ?</h2>
          <p className="text-secondary">Un processus simple en 4 étapes</p>
        </div>
        <ol className="process-grid">
          {processSteps.map((s, index) => (
            <li key={s.step} className="process-step card">
              <div className="step-number">{s.step}</div>
              <div className="step-content">
                <h3>{s.title}</h3>
                <p className="text-muted">{s.text}</p>
              </div>
              {index < processSteps.length - 1 && (
                <div className="step-connector" aria-hidden="true">→</div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HomeProcess
