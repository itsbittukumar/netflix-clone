import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Row from './components/Row'
import Footer from './components/Footer'
import { endpoints, hasApiKey } from './api/tmdb'
import './App.css'

export default function App() {
  return (
    <div className="nf-app">
      <Navbar />

      {!hasApiKey() && (
        <div className="nf-api-warning">
          No TMDB API key detected. Copy <code>.env.example</code> to <code>.env</code> and set{' '}
          <code>VITE_TMDB_API_KEY</code> to load real movie posters and titles.
        </div>
      )}

      <Banner />

      <main className="nf-rows">
        <Row title="Netflix Originals" endpoint={endpoints.netflixOriginals} large />
        <Row title="Trending Now" endpoint={endpoints.trending} />
        <Row title="Top Rated" endpoint={endpoints.topRated} />
        <Row title="Action Thrillers" endpoint={endpoints.actionMovies} />
        <Row title="Comedies" endpoint={endpoints.comedyMovies} />
        <Row title="Scary Movies" endpoint={endpoints.horrorMovies} />
        <Row title="Romance Movies" endpoint={endpoints.romanceMovies} />
        <Row title="Documentaries" endpoint={endpoints.documentaries} />
      </main>

      <Footer />
    </div>
  )
}
