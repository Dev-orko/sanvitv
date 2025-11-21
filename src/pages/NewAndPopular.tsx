import React, { useState } from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiTrendingUp, FiStar, FiFilm, FiZap } from 'react-icons/fi'
import { API_CONFIG } from '../config/api'

const fetcher = (url: string) => axios.get(url).then((r) => r.data)

interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type: 'movie' | 'tv'
  overview?: string
}

const NewAndPopular: React.FC = () => {
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'topRated' | 'bollywood' | 'anime'>('trending')

  // Fetch different content based on active tab
  const getTrendingUrl = () => `${API_CONFIG.TMDB_BASE_URL}/trending/all/week?api_key=${API_CONFIG.TMDB_API_KEY}`
  const getNewUrl = () => `${API_CONFIG.TMDB_BASE_URL}/movie/now_playing?api_key=${API_CONFIG.TMDB_API_KEY}&region=US`
  const getTopRatedUrl = () => `${API_CONFIG.TMDB_BASE_URL}/movie/top_rated?api_key=${API_CONFIG.TMDB_API_KEY}`
  const getBollywoodUrl = () => `${API_CONFIG.TMDB_BASE_URL}/discover/movie?api_key=${API_CONFIG.TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=1`
  const getAnimeUrl = () => `${API_CONFIG.TMDB_BASE_URL}/discover/tv?api_key=${API_CONFIG.TMDB_API_KEY}&with_genres=16&with_keywords=210024|287501&with_original_language=ja&sort_by=popularity.desc&page=1`

  const { data: trendingData, error: trendingError, isLoading: trendingLoading } = useSWR(
    activeTab === 'trending' ? getTrendingUrl() : null,
    fetcher
  )

  const { data: newData, error: newError, isLoading: newLoading } = useSWR(
    activeTab === 'new' ? getNewUrl() : null,
    fetcher
  )

  const { data: topRatedData, error: topRatedError, isLoading: topRatedLoading } = useSWR(
    activeTab === 'topRated' ? getTopRatedUrl() : null,
    fetcher
  )

  const { data: bollywoodData, error: bollywoodError, isLoading: bollywoodLoading } = useSWR(
    activeTab === 'bollywood' ? getBollywoodUrl() : null,
    fetcher
  )

  const { data: animeData, error: animeError, isLoading: animeLoading } = useSWR(
    activeTab === 'anime' ? getAnimeUrl() : null,
    fetcher
  )

  const getActiveData = () => {
    switch (activeTab) {
      case 'trending':
        return trendingData?.results || []
      case 'new':
        return newData?.results?.map((item: any) => ({ ...item, media_type: 'movie' })) || []
      case 'topRated':
        return topRatedData?.results?.map((item: any) => ({ ...item, media_type: 'movie' })) || []
      case 'bollywood':
        return bollywoodData?.results?.map((item: any) => ({ ...item, media_type: 'movie' })) || []
      case 'anime':
        return animeData?.results?.map((item: any) => ({ ...item, media_type: 'tv' })) || []
      default:
        return []
    }
  }

  const isLoading = trendingLoading || newLoading || topRatedLoading || bollywoodLoading || animeLoading
  const error = trendingError || newError || topRatedError || bollywoodError || animeError

  const items: MediaItem[] = getActiveData()

  const handleItemClick = (item: MediaItem) => {
    navigate(`/${item.media_type}/${item.id}`)
  }

  const getTitle = (item: MediaItem) => item.title || item.name || 'Untitled'
  const getYear = (item: MediaItem) => {
    const date = item.release_date || item.first_air_date
    return date ? date.split('-')[0] : ''
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">New & Popular</h1>
          <p className="text-gray-400 text-lg">What's trending and recently released</p>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="mb-8">
          {/* Mobile: Horizontal scroll with better spacing */}
          <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 pb-4 border-b border-neutral-800 min-w-max">
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'trending' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white active:scale-95'
                }`}
              >
                <FiTrendingUp size={16} />
                Trending
              </button>

              <button
                onClick={() => setActiveTab('new')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'new' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white active:scale-95'
                }`}
              >
                <FiPlay size={16} />
                New Releases
              </button>

              <button
                onClick={() => setActiveTab('topRated')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'topRated' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white active:scale-95'
                }`}
              >
                <FiStar size={16} />
                Top Rated
              </button>

              <button
                onClick={() => setActiveTab('bollywood')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'bollywood' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white active:scale-95'
                }`}
              >
                <FiFilm size={16} />
                Bollywood
              </button>

              <button
                onClick={() => setActiveTab('anime')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'anime' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white active:scale-95'
                }`}
              >
                <FiZap size={16} />
                Anime
              </button>
            </div>
          </div>

          {/* Desktop: Normal tabs with underline */}
          <div className="hidden sm:flex gap-4 border-b border-neutral-800">
            <button
              onClick={() => setActiveTab('trending')}
              className={`pb-4 px-2 font-semibold transition relative ${
                activeTab === 'trending' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiTrendingUp className="inline mr-2" />
              Trending
              {activeTab === 'trending' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`pb-4 px-2 font-semibold transition relative ${
                activeTab === 'new' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiPlay className="inline mr-2" />
              New Releases
              {activeTab === 'new' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('topRated')}
              className={`pb-4 px-2 font-semibold transition relative ${
                activeTab === 'topRated' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiStar className="inline mr-2" />
              Top Rated
              {activeTab === 'topRated' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('bollywood')}
              className={`pb-4 px-2 font-semibold transition relative ${
                activeTab === 'bollywood' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiFilm className="inline mr-2" />
              Bollywood
              {activeTab === 'bollywood' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('anime')}
              className={`pb-4 px-2 font-semibold transition relative ${
                activeTab === 'anime' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiZap className="inline mr-2" />
              Anime
              {activeTab === 'anime' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t" />
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-xl">Failed to load content</p>
          </div>
        )}

        {/* Content Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  
                  {/* Badge for media type */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                    {item.media_type === 'tv' ? 'Series' : 'Movie'}
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                    <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition">
                      <FiPlay size={20} />
                    </button>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm line-clamp-2">{getTitle(item)}</p>
                      {item.vote_average > 0 && (
                        <p className="text-yellow-400 text-xs mt-1">★ {item.vote_average.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <h3 className="text-white font-medium text-sm line-clamp-1">{getTitle(item)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getYear(item) && (
                      <p className="text-gray-400 text-xs">{getYear(item)}</p>
                    )}
                    {item.media_type && (
                      <span className="text-gray-500 text-xs">• {item.media_type === 'tv' ? 'Series' : 'Movie'}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No content available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewAndPopular
