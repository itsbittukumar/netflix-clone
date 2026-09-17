import axios from 'axios'

// TMDB (The Movie Database) is used to pull real movie/show posters, banners,
// titles and descriptions so the UI feels like a real streaming catalog
// instead of placeholder data. Get a free key at:
// https://www.themoviedb.org/settings/api
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export const IMAGE_BASE = 'https://image.tmdb.org/t/p'

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY }
})

export const endpoints = {
  netflixOriginals: '/discover/tv?with_networks=213',
  trending: '/trending/all/week',
  topRated: '/movie/top_rated',
  actionMovies: '/discover/movie?with_genres=28',
  comedyMovies: '/discover/movie?with_genres=35',
  horrorMovies: '/discover/movie?with_genres=27',
  romanceMovies: '/discover/movie?with_genres=10749',
  documentaries: '/discover/movie?with_genres=99'
}

export async function fetchFromTMDB(path) {
  try {
    const { data } = await tmdb.get(path)
    return data.results || []
  } catch (err) {
    console.error('TMDB request failed for', path, err?.message)
    return []
  }
}

export async function searchTMDB(query) {
  if (!query) return []
  try {
    const { data } = await tmdb.get('/search/multi', { params: { query } })
    return (data.results || []).filter((r) => r.poster_path)
  } catch (err) {
    console.error('TMDB search failed', err?.message)
    return []
  }
}

export function hasApiKey() {
  return Boolean(API_KEY) && API_KEY !== 'your_tmdb_v3_api_key_here'
}
