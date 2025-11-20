import React from 'react'
import { FiRadio } from 'react-icons/fi'

const LiveTV: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiRadio className="text-red-600 w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Live TV</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-red-500 text-xs font-bold uppercase">Live</span>
            </div>
          </div>
          <p className="text-gray-400 text-lg">Watch live TV channels streaming now</p>
        </div>

        {/* Coming Soon Message */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center animate-pulse">
              <FiRadio className="text-white w-16 h-16" />
            </div>
            <div className="absolute -top-2 -right-2">
              <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600"></span>
              </span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Live TV Coming Soon!</h2>
          <p className="text-gray-400 text-lg max-w-2xl mb-8">
            We're working hard to bring you live TV streaming. Stay tuned for 24/7 access to your favorite channels.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="px-6 py-3 bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-neutral-400 text-sm">Expected Features</p>
              <p className="text-white font-semibold">Live Sports • News • Entertainment</p>
            </div>
            <div className="px-6 py-3 bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-neutral-400 text-sm">Coming In</p>
              <p className="text-white font-semibold">Q1 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveTV
