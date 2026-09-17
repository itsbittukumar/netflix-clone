import { useEffect, useState } from 'react'
import { IMAGE_BASE, endpoints, fetchFromTMDB } from '../api/tmdb'
import './Banner.css'

function truncate(str, n) {
  if (!str) return ''
  return str.length > n ? str.substring(0, n) + '…' : str
}

export default function Banner() {
  const [item, setItem] = useState(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    (async () => {
      const results = await fetchFromTMDB(endpoints.netflixOriginals)
      if (results.length) {
        setItem(results[Math.floor(Math.random() * results.length)])
      }
    })()
  }, [])

  if (!item) {
    return <div className="nf-banner nf-banner--loading" />
  }

  const backdrop = item.backdrop_path
    ? `${IMAGE_BASE}/original${item.backdrop_path}`
    : null

  return (
    <div
      className="nf-banner"
      style={{ backgroundImage: backdrop ? `url(${backdrop})` : 'linear-gradient(120deg,#1a1a1a,#000)' }}
    >
      <div className="nf-banner__content">
        <h1 className="nf-banner__title">{item.title || item.name}</h1>
        <div className="nf-banner__meta">
          <span className="nf-banner__match">98% Match</span>
          <span>{(item.first_air_date || item.release_date || '').slice(0, 4)}</span>
          <span className="nf-banner__badge">HD</span>
        </div>
        <p className="nf-banner__overview">{truncate(item.overview, 170)}</p>
        <div className="nf-banner__buttons">
          <button className="nf-btn nf-btn--play">▶ Play</button>
          <button className="nf-btn nf-btn--info">ⓘ More Info</button>
        </div>
      </div>
      <button className="nf-banner__mute" onClick={() => setMuted((m) => !m)} aria-label="Toggle sound">
        {muted ? '🔇' : '🔊'}
      </button>
      <div className="nf-banner__fade" />
    </div>
  )
}
