import React, { useState, memo } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiPlay, FiPlus, FiStar } from 'react-icons/fi'
import { API_CONFIG } from '../../config/api'

const fetcher = (url: string) => axios.get(url).then(r => r.data)

interface Movie {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: string
}

interface RowProps {
  title: string
  endpoint: string
}

// Optimized Movie Card Component
const MovieCard = memo(({ movie, index, onPlay }: { movie: Movie; index: number; onPlay: () => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      className="group cursor-pointer touch-target"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
    >
      {/* Movie Card */}
      <div className={`relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-white/10 transition-all duration-300 transform active:scale-95 ${isHovered ? 'scale-105 border-red-500/50 shadow-2xl shadow-red-500/20 -translate-y-2' : ''}`}>
        {/* Poster Container */}
        <div style={{ aspectRatio: '27/40' }} className="relative overflow-hidden">
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/270x400/1a1a1a/ef4444?text=No+Image'
            }
            alt={movie.title || movie.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`}
            loading="lazy"
          />

          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center">
              <motion.button
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="p-4 bg-red-600/90 backdrop-blur-sm rounded-full shadow-2xl border-2 border-white/20 hover:bg-red-500 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlay()
                }}
              >
                <FiPlay size={24} className="text-white" />
              </motion.button>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg border border-red-500/30">
            <div className="flex items-center space-x-1">
              <FiStar size={12} className="text-yellow-400" />
              <span className="text-white text-xs sm:text-sm font-bold">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          {isHovered && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-between">
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-red-500/50 transition-colors duration-200"
              >
                <FiPlus size={16} className="text-white" />
              </button>
              
              <div className="px-3 py-1 bg-red-600/90 backdrop-blur-sm rounded-full border border-red-400/50">
                <span className="text-white text-xs font-bold">WATCH</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movie Info */}
      <div className="mt-4 px-1">
        <h3 className={`font-bold text-white text-sm mb-1 truncate transition-colors duration-200 ${isHovered ? 'text-red-400' : ''}`}>
          {movie.title || movie.name}
        </h3>
        <p className="text-gray-400 text-xs">
          {(movie.release_date || movie.first_air_date || '').slice(0, 4)}
        </p>
      </div>
    </div>
  )
})

MovieCard.displayName = 'MovieCard'

const OptimizedRow = ({ title, endpoint }: RowProps) => {
  const navigate = useNavigate()
  
  const { data, error, isLoading } = useSWR(
    endpoint ? `${API_CONFIG.TMDB_BASE_URL}${endpoint}?api_key=${API_CONFIG.TMDB_API_KEY}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000 // 1 minute
    }
  )

  if (error) return null
  
  if (isLoading) {
    return (
      <section className="mb-8 sm:mb-12 md:mb-16">
        <div className="container mx-auto mobile-padding sm:px-6">
          <div className="h-6 sm:h-8 bg-gradient-to-r from-red-800/30 to-red-900/30 rounded-lg w-48 sm:w-64 mb-4 sm:mb-6 animate-pulse" />
          <div className="mobile-card-grid tablet-grid-3 desktop-grid-6 gap-3 sm:gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[27/40] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg sm:rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const items: Movie[] = data?.results || []

  const filteredItems = items.filter((movie) => {
    const type = movie.media_type === 'tv' || (!movie.media_type && !movie.title) ? 'tv' : 'movie'
    const hasVisual = Boolean(movie.poster_path || movie.backdrop_path)
    return (type === 'movie' || type === 'tv') && hasVisual
  })

  const handleMovieClick = (movie: Movie) => {
    const movieType = movie.media_type === 'tv' || (!movie.media_type && !movie.title) ? 'tv' : 'movie'
    navigate(`/${movieType}/${movie.id}`)
  }

  return (
    <section className="mb-16">
      <div className="container mx-auto mobile-padding sm:px-6">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-3 relative">
            {title}
            <div className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-red-500 to-red-600 w-24 rounded-full" />
          </h2>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredItems.slice(0, 18).map((movie: Movie, index: number) => (
            <MovieCard
              key={`${movie.id}-${index}`}
              movie={movie}
              index={index}
              onPlay={() => handleMovieClick(movie)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(OptimizedRow)
