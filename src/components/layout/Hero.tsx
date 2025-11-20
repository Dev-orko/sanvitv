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

  // Use poster on mobile, backdrop on desktop
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : 'https://via.placeholder.com/1920x1080/000000/666666?text=No+Image'
  
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : backdropUrl

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
    <div className="relative h-[75vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] w-full overflow-hidden">
      {/* Background - Poster on mobile, backdrop/video on desktop */}
      <div className="absolute inset-0 scale-105">
        {/* Mobile: Show poster image */}
        <img
          src={posterUrl}
          alt={title}
          className="sm:hidden w-full h-full object-cover object-top"
          onLoad={handleContentLoad}
        />
        
        {/* Desktop: Show trailer or backdrop */}
        <div className="hidden sm:block w-full h-full">
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
      </div>
      
      {/* Enhanced gradient overlays - Better for mobile */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:from-black/80" />
      
      {/* Subtle red accent - less aggressive */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-red-950/30 via-transparent to-transparent mix-blend-multiply" />

      {/* Content - Redesigned for mobile */}
      <div className="absolute inset-0 flex flex-col justify-end pb-safe">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-24 sm:pb-20 md:pb-24">
          <div className="max-w-4xl space-y-3 sm:space-y-4">
            {/* Rating Badge - Cleaner mobile design */}
            {movie.vote_average > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-xl rounded-full border border-yellow-500/40 shadow-lg">
                <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold text-sm">{movie.vote_average.toFixed(1)}</span>
                {year && <span className="text-white/60 text-xs font-medium">• {year}</span>}
              </div>
            )}
            
            {/* Title with better mobile hierarchy */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white line-clamp-2 leading-[1.1] tracking-tight" style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.8)' }}>
              {title}
            </h1>

            {/* Overview - Better contrast on mobile */}
            {movie.overview && (
              <p className="text-sm sm:text-base md:text-lg text-gray-100 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed font-medium" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)' }}>
                {movie.overview}
              </p>
            )}

            {/* Buttons - Redesigned for mobile touch */}
            <div className="flex flex-row gap-3 pt-2 sm:pt-4">
              <button
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                className="flex-1 sm:flex-none sm:min-w-[140px] px-5 sm:px-8 py-3.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-2xl shadow-red-600/40 active:scale-[0.98] border border-red-500/20"
              >
                <FiPlay className="w-5 h-5 fill-current" />
                <span>Play</span>
              </button>

              <button
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                className="flex-1 sm:flex-none sm:min-w-[140px] px-5 sm:px-8 py-3.5 sm:py-3 bg-white/15 backdrop-blur-xl hover:bg-white/25 text-white text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 border border-white/30 shadow-xl active:scale-[0.98]"
              >
                <FiInfo className="w-5 h-5" />
                <span>Info</span>
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

      {/* Modern Minimal Indicators - Smaller and cleaner on mobile */}
      <div className="absolute bottom-8 sm:bottom-8 left-0 right-0 flex justify-center items-center gap-1.5 sm:gap-2 pb-safe z-20">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? 'w-5 sm:w-6 md:w-8 h-1 sm:h-1.5 bg-red-600 shadow-lg shadow-red-600/50'
                : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/40 hover:bg-white/70 active:scale-90'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero
