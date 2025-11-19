import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, HTMLMotionProps } from 'framer-motion'
import axios from 'axios'
import { FiPlay, FiStar, FiCalendar, FiClock, FiHeart, FiPlus, FiShare2, FiUser, FiThumbsUp, FiThumbsDown, FiSend, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import VideoPlayer from '../components/video/VideoPlayer'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { API_CONFIG } from '../config/api'

interface Movie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  vote_count: number
  release_date?: string
  first_air_date?: string
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
  genres: Array<{ id: number; name: string }>
  production_companies: Array<{ id: number; name: string; logo_path: string }>
  spoken_languages: Array<{ iso_639_1: string; name: string }>
  tagline?: string
  status?: string
  budget?: number
  revenue?: number
  seasons?: Array<{ 
    id: number
    season_number: number
    episode_count: number
    name: string
  }>
}

interface Comment {
  id: string
  user: string
  avatar: string
  text: string
  rating: number
  timestamp: string
  likes: number
  dislikes: number
}

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      text: 'Amazing movie! The cinematography and storyline were absolutely incredible. Highly recommend watching this masterpiece.',
      rating: 5,
      timestamp: '2 hours ago',
      likes: 24,
      dislikes: 1
    },
    {
      id: '2', 
      user: 'Sarah Kim',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c8?w=40&h=40&fit=crop&crop=face',
      text: 'Great acting and visual effects. The plot kept me engaged throughout. Worth every minute of the runtime.',
      rating: 4,
      timestamp: '5 hours ago', 
      likes: 18,
      dislikes: 2
    },
    {
      id: '3',
      user: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      text: 'Solid film with excellent character development. The soundtrack complements the scenes perfectly.',
      rating: 4,
      timestamp: '1 day ago',
      likes: 12,
      dislikes: 0
    }
  ])
  const [newComment, setNewComment] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerPortalEl, setPlayerPortalEl] = useState<HTMLElement | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [numberOfSeasons, setNumberOfSeasons] = useState(1)
  const [episodesInSeason, setEpisodesInSeason] = useState<number[]>([])
  const [similarMovies, setSimilarMovies] = useState<any[]>([])
  const isTV = location.pathname.includes('/tv/')

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  const primaryActionClass =
    'group relative inline-flex items-center gap-4 overflow-hidden rounded-full px-12 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.32em] text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60'
  const secondaryActionClass =
    'group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-10 py-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
  const tertiaryActionClass =
    'group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-9 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-50'

  useEffect(() => {
    // Ensure a portal container exists for the fullscreen player
    let el = document.getElementById('player-root') as HTMLElement | null
    if (!el) {
      el = document.createElement('div')
      el.id = 'player-root'
      document.body.appendChild(el)
    }
    setPlayerPortalEl(el)
    return () => {
      // keep the portal in DOM for reuse; don't remove to avoid unmount flicker
    }
  }, [])

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const mediaType = isTV ? 'tv' : 'movie'
        const url = `${API_CONFIG.TMDB_BASE_URL}/${mediaType}/${id}?api_key=${API_CONFIG.TMDB_API_KEY}`
        console.log('🎬 Fetching movie details from TMDB:', url)
        
        const response = await axios.get(url)
        console.log('📦 TMDB Response:', response.data)
        console.log('🎭 Movie title from TMDB:', response.data.title || response.data.name)
        
        setMovie(response.data)
        
        // For TV shows, set up season/episode data
        if (isTV && response.data.seasons) {
          const seasons = response.data.seasons.filter((s: any) => s.season_number > 0) // Filter out "Season 0" (specials)
          setNumberOfSeasons(seasons.length)
          
          if (seasons.length > 0) {
            // Create array of episode counts for each season
            const episodeCounts = seasons.map((s: any) => s.episode_count)
            setEpisodesInSeason(episodeCounts)
            setSelectedSeason(1)
            setSelectedEpisode(1)
          }
        }

        // Fetch similar movies/shows
        const similarUrl = `${API_CONFIG.TMDB_BASE_URL}/${mediaType}/${id}/similar?api_key=${API_CONFIG.TMDB_API_KEY}`
        const similarResponse = await axios.get(similarUrl)
        setSimilarMovies(similarResponse.data.results.slice(0, 12))
      } catch (error) {
        console.error('❌ Error fetching movie from TMDB:', error)
        console.error('📊 Error details:', {
          status: error.response?.status,
          message: error.response?.data,
          url: error.config?.url
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      console.log('🔍 MovieDetails: Loading movie ID:', id)
      fetchMovie()
    }
    
    // Simple redirect protection - only block window.open which we CAN safely override
    const originalOpen = window.open;
    
    // Override window.open to prevent popups
    window.open = function(...args) {
      console.log('Redirect attempt blocked via window.open:', args);
      return null;
    };
    
    // Block click events that might navigate away
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('target') === '_blank') {
        e.preventDefault();
        e.stopPropagation();
        console.log('External link click blocked');
      }
    };
    
    document.addEventListener('click', handleClick, true);
    
    // Movie changed, VideoPlayer will handle provider management
    
    // Cleanup function
    return () => {
      window.open = originalOpen;
      document.removeEventListener('click', handleClick, true);
    };
  }, [id, isTV])

  const handleSubmitComment = () => {
    if (!newComment.trim() || userRating === 0) return

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      text: newComment,
      rating: userRating,
      timestamp: 'Just now',
      likes: 0,
      dislikes: 0
    }

    setComments([comment, ...comments])
    setNewComment('')
    setUserRating(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <span className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full inline-block" />
        </motion.span>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Movie not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Video Player */}
      {isPlaying && movie && playerPortalEl && ReactDOM.createPortal(
        <VideoPlayer
          videoUrl={
            isTV 
              ? `https://live.kimostream.eu.org/tv/${id}/${selectedSeason}/${selectedEpisode}`
              : `https://live.kimostream.eu.org/movie/${id}`
          }
          title={movie.title || movie.name || 'Video'}
          poster={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined}
          movieId={id}
          isTV={isTV}
          season={selectedSeason}
          episode={selectedEpisode}
          movieData={{
            overview: movie.overview,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            release_date: movie.release_date,
            first_air_date: movie.first_air_date,
            runtime: movie.runtime,
            genres: movie.genres,
            spoken_languages: movie.spoken_languages,
            production_companies: movie.production_companies,
            tagline: (movie as any).tagline,
            status: (movie as any).status,
            budget: (movie as any).budget,
            revenue: (movie as any).revenue
          }}
          onClose={() => {
            console.log('VideoPlayer onClose called')
            setIsPlaying(false)
          }}
        />,
        playerPortalEl
      )}

      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-[70vh] sm:h-[80vh] md:h-[90vh] lg:h-screen bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          }}
        >
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 sm:px-6 flex items-center gap-6 sm:gap-8 md:gap-12">
              {/* Poster */}
              <div className="hidden lg:block flex-shrink-0">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-60 lg:w-72 xl:w-80 h-auto rounded-xl lg:rounded-2xl shadow-2xl"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent line-clamp-2">
                  {movie.title || movie.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 text-sm sm:text-base">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="text-yellow-400"><FiStar size={16} className="sm:w-5 sm:h-5" /></div>
                    <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs sm:text-sm">({movie.vote_count})</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="text-red-400"><FiCalendar size={16} className="sm:w-5 sm:h-5" /></div>
                    <span>{(movie.release_date || movie.first_air_date)?.slice(0, 4)}</span>
                  </div>
                  
                  {movie.runtime && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="text-red-400"><FiClock size={16} className="sm:w-5 sm:h-5" /></div>
                      <span>{movie.runtime} min</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-xs sm:text-sm font-medium border border-white/20"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-4">
                  {movie.overview}
                </p>

                {/* Season & Episode Selector for TV Shows */}
                {isTV && numberOfSeasons > 0 && (
                  <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {/* Season Selector */}
                      <div className="flex flex-col">
                        <label className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2 font-medium">Season</label>
                        <select
                          value={selectedSeason}
                          onChange={(e) => {
                            const season = Number(e.target.value)
                            setSelectedSeason(season)
                            setSelectedEpisode(1) // Reset to episode 1 when changing season
                          }}
                          className="px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-medium cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {Array.from({ length: numberOfSeasons }, (_, i) => i + 1).map((season) => (
                            <option key={season} value={season} className="bg-black">
                              Season {season}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Episode Selector */}
                      <div className="flex flex-col">
                        <label className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2 font-medium">Episode</label>
                        <select
                          value={selectedEpisode}
                          onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                          className="px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-medium cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {Array.from({ length: episodesInSeason[selectedSeason - 1] || 10 }, (_, i) => i + 1).map((episode) => (
                            <option key={episode} value={episode} className="bg-black">
                              Episode {episode}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      Now playing: <span className="text-white font-medium">Season {selectedSeason}, Episode {selectedEpisode}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => {
                      const extractedYear = Number((movie.release_date || movie.first_air_date || '').slice(0, 4)) || undefined
                      console.log('🎬 Watch Now clicked!')
                      console.log('📋 Movie details being passed to NetflixVideoPlayer:')
                      console.log('  - movieId:', id)
                      console.log('  - movieTitle:', movie.title || movie.name || 'Video')
                      console.log('  - isTV:', isTV)
                      console.log('  - season:', selectedSeason)
                      console.log('  - episode:', selectedEpisode)
                      console.log('  - year:', extractedYear)
                      console.log('  - release_date:', movie.release_date)
                      console.log('  - first_air_date:', movie.first_air_date)
                      setIsPlaying(true)
                    }}
                    className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-red-600 hover:bg-red-700 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <div className="text-white"><FiPlay size={16} className="sm:w-5 sm:h-5" /></div>
                    {isTV ? `Watch S${selectedSeason}E${selectedEpisode}` : 'Watch Now'}
                  </button>
                  
                  <button
                    type="button"
                    className="group relative inline-flex items-center gap-2 sm:gap-3 overflow-hidden rounded-lg sm:rounded-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <span
                      className="absolute inset-0 rounded-lg sm:rounded-full bg-white/10 backdrop-blur-lg transition-all duration-500 group-hover:bg-white/15 group-active:bg-white/10"
                      aria-hidden="true"
                    />
                    <span
                      className="absolute inset-0 rounded-lg sm:rounded-full border border-white/25 transition-colors duration-500 group-hover:border-red-400/60"
                      aria-hidden="true"
                    />
                    <span className="relative flex items-center gap-2 sm:gap-3">
                      <FiPlus size={16} className="sm:w-[18px] sm:h-[18px] text-white/80 group-hover:text-white" />
                      <span className="hidden sm:inline">My List</span>
                      <span className="sm:hidden">List</span>
                    </span>
                  </button>
                  
                  <button
                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="text-white"><FiShare2 size={16} className="sm:w-5 sm:h-5" /></div>
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies/Shows Section */}
      {similarMovies.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12 bg-black">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 sm:mb-8">More Like This</h2>
          
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3 sm:gap-4">
                {similarMovies.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const type = isTV ? 'tv' : 'movie'
                      navigate(`/${type}/${item.id}`)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex-[0_0_140px] sm:flex-[0_0_160px] md:flex-[0_0_180px] lg:flex-[0_0_200px] min-w-0 cursor-pointer group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4">
                        <button className="p-2 sm:p-3 bg-red-600 text-white rounded-full hover:scale-110 transition">
                          <FiPlay size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <div className="text-center">
                          <p className="text-white font-semibold text-xs sm:text-sm line-clamp-2">{item.title || item.name}</p>
                          {item.vote_average > 0 && (
                            <p className="text-yellow-400 text-xs mt-1">★ {item.vote_average.toFixed(1)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="text-white font-medium text-sm line-clamp-1">{item.title || item.name}</h3>
                      {(item.release_date || item.first_air_date) && (
                        <p className="text-gray-400 text-xs mt-1">
                          {(item.release_date || item.first_air_date).split('-')[0]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 p-2 sm:p-3 bg-black/80 hover:bg-black text-white rounded-full transition-all hover:scale-110 z-10"
            >
              <FiChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 p-2 sm:p-3 bg-black/80 hover:bg-black text-white rounded-full transition-all hover:scale-110 z-10"
            >
              <FiChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 sm:mb-8">User Reviews</h2>
          
          {/* Add Comment Form */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Share Your Review</h3>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`text-2xl ${star <= userRating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your review..."
              className="w-full p-3 sm:p-4 bg-black/50 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-400 resize-none h-20 sm:h-24 mb-3 sm:mb-4 focus:outline-none focus:border-red-500"
            />
            
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || userRating === 0}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all hover:scale-102 active:scale-98"
            >
              <div className="text-white"><FiSend size={14} className="sm:w-4 sm:h-4" /></div>
              Post Review
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4 sm:space-y-6">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <h4 className="font-bold text-white text-sm sm:text-base truncate">{comment.user}</h4>
                        <div className="flex items-center flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs sm:text-sm ${i < comment.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">{comment.timestamp}</span>
                    </div>
                    
                    <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">{comment.text}</p>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm">
                        <div><FiThumbsUp size={14} className="sm:w-4 sm:h-4" /></div>
                        <span>{comment.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm">
                        <div><FiThumbsDown size={14} className="sm:w-4 sm:h-4" /></div>
                        <span>{comment.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetails


