import React, { useRef, useEffect, useState } from 'react'
import { FiStar, FiCalendar, FiClock } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedVideoPlayerProps {
  videoUrl: string
  title: string
  onClose?: () => void
  poster?: string
  autoPlay?: boolean
  movieId?: string
  isTV?: boolean
  season?: number
  episode?: number
  movieData?: {
    overview?: string
    vote_average?: number
    vote_count?: number
    release_date?: string
    first_air_date?: string
    runtime?: number
    genres?: Array<{ id: number; name: string }>
    spoken_languages?: Array<{ iso_639_1: string; name: string }>
    production_companies?: Array<{ id: number; name: string; logo_path: string }>
    tagline?: string
    status?: string
    budget?: number
    revenue?: number
  }
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({ 
  videoUrl,
  title,
  onClose,
  poster,
  autoPlay = true,
  movieId,
  isTV,
  season,
  episode,
  movieData
}) => {
  const [streamUrl, setStreamUrl] = useState('')
  const [showControls, setShowControls] = useState(true)
  const hideControlsTimeout = useRef<number | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when player is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Generate streaming URL using Videasy
  useEffect(() => {
    if (movieId) {
      if (isTV && season && episode) {
        setStreamUrl(`https://player.videasy.net/tv/${movieId}/${season}/${episode}`)
      } else {
        setStreamUrl(`https://player.videasy.net/movie/${movieId}`)
      }
    } else if (videoUrl) {
      setStreamUrl(videoUrl)
    }
  }, [videoUrl, movieId, isTV, season, episode])

  // Handle mouse movement for showing/hiding controls
  const handleMouseMove = () => {
    setShowControls(true)
    
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false)
    }, 3000) as unknown as number
  }

  const handleMouseLeave = () => {
    setShowControls(false)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
          {/* Close Button - Removed */}

          {/* Video Player Container */}
          <div 
            ref={playerContainerRef}
            className="relative bg-black shadow-2xl group w-full"
            style={{ 
              height: 'clamp(250px, 50vh, 60vh)',
              borderRadius: '8px',
              padding: '2px',
              background: 'linear-gradient(135deg, #dc2626, #000000, #dc2626)',
              overflow: 'hidden'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-full h-full bg-black rounded-[6px] overflow-hidden relative">
            {/* Header - Only visible on hover */}
            <div 
              className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
                showControls 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-full pointer-events-none'
              }`}
            >
              <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent p-3 sm:p-4 md:p-6">
                <h2 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold drop-shadow-lg line-clamp-1">{title}</h2>
              </div>
            </div>

            {/* Video iframe */}
            {streamUrl && (
              <iframe
                src={streamUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={title}
              />
            )}
          </div>
          </div>

          {/* Movie Description Section */}
          {movieData && (
            <div className="mt-3 sm:mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Main Info Section */}
              <div className="bg-neutral-900 rounded-lg p-3 sm:p-4">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-1">{title}</h3>
                
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3 text-xs">
                  {movieData.vote_average && (
                    <span className="text-green-500 font-semibold whitespace-nowrap">
                      {Math.round(movieData.vote_average * 10)}% Match
                    </span>
                  )}
                  
                  {(movieData.release_date || movieData.first_air_date) && (
                    <span className="text-white font-medium whitespace-nowrap">
                      {(movieData.release_date || movieData.first_air_date)?.slice(0, 4)}
                    </span>
                  )}
                  
                  {movieData.runtime && (
                    <span className="border border-gray-600 px-2 py-0.5 text-gray-300 text-xs font-medium whitespace-nowrap">
                      {Math.floor(movieData.runtime / 60)}h {movieData.runtime % 60}m
                    </span>
                  )}

                  <span className="border border-gray-600 px-2 py-0.5 text-gray-300 text-xs font-medium whitespace-nowrap">
                    HD
                  </span>
                </div>

                {/* Tagline */}
                {movieData.tagline && (
                  <p className="text-gray-400 italic text-xs sm:text-sm mb-2 line-clamp-2">"{movieData.tagline}"</p>
                )}

                {/* Overview */}
                {movieData.overview && (
                  <p className="text-white text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4">{movieData.overview}</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="bg-neutral-900 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm sm:text-base font-bold text-white mb-2 sm:mb-3">More Information</h4>
                
                <div className="grid grid-cols-1 gap-2 text-xs sm:text-xs">
                  {/* Genres */}
                  {movieData.genres && movieData.genres.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[70px] sm:min-w-[90px] font-medium flex-shrink-0">Genres:</span>
                      <span className="text-white break-words">
                        {movieData.genres.map(g => g.name).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Rating */}
                  {movieData.vote_average && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[70px] sm:min-w-[90px] font-medium flex-shrink-0">Rating:</span>
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-yellow-400 font-bold text-xs sm:text-sm whitespace-nowrap">
                          ★ {movieData.vote_average.toFixed(1)}
                        </span>
                        {movieData.vote_count && (
                          <span className="text-gray-400 text-xs whitespace-nowrap">
                            ({movieData.vote_count.toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {movieData.status && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[70px] sm:min-w-[90px] font-medium flex-shrink-0">Status:</span>
                      <span className="text-white">{movieData.status}</span>
                    </div>
                  )}

                  {/* Languages */}
                  {movieData.spoken_languages && movieData.spoken_languages.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[70px] sm:min-w-[90px] font-medium flex-shrink-0">Languages:</span>
                      <span className="text-white break-words">
                        {movieData.spoken_languages.map(l => l.name).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Production */}
                  {movieData.production_companies && movieData.production_companies.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[70px] sm:min-w-[90px] font-medium flex-shrink-0">Production:</span>
                      <span className="text-white break-words line-clamp-2">
                        {movieData.production_companies.slice(0, 2).map(c => c.name).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Budget */}
                  {movieData.budget && movieData.budget > 0 && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[70px] sm:min-w-[90px] font-medium flex-shrink-0">Budget:</span>
                      <span className="text-white whitespace-nowrap">
                        ${(movieData.budget / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  )}

                  {/* Revenue */}
                  {movieData.revenue && movieData.revenue > 0 && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[70px] sm:min-w-[90px] font-medium flex-shrink-0">Revenue:</span>
                      <span className="text-white whitespace-nowrap">
                        ${(movieData.revenue / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
    </motion.div>
  )
}

export default EnhancedVideoPlayer
