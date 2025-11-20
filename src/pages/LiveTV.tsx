import React, { useState, useEffect, useRef } from 'react'
import { FiRadio, FiPlay, FiMaximize, FiAlertCircle } from 'react-icons/fi'
import Hls from 'hls.js'

interface Channel {
  id: string
  name: string
  logo: string
  streamUrl: string
  country: string
  category: string
}

const LiveTV: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const channels: Channel[] = [
    {
      id: 'starsports',
      name: 'Star Sports',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/Star_Sports_logo.svg/1200px-Star_Sports_logo.svg.png',
      streamUrl: 'http://192.168.91.8/streams/118/index.m3u8',
      country: '🇮🇳 India',
      category: 'Sports'
    }
  ]

  useEffect(() => {
    if (!selectedChannel || !videoRef.current) return

    const video = videoRef.current
    setIsLoading(true)
    setError(null)

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    console.log('Loading stream:', selectedChannel.streamUrl)

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: true,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        xhrSetup: function (xhr, url) {
          xhr.withCredentials = false // Disable credentials for local streams
        }
      })
      
      hlsRef.current = hls

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('Manifest parsed, levels:', data.levels)
        setIsLoading(false)
        video.play()
          .then(() => console.log('Playing successfully'))
          .catch(err => {
            console.error('Autoplay failed:', err)
            setError('Click play button to start')
          })
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error event:', event, data)
        
        if (data.fatal) {
          setIsLoading(false)
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error - Cannot load stream')
              setError('Network error: Cannot connect to stream. Check if URL is accessible.')
              setTimeout(() => {
                console.log('Trying to recover from network error...')
                hls.startLoad()
              }, 3000)
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error - trying to recover')
              setError('Media error: Attempting to recover...')
              hls.recoverMediaError()
              break
            default:
              console.error('Fatal error - cannot recover')
              setError('Fatal error: Unable to play stream')
              hls.destroy()
              break
          }
        }
      })

      hls.on(Hls.Events.FRAG_LOADED, () => {
        console.log('Fragment loaded successfully')
      })

      hls.loadSource(selectedChannel.streamUrl)
      hls.attachMedia(video)
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      console.log('Using Safari native HLS')
      video.src = selectedChannel.streamUrl
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
        video.play().catch(err => {
          console.error('Safari autoplay failed:', err)
          setError('Click play button to start')
        })
      })
      video.addEventListener('error', (e) => {
        console.error('Safari video error:', e)
        setError('Error loading video stream')
        setIsLoading(false)
      })
    } else {
      setError('HLS not supported in this browser')
      setIsLoading(false)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [selectedChannel])

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel)
    setError(null)
  }

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error('Manual play failed:', err))
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-7xl mx-auto mobile-padding sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiRadio className="text-red-600 w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Live TV</h1>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-red-600/20 border border-red-600 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-red-500 text-xs font-bold uppercase">Live</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm sm:text-lg">Watch live TV channels streaming now</p>
        </div>

        {/* Player Section */}
        {selectedChannel ? (
          <div className="mb-8">
            <div className="relative bg-black rounded-lg overflow-hidden border-2 border-red-600/50 shadow-2xl shadow-red-600/20">
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  playsInline
                  autoPlay
                  muted={false}
                />
                
                {/* Loading Spinner */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent mb-4"></div>
                      <p className="text-white text-lg font-semibold">Loading stream...</p>
                      <p className="text-gray-400 text-sm mt-2">Please wait</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="text-center max-w-md mx-4">
                      <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-white text-xl font-bold mb-2">Stream Error</h3>
                      <p className="text-gray-300 text-sm mb-4">{error}</p>
                      <button
                        onClick={handlePlayClick}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                      >
                        <FiPlay className="w-5 h-5" />
                        Retry Stream
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Channel Info Bar */}
              <div className="bg-neutral-900/95 backdrop-blur-sm p-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedChannel.logo}
                      alt={selectedChannel.name}
                      className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                    />
                    <div>
                      <h3 className="text-white font-bold text-lg">{selectedChannel.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{selectedChannel.country}</span>
                        <span>•</span>
                        <span className="text-red-500">{selectedChannel.category}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                          </span>
                          <span className="text-red-500 font-semibold">LIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors touch-target"
                    >
                      <FiMaximize className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Channels Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Available Channels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(channel)}
                className={`group relative bg-neutral-900 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-2xl ${
                  selectedChannel?.id === channel.id
                    ? 'border-red-600 shadow-xl shadow-red-600/20'
                    : 'border-neutral-800 hover:border-red-600/50'
                }`}
              >
                <div className="aspect-square p-4 flex items-center justify-center bg-white">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="p-3 bg-neutral-900">
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">{channel.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                    </span>
                    <span className="text-red-500 font-semibold">LIVE</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{channel.category}</p>
                </div>

                {selectedChannel?.id === channel.id && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1.5 bg-red-600 rounded-full">
                      <FiPlay className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* No Channel Selected Message */}
        {!selectedChannel && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full">
              <FiRadio className="text-red-600" />
              <span className="text-gray-400 text-sm">Select a channel to start watching</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveTV
