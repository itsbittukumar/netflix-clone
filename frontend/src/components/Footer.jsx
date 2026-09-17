import './Footer.css'

const COLUMNS = [
  ['FAQ', 'Investor Relations', 'Privacy', 'Speed Test'],
  ['Help Center', 'Jobs', 'Cookie Preferences', 'Legal Notices'],
  ['Account', 'Ways to Watch', 'Corporate Information', 'Only on Netflix'],
  ['Media Center', 'Terms of Use', 'Contact Us', '']
]

export default function Footer() {
  return (
    <footer className="nf-footer">
      <div className="nf-footer__inner">
        <p className="nf-footer__questions">Questions? Call 1-844-505-2993</p>
        <div className="nf-footer__grid">
          {COLUMNS.map((col, i) => (
            <ul key={i}>
              {col.filter(Boolean).map((item) => (
                <li key={item}><a href="#">{item}</a></li>
              ))}
            </ul>
          ))}
        </div>
        <button className="nf-footer__lang">🌐 English</button>
        <p className="nf-footer__copy">
          This is a portfolio clone project built for learning purposes and is not affiliated with Netflix, Inc.
          Movie data provided by TMDB.
        </p>
      </div>
    </footer>
  )
}
