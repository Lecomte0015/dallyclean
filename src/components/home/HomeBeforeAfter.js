import React from 'react'
import './HomeBeforeAfter.css'
import { beforeAfter } from '../../assets/homeContent'

const HomeBeforeAfter = () => {
  return (
    <section className="home-beforeafter section bg-soft">
      <div className="container">
        <div className="ba-header">
          <h2>Avant / Après</h2>
          <p className="text-secondary">Découvrez la qualité de notre travail</p>
        </div>
        <div className="ba-grid">
          {beforeAfter.map((item, idx) => (
            <figure className="ba-card card" key={idx}>
              <div className="ba-pair">
                <div className="ba-box before">
                  <div className="ba-label">Avant</div>
                  <div className="ba-content">{item.before}</div>
                </div>
                <div className="ba-box after">
                  <div className="ba-label">Après</div>
                  <div className="ba-content">{item.after}</div>
                </div>
              </div>
              <figcaption className="text-muted">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeBeforeAfter
