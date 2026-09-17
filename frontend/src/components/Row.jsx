import { useEffect, useRef, useState } from 'react'
import { IMAGE_BASE, fetchFromTMDB } from '../api/tmdb'
import './Row.css'

export default function Row({ title, endpoint, large = false }) {
  const [items, setItems] = useState([])
  const railRef = useRef(null)
  const [showArrows, setShowArrows] = useState(false)

  useEffect(() => {
    (async () => {
      const results = await fetchFromTMDB(endpoint)
      setItems(results.filter((r) => r.backdrop_path || r.poster_path))
    })()
  }, [endpoint])

  const scroll = (dir) => {
    if (!railRef.current) return
    const { clientWidth } = railRef.current
    railRef.current.scrollBy({ left: dir === 'left' ? -clientWidth * 0.9 : clientWidth * 0.9, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <div
      className="nf-row"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h2 className="nf-row__title">{title}</h2>
      <div className="nf-row__wrapper">
        {showArrows && (
          <button className="nf-row__arrow nf-row__arrow--left" onClick={() => scroll('left')} aria-label="Scroll left">‹</button>
        )}
        <div className="nf-row__rail" ref={railRef}>
          {items.map((item) => {
            const img = large ? item.poster_path : (item.backdrop_path || item.poster_path)
            if (!img) return null
            return (
              <div key={item.id} className={`nf-card ${large ? 'nf-card--large' : ''}`}>
                <img
                  src={`${IMAGE_BASE}/${large ? 'w342' : 'w500'}${img}`}
                  alt={item.title || item.name}
                  loading="lazy"
                />
                <div className="nf-card__hover">
                  <div className="nf-card__hover-img" style={{ backgroundImage: `url(${IMAGE_BASE}/w500${item.backdrop_path || item.poster_path})` }} />
                  <div className="nf-card__info">
                    <div className="nf-card__actions">
                      <button className="nf-icon-btn nf-icon-btn--play" title="Play">▶</button>
                      <button className="nf-icon-btn" title="Add to My List">＋</button>
                      <button className="nf-icon-btn" title="Like">👍</button>
                      <button className="nf-icon-btn nf-icon-btn--more" title="More Info">▾</button>
                    </div>
                    <div className="nf-card__meta">
                      <span className="nf-card__match">{Math.round((item.vote_average || 5) * 10)}% Match</span>
                      {item.adult === false && <span className="nf-card__age">U/A 13+</span>}
                    </div>
                    <p className="nf-card__name">{item.title || item.name}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {showArrows && (
          <button className="nf-row__arrow nf-row__arrow--right" onClick={() => scroll('right')} aria-label="Scroll right">›</button>
        )}
      </div>
    </div>
  )
}
