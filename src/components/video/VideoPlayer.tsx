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
      className="fixed inset-0 bg-black z-[200] flex flex-col"
      onClick={handleBackdropClick}
    >
      {/* Mobile Close Button - Always visible */}
      <div className="sm:hidden absolute top-0 left-0 right-0 z-[210] safe-area-inset">
        <div className="flex items-center justify-between p-3 bg-gradient-to-b from-black/95 to-transparent">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl hover:bg-white/20 active:bg-white/15 rounded-full transition-all active:scale-95 border border-white/20"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white font-semibold text-sm">Back</span>
          </button>
          <h2 className="text-white text-sm font-bold line-clamp-1 max-w-[60%]">{title}</h2>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full sm:max-w-7xl sm:mx-auto sm:my-4 sm:max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col"
      >
          {/* Video Player Container */}
          <div 
            ref={playerContainerRef}
            className="relative bg-black flex-shrink-0 group w-full"
            style={{ 
              height: window.innerWidth < 640 ? '45vh' : 'clamp(350px, 65vh, 75vh)',
              borderRadius: window.innerWidth < 640 ? '0' : '12px',
              padding: window.innerWidth < 640 ? '0' : '3px',
              background: window.innerWidth < 640 ? '#000' : 'linear-gradient(135deg, #dc2626, #000000, #dc2626)',
              overflow: 'hidden',
              marginTop: window.innerWidth < 640 ? '56px' : '0'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseMove}
          >
            <div className="w-full h-full bg-black rounded-[6px] sm:rounded-[9px] overflow-hidden relative">
            {/* Desktop Header - Only visible on hover */}
            <div 
              className={`hidden sm:block absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
                showControls 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-full pointer-events-none'
              }`}
            >
              <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-white text-base md:text-lg lg:text-xl font-bold drop-shadow-lg line-clamp-1 flex-1">{title}</h2>
                  <button
                    onClick={onClose}
                    className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Video iframe */}
            {streamUrl && (
              <iframe
                src={streamUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                title={title}
              />
            )}
          </div>
          </div>

          {/* Movie Description Section - Mobile Optimized */}
          {movieData && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-0 pb-safe">
              <div className="mt-4 sm:mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Main Info Section */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 line-clamp-2">{title}</h3>
                
                {/* Metadata Row - Mobile Friendly */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs sm:text-sm">
                  {movieData.vote_average && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-400 font-semibold rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {Math.round(movieData.vote_average * 10)}%
                    </span>
                  )}
                  
                  {(movieData.release_date || movieData.first_air_date) && (
                    <span className="px-2.5 py-1 bg-white/10 text-white font-medium rounded-full">
                      {(movieData.release_date || movieData.first_air_date)?.slice(0, 4)}
                    </span>
                  )}
                  
                  {movieData.runtime && (
                    <span className="px-2.5 py-1 bg-white/10 text-gray-300 font-medium rounded-full">
                      {Math.floor(movieData.runtime / 60)}h {movieData.runtime % 60}m
                    </span>
                  )}

                  <span className="px-2.5 py-1 bg-red-500/20 text-red-400 font-semibold rounded-full">
                    HD
                  </span>
                </div>

                {/* Tagline */}
                {movieData.tagline && (
                  <p className="text-gray-400 italic text-sm mb-3 line-clamp-2">"{movieData.tagline}"</p>
                )}

                {/* Overview */}
                {movieData.overview && (
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-4 sm:line-clamp-5">{movieData.overview}</p>
                )}
              </div>

              {/* Details Grid - Mobile Optimized */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5">
                <h4 className="text-base font-bold text-white mb-3">Details</h4>
                
                <div className="grid grid-cols-1 gap-2.5 text-sm">
                  {/* Genres - Pill Style */}
                  {movieData.genres && movieData.genres.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-xs font-medium mb-1.5 block">Genres</span>
                      <div className="flex flex-wrap gap-2">
                        {movieData.genres.map(g => (
                          <span key={g.id} className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium">
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  {movieData.vote_average && (
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-gray-400 text-xs font-medium min-w-[70px]">Rating</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold text-base">
                          ★ {movieData.vote_average.toFixed(1)}
                        </span>
                        {movieData.vote_count && (
                          <span className="text-gray-400 text-xs">
                            ({(movieData.vote_count / 1000).toFixed(1)}K votes)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {movieData.status && (
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-gray-400 text-xs font-medium min-w-[70px]">Status</span>
                      <span className="text-white text-sm font-medium">{movieData.status}</span>
                    </div>
                  )}

                  {/* Languages */}
                  {movieData.spoken_languages && movieData.spoken_languages.length > 0 && (
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-gray-400 text-xs font-medium min-w-[70px]">Languages</span>
                      <span className="text-white text-sm">
                        {movieData.spoken_languages.slice(0, 3).map(l => l.name).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Production */}
                  {movieData.production_companies && movieData.production_companies.length > 0 && (
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-gray-400 text-xs font-medium min-w-[70px]">Studio</span>
                      <span className="text-white text-sm line-clamp-1">
                        {movieData.production_companies[0].name}
                      </span>
                    </div>
                  )}

                  {/* Budget & Revenue */}
                  {(movieData.budget && movieData.budget > 0) || (movieData.revenue && movieData.revenue > 0) ? (
                    <div className="flex items-center gap-4 py-1">
                      {movieData.budget && movieData.budget > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs font-medium">Budget</span>
                          <span className="text-white text-sm font-medium">
                            ${(movieData.budget / 1000000).toFixed(0)}M
                          </span>
                        </div>
                      )}
                      {movieData.revenue && movieData.revenue > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs font-medium">Revenue</span>
                          <span className="text-green-400 text-sm font-medium">
                            ${(movieData.revenue / 1000000).toFixed(0)}M
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            </div>
          )}
        </motion.div>
    </motion.div>
  )
}

export default EnhancedVideoPlayer
