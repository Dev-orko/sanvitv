import React from 'react'
import { motion } from 'framer-motion'

export default function EnhancedLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <motion.div className="relative">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-transparent border-t-red-500 border-r-red-500"
        />
        
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 w-12 h-12 rounded-full border-2 border-transparent border-b-red-400 border-l-red-400"
        />
        
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-500/20 blur-xl animate-pulse" />
      </motion.div>
    </div>
  )
}

export function GlassmorphicSkeleton({ aspectRatio = '27/40' }: { aspectRatio?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group"
    >
      <div 
        className="relative overflow-hidden rounded-2xl mb-4"
        style={{ 
          aspectRatio,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.1)'
        }}
      >
        {/* Animated gradient */}
        <motion.div
          animate={{ 
            background: [
              'linear-gradient(45deg, rgba(239, 68, 68, 0.1) 0%, transparent 50%, rgba(239, 68, 68, 0.05) 100%)',
              'linear-gradient(45deg, transparent 0%, rgba(239, 68, 68, 0.1) 50%, transparent 100%)',
              'linear-gradient(45deg, rgba(239, 68, 68, 0.05) 0%, transparent 50%, rgba(239, 68, 68, 0.1) 100%)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
        
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        
        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
            className="absolute w-1 h-1 bg-red-400/60 rounded-full"
            style={{
              left: 20 + i * 30 + '%',
              top: 20 + i * 20 + '%'
            }}
          />
        ))}
      </div>
      
      {/* Title skeleton */}
      <div className="space-y-3">
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-4 rounded-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            width: Math.random() * 40 + 60 + '%'
          }}
        />
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
          className="h-3 rounded-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            width: Math.random() * 30 + 40 + '%'
          }}
        />
      </div>
    </motion.div>
  )
}