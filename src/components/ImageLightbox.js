import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import BeforeAfterSlider from './BeforeAfterSlider'
import './ImageLightbox.css'

const ImageLightbox = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [currentIndex])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const currentImage = images[currentIndex]

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="lightbox-close" onClick={onClose} aria-label="Fermer">
          <X size={24} />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              className="lightbox-nav lightbox-nav-prev"
              onClick={handlePrevious}
              aria-label="Image précédente"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="lightbox-nav lightbox-nav-next"
              onClick={handleNext}
              aria-label="Image suivante"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Image display */}
        <div className="lightbox-image-container">
          {currentImage.type === 'before_after' && currentImage.afterUrl ? (
            <div className="lightbox-before-after">
              <BeforeAfterSlider
                beforeImage={currentImage.url}
                afterImage={currentImage.afterUrl}
                alt={currentImage.alt}
                interactive={true}
              />
            </div>
          ) : (
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="lightbox-image"
            />
          )}
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Image description */}
        {currentImage.alt && (
          <div className="lightbox-description">
            {currentImage.alt}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageLightbox
