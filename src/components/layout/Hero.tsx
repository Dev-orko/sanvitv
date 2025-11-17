import React, { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FiPlay, FiInfo } from 'react-icons/fi'
import useSWR from 'swr'
import axios from 'axios'

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
    <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] w-full">
      {/* Background */}
      <img
        src={backdropUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
        <div className="max-w-3xl space-y-2 sm:space-y-3 md:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white line-clamp-2">
            {title}
          </h1>
          
          {year && (
            <p className="text-sm sm:text-base md:text-lg text-gray-300">{year}</p>
          )}

          {movie.overview && (
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 line-clamp-2 sm:line-clamp-3 max-w-2xl">
              {movie.overview}
            </p>
          )}

          <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-3 md:pt-4">
            <button
              onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white text-black text-sm sm:text-base font-semibold rounded hover:bg-gray-200 transition flex items-center gap-2"
            >
              <FiPlay className="w-4 h-4 sm:w-5 sm:h-5" />
              Play
            </button>

            <button
              onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gray-500/50 text-white text-sm sm:text-base font-semibold rounded hover:bg-gray-500/70 transition flex items-center gap-2"
            >
              <FiInfo className="w-4 h-4 sm:w-5 sm:h-5" />
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
  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY
  
  const { data, error, isLoading } = useSWR<{ results: Movie[] }>(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${tmdbKey}`,
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
      <div className="h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] bg-black flex items-center justify-center">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !movies.length) {
    return (
      <div className="h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] bg-black flex items-center justify-center">
        <p className="text-white text-base sm:text-lg md:text-xl">Unable to load content</p>
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

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`transition-all ${
              index === selectedIndex
                ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-white'
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-500 hover:bg-gray-400'
            } rounded-full`}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero
