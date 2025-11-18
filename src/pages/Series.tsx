import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiInfo, FiChevronDown } from 'react-icons/fi'
import { API_CONFIG } from '../config/api'

const fetcher = (url: string) => axios.get(url).then((r) => r.data)

interface TVShow {
  id: number
  name: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  first_air_date?: string
  overview?: string
}

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
]

const YEARS = Array.from({ length: 55 }, (_, i) => 2025 - i)

const Series: React.FC = () => {
  const navigate = useNavigate()
  
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  // Build API URL based on filters
  const getApiUrl = () => {
    let url = `${API_CONFIG.TMDB_BASE_URL}/discover/tv?api_key=${API_CONFIG.TMDB_API_KEY}&page=${page}&sort_by=popularity.desc`
    
    if (selectedGenre) {
      url += `&with_genres=${selectedGenre}`
    }
    
    if (selectedYear) {
      url += `&first_air_date_year=${selectedYear}`
    }
    
    return url
  }

  const { data, error, isLoading } = useSWR(getApiUrl(), fetcher)

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedGenre, selectedYear])

  const shows: TVShow[] = data?.results || []

  const handleShowClick = (id: number) => {
    navigate(`/tv/${id}`)
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">TV Series</h1>
          <p className="text-gray-400 text-lg">Discover your next binge-worthy series</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Genre Filter */}
          <div className="relative">
            <select
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-neutral-800 text-white px-4 py-2.5 pr-10 rounded-lg border border-neutral-700 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="">All Genres</option>
              {TV_GENRES.map(genre => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Year Filter */}
          <div className="relative">
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-neutral-800 text-white px-4 py-2.5 pr-10 rounded-lg border border-neutral-700 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="">All Years</option>
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(selectedGenre || selectedYear) && (
            <button
              onClick={() => {
                setSelectedGenre(null)
                setSelectedYear(null)
              }}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-xl">Failed to load TV series</p>
          </div>
        )}

        {/* TV Shows Grid */}
        {!isLoading && !error && shows.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {shows.map((show) => (
                <div
                  key={show.id}
                  onClick={() => handleShowClick(show.id)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800">
                    {show.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                        alt={show.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                      <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition">
                        <FiPlay size={20} />
                      </button>
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm line-clamp-2">{show.name}</p>
                        {show.vote_average > 0 && (
                          <p className="text-yellow-400 text-xs mt-1">★ {show.vote_average.toFixed(1)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="text-white font-medium text-sm line-clamp-1">{show.name}</h3>
                    {show.first_air_date && (
                      <p className="text-gray-400 text-xs mt-1">{show.first_air_date.split('-')[0]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {shows.length >= 20 && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isLoading && !error && shows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No TV series found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Series
