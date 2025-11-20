import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiFilm, FiTv, FiTrendingUp, FiRadio } from 'react-icons/fi'

const MobileNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiFilm, label: 'Movies', path: '/movies' },
    { icon: FiTv, label: 'Series', path: '/series' },
    { icon: FiTrendingUp, label: 'Popular', path: '/new-popular' },
    { icon: FiRadio, label: 'Live TV', path: '/live-tv' },
  ]

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all touch-target min-w-[60px]"
              whileTap={{ scale: 0.9 }}
              style={{
                background: isActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent'
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-red-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#ef4444' : '#a3a3a3'
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              {/* Label */}
              <motion.span
                className="text-[10px] font-medium mt-1"
                animate={{
                  color: isActive ? '#ef4444' : '#737373',
                  fontWeight: isActive ? 600 : 500
                }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default MobileNav
