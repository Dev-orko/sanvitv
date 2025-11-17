import React, { useState } from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiTrendingUp, FiStar } from 'react-icons/fi'

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
  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY
  
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'topRated'>('trending')

  // Fetch different content based on active tab
  const getTrendingUrl = () => `https://api.themoviedb.org/3/trending/all/week?api_key=${tmdbKey}`
  const getNewUrl = () => `https://api.themoviedb.org/3/movie/now_playing?api_key=${tmdbKey}&region=US`
  const getTopRatedUrl = () => `https://api.themoviedb.org/3/movie/top_rated?api_key=${tmdbKey}`

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

  const getActiveData = () => {
    switch (activeTab) {
      case 'trending':
        return trendingData?.results || []
      case 'new':
        return newData?.results?.map((item: any) => ({ ...item, media_type: 'movie' })) || []
      case 'topRated':
        return topRatedData?.results?.map((item: any) => ({ ...item, media_type: 'movie' })) || []
      default:
        return []
    }
  }

  const isLoading = trendingLoading || newLoading || topRatedLoading
  const error = trendingError || newError || topRatedError

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

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-neutral-800">
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
