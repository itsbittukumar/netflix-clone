import { useEffect, useState, useRef } from 'react'
import { searchTMDB, IMAGE_BASE } from '../api/tmdb'
import './Navbar.css'

const NAV_LINKS = ['Home', 'TV Shows', 'Movies', 'New & Popular', 'My List']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = setTimeout(async () => {
      if (query.trim().length > 1) {
        setResults(await searchTMDB(query))
      } else {
        setResults([])
      }
    }, 350)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  return (
    <header className={`nf-nav ${scrolled ? 'nf-nav--scrolled' : ''}`}>
      <div className="nf-nav__left">
        <span className="brand-logo">NETFLIX</span>
        <nav className="nf-nav__links nf-nav__links--desktop">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className={l === 'Home' ? 'active' : ''}>{l}</a>
          ))}
        </nav>
        <button className="nf-nav__mobile-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Browse">
          Browse <span className={`caret ${menuOpen ? 'up' : ''}`}>▾</span>
        </button>
        {menuOpen && (
          <div className="nf-nav__mobile-menu">
            {NAV_LINKS.map((l) => <a key={l} href="#">{l}</a>)}
          </div>
        )}
      </div>

      <div className="nf-nav__right">
        <div className={`nf-search ${searchOpen ? 'nf-search--open' : ''}`}>
          <button className="nf-search__icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Search">🔍</button>
          <input
            ref={searchRef}
            className="nf-search__input"
            placeholder="Titles, people, genres"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          />
          {results.length > 0 && (
            <div className="nf-search__results">
              {results.slice(0, 6).map((r) => (
                <div key={r.id} className="nf-search__result">
                  {r.poster_path ? (
                    <img src={`${IMAGE_BASE}/w92${r.poster_path}`} alt={r.title || r.name} />
                  ) : <div className="nf-search__no-img" />}
                  <span>{r.title || r.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="nf-nav__icon" title="Notifications">🔔</span>
        <div className="nf-nav__profile">
          <img
            className="nf-nav__avatar"
            src="https://occ-0-1234-1000.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELVLzoPHZbBAY/AAAABTLbdyOQzWQ2NJ8DwSHqf9WVSaCGkGBwFofqmt-hjJf7_QOF6xzqCw.png?r=1d4"
            alt="Profile"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="caret">▾</span>
          <div className="nf-nav__dropdown">
            <a href="#">Manage Profiles</a>
            <a href="#">Account</a>
            <a href="#">Help Center</a>
            <hr />
            <a href="/login">Sign out of Netflix</a>
          </div>
        </div>
      </div>
    </header>
  )
}
