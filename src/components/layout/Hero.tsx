import React, { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FiPlay, FiInfo, FiStar } from 'react-icons/fi'
import useSWR from 'swr'
import axios from 'axios'
import { API_CONFIG } from '../../config/api'

const fetcher = (url: string) => axios.get(url).then((r) => r.data)

interface Movie {
  id: number
  title?: string
  name?: string
  overview?: string
  backdrop_path?: string
  poster_path?: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: string
}

interface Video {
  id: string
  key: string
  site: string
  type: string
}

const MovieSlide = memo(({ movie, onReady }: { movie: Movie; onReady?: () => void }) => {
  const navigate = useNavigate()
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [hasNotified, setHasNotified] = useState(false)

  const title = movie.title || movie.name || 'Untitled'
  const year = (movie.release_date || movie.first_air_date || '').split('-')[0]

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : 'https://via.placeholder.com/1920x1080/000000/666666?text=No+Image'

  // Fetch trailer for this movie
  useEffect(() => {
    const fetchTrailer = async () => {
      try {
        const mediaType = movie.media_type || 'movie'
        const response = await axios.get(
          `${API_CONFIG.TMDB_BASE_URL}/${mediaType}/${movie.id}/videos?api_key=${API_CONFIG.TMDB_API_KEY}`
        )
        const videos = response.data.results as Video[]
        const trailer = videos.find(
          (video: Video) => video.type === 'Trailer' && video.site === 'YouTube'
        )
        if (trailer) {
          setTrailerKey(trailer.key)
        } else {
          // No trailer, notify parent immediately
          if (onReady && !hasNotified) {
            setHasNotified(true)
            onReady()
          }
        }
      } catch (error) {
        console.error('Failed to fetch trailer:', error)
        // On error, notify parent
        if (onReady && !hasNotified) {
          setHasNotified(true)
          onReady()
        }
      }
    }

    fetchTrailer()
  }, [movie.id, movie.media_type, onReady, hasNotified])

  // Handle content load to notify parent
  const handleContentLoad = () => {
    if (onReady && !hasNotified) {
      setHasNotified(true)
      onReady()
    }
  }

  return (
    <div className="relative h-[65vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] w-full overflow-hidden">
      {/* Background with scale effect for professional look */}
      <div className="absolute inset-0 scale-105">
        {trailerKey ? (
          // YouTube trailer video
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title={`${title} Trailer`}
            className="w-full h-full object-cover pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1.5)',
              border: 'none'
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={handleContentLoad}
          />
        ) : (
          // Fallback to backdrop image
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={handleContentLoad}
          />
        )}
      </div>
      
      {/* Enhanced gradient overlay with red accent using blend mode */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-900 via-red-950/50 to-transparent mix-blend-screen opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 sm:hidden" />

      {/* Rating Badge - Mobile positioned top right */}
      {movie.vote_average > 0 && (
        <div className="absolute top-20 sm:top-8 right-4 sm:right-8 z-10">
          <div className="flex items-center gap-2 px-3 py-2 bg-black/90 backdrop-blur-xl rounded-full border border-yellow-500/30 shadow-2xl">
            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-bold text-sm">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Content - Optimized for mobile */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="mobile-padding-sm sm:p-6 md:p-8 lg:p-12 xl:p-16 pb-20 sm:pb-16">
          <div className="max-w-3xl space-y-2.5 sm:space-y-4">
            {/* Title with better mobile sizing */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white line-clamp-2 leading-tight" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6)' }}>
              {title}
            </h1>
            
            {/* Meta info row - Mobile optimized */}
            <div className="flex items-center gap-3 flex-wrap">
              {year && (
                <span className="text-sm sm:text-base md:text-lg text-gray-200 font-medium">{year}</span>
              )}
              {year && movie.vote_average > 0 && (
                <span className="w-1 h-1 rounded-full bg-gray-500" />
              )}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1.5">
                  <FiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm sm:text-base text-gray-200 font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Overview - Better mobile readability */}
            {movie.overview && (
              <p className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-200 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed drop-shadow-lg mb-1 sm:mb-0">
                {movie.overview}
              </p>
            )}

            {/* Buttons - Mobile-first design */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-4 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                className="touch-target w-full sm:w-auto px-6 sm:px-6 md:px-8 py-3.5 sm:py-2.5 md:py-3 bg-white text-black text-base sm:text-base font-bold rounded-xl sm:rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2.5 shadow-2xl active:scale-95"
              >
                <FiPlay className="w-5 h-5" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                className="touch-target w-full sm:w-auto px-6 sm:px-6 md:px-8 py-3.5 sm:py-2.5 md:py-3 bg-white/10 backdrop-blur-md text-white text-base sm:text-base font-bold rounded-xl sm:rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2.5 border border-white/20 shadow-xl active:scale-95"
              >
                <FiInfo className="w-5 h-5" />
                <span>More Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

MovieSlide.displayName = 'MovieSlide'

const Hero: React.FC = () => {
  const { data, error, isLoading } = useSWR<{ results: Movie[] }>(
    `${API_CONFIG.TMDB_BASE_URL}/trending/all/day?api_key=${API_CONFIG.TMDB_API_KEY}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const movies = useMemo(() => data?.results?.slice(0, 7) || [], [data])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isContentReady, setIsContentReady] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  if (isLoading) {
    return (
      <div className="h-[65vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] bg-black" />
    )
  }

  if (error || !movies.length) {
    return (
      <div className="h-[65vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] bg-black flex items-center justify-center">
        <p className="text-white text-base sm:text-lg md:text-xl">Unable to load content</p>
      </div>
    )
  }

  return (
    <div className={`relative transition-opacity duration-1000 ${isContentReady ? 'opacity-100' : 'opacity-0'}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-[0_0_100%] min-w-0">
              <MovieSlide movie={movie} onReady={index === 0 ? () => setIsContentReady(true) : undefined} />
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Indicators - Enhanced for mobile */}
      <div className="absolute bottom-6 sm:bottom-6 left-0 right-0 flex flex-col items-center gap-2 pb-safe">
        {/* Swipe indicator - Mobile only */}
        <div className="sm:hidden text-white/60 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
          <span>Swipe</span>
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        
        {/* Dots with counter for mobile */}
        <div className="flex items-center gap-3">
          <span className="sm:hidden text-white/80 text-xs font-semibold">{selectedIndex + 1}/{movies.length}</span>
          <div className="flex gap-1.5 sm:gap-2">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`transition-all ${
                  index === selectedIndex
                    ? 'w-8 sm:w-8 h-2 bg-white shadow-lg shadow-white/50'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/60 active:scale-90'
                } rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
