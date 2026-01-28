import React, { useState } from 'react'
import './BeforeAfterSlider.css'

const BeforeAfterSlider = ({ beforeImage, afterImage, alt = 'Comparaison', interactive = true }) => {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (e) => {
    if (!interactive) return
    if (!isDragging && e.type !== 'click') return

    e.stopPropagation() // Empêcher la propagation pour éviter l'ouverture du lightbox
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

    setSliderPosition(percentage)
  }

  const handleMouseDown = (e) => {
    if (!interactive) return
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    if (!interactive) return
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (!interactive) return
    e.stopPropagation()
    setIsDragging(true)
  }

  return (
    <div
      className="before-after-slider"
      onMouseMove={handleMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={() => setIsDragging(false)}
      onClick={handleMove}
      style={{ cursor: interactive ? 'ew-resize' : 'pointer' }}
    >
      {/* Image "Après" (dessous) */}
      <div className="after-image-container">
        <img src={afterImage} alt={`${alt} - Après`} />
        <div className="image-label after-label">Après</div>
      </div>

      {/* Image "Avant" (dessus avec clip) */}
      <div
        className="before-image-container"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={beforeImage} alt={`${alt} - Avant`} />
        <div className="image-label before-label">Avant</div>
      </div>

      {/* Slider handle */}
      <div
        className="slider-handle"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="slider-line"></div>
        <div className="slider-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default BeforeAfterSlider
