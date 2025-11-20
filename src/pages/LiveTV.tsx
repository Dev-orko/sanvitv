import React, { useState, useRef } from 'react'
import { FiRadio, FiPlay, FiMaximize, FiVolume2, FiVolumeX } from 'react-icons/fi'

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const channels: Channel[] = [
    {
      id: 'tsports',
      name: 'T Sports',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d7/T_Sports_logo.svg/1200px-T_Sports_logo.svg.png',
      streamUrl: 'blob:http://192.168.91.8/e06e0dad-5d76-42e0-86a0-1425c4b1eff7',
      country: '🇧🇩 Bangladesh',
      category: 'Sports'
    }
  ]

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
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
                  src={selectedChannel.streamUrl}
                  className="w-full h-full"
                  controls
                  autoPlay
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Custom Controls Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <button
                      onClick={handlePlay}
                      className="p-6 bg-red-600 rounded-full hover:bg-red-700 transition-all transform hover:scale-110 shadow-2xl"
                    >
                      <FiPlay className="w-12 h-12 text-white" />
                    </button>
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
                      onClick={toggleMute}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      {isMuted ? <FiVolumeX className="w-5 h-5 text-white" /> : <FiVolume2 className="w-5 h-5 text-white" />}
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
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
