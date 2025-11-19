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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player */}
        {streamUrl && (
          <iframe
            src={streamUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            title={title}
          />
        )}
      </div>
    </motion.div>
  )
}

export default EnhancedVideoPlayer
