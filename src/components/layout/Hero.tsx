import React, { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FiPlay, FiInfo } from 'react-icons/fi'
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

const MovieSlide = memo(({ movie }: { movie: Movie }) => {
  const navigate = useNavigate()

  const title = movie.title || movie.name || 'Untitled'
  const year = (movie.release_date || movie.first_air_date || '').split('-')[0]

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : 'https://via.placeholder.com/1920x1080/000000/666666?text=No+Image'

  return (
    <div className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] w-full">
      {/* Background */}
      <img
        src={backdropUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 mobile-padding sm:p-6 md:p-8 lg:p-12 xl:p-16 pb-safe">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <h1 className="mobile-title sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white line-clamp-2 leading-tight">
            {title}
          </h1>
          
          {year && (
            <p className="mobile-subtitle sm:text-base md:text-lg text-gray-300 font-medium">{year}</p>
          )}

          {movie.overview && (
            <p className="mobile-body sm:text-sm md:text-base lg:text-lg text-gray-300 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed">
              {movie.overview}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-3 sm:pt-4">
            <button
              onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              className="touch-target px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-black mobile-subtitle sm:text-base font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <FiPlay className="w-5 h-5" />
              Play
            </button>

            <button
              onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              className="touch-target px-6 sm:px-8 py-3 sm:py-3.5 bg-white/20 backdrop-blur-md text-white mobile-subtitle sm:text-base font-bold rounded-lg hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <FiInfo className="w-5 h-5" />
              <span className="hidden sm:inline">More Info</span>
              <span className="sm:hidden">Info</span>
            </button>
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
      <div className="h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] bg-black flex items-center justify-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !movies.length) {
    return (
      <div className="h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] bg-black flex items-center justify-center">
        <p className="text-white mobile-subtitle sm:text-lg md:text-xl">Unable to load content</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-[0_0_100%] min-w-0">
              <MovieSlide movie={movie} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots - Mobile optimized with larger touch targets */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2.5 pb-safe">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`transition-all touch-target ${
              index === selectedIndex
                ? 'w-8 sm:w-10 h-2 bg-white shadow-lg'
                : 'w-2 h-2 bg-gray-500/80 hover:bg-gray-400'
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero
