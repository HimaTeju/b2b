import { useRef, useState } from 'react'
import { getListingImageUrl } from '../api/listingImages'
import './ListingGallery.css'

/**
 * Swipeable image gallery for a listing's photos. Scroll-snap drives the
 * touch/swipe experience; the arrow buttons and dots just scroll the same
 * track so all three stay in sync off one `activeIndex`.
 */
function ListingGallery({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef(null)

  if (!images || images.length === 0) {
    return (
      <div className="listing-gallery">
        <div className="listing-gallery__placeholder">⚙</div>
      </div>
    )
  }

  const scrollToIndex = (index) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    if (index !== activeIndex) setActiveIndex(index)
  }

  return (
    <div className="listing-gallery">
      <div className="listing-gallery__viewport">
        <div className="listing-gallery__track" ref={trackRef} onScroll={handleScroll}>
          {images.map((image) => (
            <div className="listing-gallery__slide" key={image.id}>
              <img src={getListingImageUrl(image.storage_path)} alt={alt} />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="listing-gallery__nav listing-gallery__nav--prev"
              aria-label="Previous image"
              onClick={() => scrollToIndex((activeIndex - 1 + images.length) % images.length)}
            >
              ‹
            </button>
            <button
              type="button"
              className="listing-gallery__nav listing-gallery__nav--next"
              aria-label="Next image"
              onClick={() => scrollToIndex((activeIndex + 1) % images.length)}
            >
              ›
            </button>

            <div className="listing-gallery__dots">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={`listing-gallery__dot ${index === activeIndex ? 'listing-gallery__dot--active' : ''}`}
                  aria-label={`Go to image ${index + 1}`}
                  onClick={() => scrollToIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="listing-gallery__thumbs">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`listing-gallery__thumb ${index === activeIndex ? 'listing-gallery__thumb--active' : ''}`}
              onClick={() => scrollToIndex(index)}
            >
              <img src={getListingImageUrl(image.storage_path)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListingGallery
