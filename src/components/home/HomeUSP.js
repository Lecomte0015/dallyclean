import React from 'react'
import './HomeUSP.css'
import { uspItems } from '../../assets/homeContent'

const iconMap = {
  sparkles: '✨',
  clock: '⏱️',
  leaf: '🌿',
  phone: '📞',
  shield: '🛡️'
}

const HomeUSP = () => {
  return (
    <section className="home-usp bg-soft">
      <div className="container">
        <ul className="usp-list">
          {uspItems.map((i) => (
            <li key={i.title} className="usp-item card">
              <div className="usp-icon" aria-hidden>
                {iconMap[i.icon] || '✔️'}
              </div>
              <div className="usp-content">
                <h3>{i.title}</h3>
                <p className="text-muted">{i.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default HomeUSP
