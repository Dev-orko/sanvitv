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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const hideControlsTimeout = useRef<number | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Lock body scroll when player is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Generate streaming URL using Videasy
  useEffect(() => {
    setIsLoading(true)
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

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

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
          {/* Video Player Container */}
          <div 
            ref={playerContainerRef}
            className="relative bg-black shadow-2xl group w-full rounded-xl overflow-hidden"
            style={{ 
              height: 'clamp(300px, 60vh, 80vh)',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Modern Header with Glass Effect */}
            <div 
              className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
                showControls 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-full pointer-events-none'
              }`}
            >
              <div className="bg-gradient-to-b from-black/80 via-black/50 to-transparent backdrop-blur-md p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white text-base md:text-xl lg:text-2xl font-bold drop-shadow-lg line-clamp-1 mb-1">
                      {title}
                    </h2>
                    {isTV && season && episode && (
                      <p className="text-gray-300 text-xs md:text-sm">
                        Season {season} • Episode {episode}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-4 p-2 md:p-3 bg-red-600 hover:bg-red-700 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                    aria-label="Close player"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-sm md:text-base font-medium">Loading Player...</p>
                </div>
              </div>
            )}

            {/* Video iframe */}
            {streamUrl && (
              <iframe
                ref={iframeRef}
                src={streamUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                title={title}
                onLoad={handleIframeLoad}
                loading="eager"
              />
            )}

            {/* Modern Bottom Controls Bar */}
            <div 
              className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
                showControls 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-full pointer-events-none'
              }`}
            >
              <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                      aria-label="Toggle fullscreen"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isFullscreen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18h12M6 6h12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        )}
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 font-medium">
                    Powered by Videasy
                  </div>
                </div>
              </div>
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
