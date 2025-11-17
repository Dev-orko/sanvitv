import React, { useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/layout/Hero'
import Row from '../components/layout/Row'

type SectionKey = 'home' | 'movies' | 'series' | 'new'

interface RowDefinition {
  key: string
  title: string
  endpoint: string
}

const SECTION_ROWS: Record<SectionKey, RowDefinition[]> = {
  home: [
    { key: 'trending-all', title: 'Trending Now', endpoint: '/trending/all/week' },
    { key: 'in-theaters', title: 'In Theaters', endpoint: '/movie/now_playing' },
    { key: 'popular-movies', title: 'Popular Movies', endpoint: '/movie/popular' },
    { key: 'popular-tv', title: 'Popular TV Shows', endpoint: '/tv/popular' },
    { key: 'top-rated-movies', title: 'Top Rated Movies', endpoint: '/movie/top_rated' },
    { key: 'family-night', title: 'Family Picks', endpoint: '/discover/movie?with_genres=10751' },
    { key: 'sci-fi', title: 'Science Fiction', endpoint: '/discover/movie?with_genres=878' }
  ],
  movies: [
    { key: 'trending-movies', title: 'Trending Movies', endpoint: '/trending/movie/week' },
    { key: 'movies-now-playing', title: 'Now Playing', endpoint: '/movie/now_playing' },
    { key: 'movies-popular', title: 'Popular Movies', endpoint: '/movie/popular' },
    { key: 'movies-top-rated', title: 'Top Rated Movies', endpoint: '/movie/top_rated' },
    { key: 'movies-upcoming', title: 'Upcoming Releases', endpoint: '/movie/upcoming' },
    { key: 'movies-action', title: 'Action and Adventure', endpoint: '/discover/movie?with_genres=28,12' },
    { key: 'movies-comedy', title: 'Comedy Hits', endpoint: '/discover/movie?with_genres=35' },
    { key: 'movies-horror', title: 'Horror Highlights', endpoint: '/discover/movie?with_genres=27' },
    { key: 'movies-animation', title: 'Animated Favorites', endpoint: '/discover/movie?with_genres=16' }
  ],
  series: [
    { key: 'trending-tv', title: 'Trending TV', endpoint: '/trending/tv/week' },
    { key: 'tv-popular', title: 'Popular TV Shows', endpoint: '/tv/popular' },
    { key: 'tv-top-rated', title: 'Top Rated TV', endpoint: '/tv/top_rated' },
    { key: 'tv-on-air', title: 'Currently Airing', endpoint: '/tv/on_the_air' },
    { key: 'tv-airing-today', title: 'Airing Today', endpoint: '/tv/airing_today' },
    { key: 'tv-drama', title: 'Drama and Suspense', endpoint: '/discover/tv?with_genres=18,9648,80' },
    { key: 'tv-documentary', title: 'Documentary Series', endpoint: '/discover/tv?with_genres=99' },
    { key: 'tv-animation', title: 'Animated Series', endpoint: '/discover/tv?with_genres=16' }
  ],
  new: [
    { key: 'trending-today', title: 'Trending Today', endpoint: '/trending/all/day' },
    { key: 'trending-week', title: 'Trending This Week', endpoint: '/trending/all/week' },
    { key: 'upcoming-movies', title: 'Coming Soon', endpoint: '/movie/upcoming' },
    { key: 'now-playing-new', title: 'Now Playing In Theaters', endpoint: '/movie/now_playing' },
    { key: 'tv-on-the-air', title: 'New Episodes', endpoint: '/tv/on_the_air' },
    { key: 'tv-airing-today-new', title: 'Fresh On TV Today', endpoint: '/tv/airing_today' }
  ]
}

const HERO_VARIANT: Record<SectionKey, 'all' | 'movie' | 'tv'> = {
  home: 'all',
  movies: 'movie',
  series: 'tv',
  new: 'all'
}

const parseSection = (search: string): SectionKey => {
  const value = new URLSearchParams(search).get('section')
  if (value === 'movies' || value === 'series' || value === 'new') {
    return value
  }
  return 'home'
}

export default function OptimizedHome() {
  const location = useLocation()
  const activeSection = useMemo<SectionKey>(() => parseSection(location.search), [location.search])

  const rows = useMemo(() => SECTION_ROWS[activeSection], [activeSection])
  const heroVariant = HERO_VARIANT[activeSection]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection])

  return (
    <div className="relative min-h-screen bg-black text-white">
      <main className="relative z-10">
        <Hero variant={heroVariant} />

        <div className="py-12 space-y-16">
          {rows.map((row) => (
            <Row key={row.key} title={row.title} endpoint={row.endpoint} />
          ))}
        </div>
      </main>
    </div>
  )
}
