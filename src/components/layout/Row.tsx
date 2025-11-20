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
  genre_ids?: number[]
}

// Genre mapping
const GENRE_MAP: { [key: number]: string } = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
}

interface RowProps {
  title: string
  endpoint: string
}

// Optimized Movie Card Component
const MovieCard = memo(({ movie, index, onPlay }: { movie: Movie; index: number; onPlay: () => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40
    setMousePosition({ x, y })
  }
  
  const tiltX = isHovered ? (mousePosition.y / 40) * -10 : 0
  const tiltY = isHovered ? (mousePosition.x / 40) * 10 : 0
  
  return (
    <motion.div
      className="group cursor-pointer touch-target relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      onMouseMove={handleMouseMove}
      onClick={onPlay}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotateX: tiltX,
        rotateY: tiltY
      }}
      transition={{ 
        delay: index * 0.03, 
        duration: 0.3,
        rotateX: { duration: 0.2, ease: "easeOut" },
        rotateY: { duration: 0.2, ease: "easeOut" }
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      {/* Movie Card */}
      <div className="relative overflow-hidden rounded-xl bg-neutral-900/90 border border-neutral-800/60 shadow-xl transition-all duration-500">
        {/* Poster Container */}
        <div style={{ aspectRatio: '27/40' }} className="relative overflow-hidden">
          <motion.img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/270x400/1a1a1a/ef4444?text=No+Image'
            }
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
            loading="lazy"
            animate={{
              scale: isHovered ? 1.08 : 1
            }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          />

          {/* Glow Effect on Hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              background: isHovered 
                ? "radial-gradient(circle at center, rgba(239, 68, 68, 0.25) 0%, transparent 70%)"
                : "transparent"
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Dark Overlay on Hover */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.5 : 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Play Button - Center */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0,
              x: mousePosition.x * 0.6,
              y: mousePosition.y * 0.6
            }}
            transition={{ 
              opacity: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
              scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
              x: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
            }}
          >
            <motion.button
              className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
              onClick={(e) => {
                e.stopPropagation()
                onPlay()
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.9))',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.4)'
              }}
            >
              {/* Animated gradient overlay */}
              <motion.div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
                }}
                animate={{
                  background: [
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
                    'linear-gradient(225deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
              />
              <FiPlay size={26} className="text-white relative z-10 ml-1" strokeWidth={0} fill="white" />
            </motion.button>
          </motion.div>

          {/* Rating Badge */}
          <motion.div 
            className="absolute top-2 right-2 px-2.5 py-1 rounded-lg flex items-center gap-1"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(15px) saturate(150%)',
              WebkitBackdropFilter: 'blur(15px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <FiStar size={11} className="text-yellow-400" fill="#facc15" />
            <span className="text-white text-xs font-semibold">
              {movie.vote_average.toFixed(1)}
            </span>
          </motion.div>

          {/* Genre Badge */}
          {movie.genre_ids && movie.genre_ids.length > 0 && (
            <motion.div 
              className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md"
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(15px) saturate(150%)',
                WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 8,
                scale: isHovered ? 1 : 0.95
              }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span className="text-white text-[10px] font-medium tracking-wide">
                {movie.genre_ids.slice(0, 2).map(id => GENRE_MAP[id]).filter(Boolean).join(' • ')}
              </span>
            </motion.div>
          )}

          {/* Add to Watchlist Button */}
          <motion.button
            className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(15px) saturate(150%)',
              WebkitBackdropFilter: 'blur(15px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.85
            }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => {
              e.stopPropagation()
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiPlus size={14} className="text-white" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="mt-3 px-1">
        <motion.h3 
          className="font-semibold text-white text-sm sm:text-sm mb-1 truncate"
          animate={{ 
            color: isHovered ? "#ef4444" : "#ffffff"
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {movie.title || movie.name}
        </motion.h3>
        <p className="text-gray-500 text-xs sm:text-xs">
          {(movie.release_date || movie.first_air_date || '').slice(0, 4)}
        </p>
      </div>
    </motion.div>
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
