import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiChevronRight } from 'react-icons/fi';
import AuthModal from '../components/auth/AuthModal';

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleGetStarted = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleSignIn = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Image with Gradient Overlays */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: 'url(https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg)',
          }}
        />
        {/* Netflix-style gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-4 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <FiPlay className="text-red-600 text-3xl md:text-4xl" />
            <span className="text-3xl md:text-4xl font-black text-red-600" style={{ letterSpacing: '0.05em' }}>
              Sanvika Flix
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleSignIn}
            className="px-5 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors text-sm md:text-base"
          >
            Sign In
          </motion.button>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 min-h-[calc(100vh-88px)] flex items-center px-4 md:px-12">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
          >
            Unlimited movies, TV shows, and more
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white mb-6"
          >
            Watch anywhere. Cancel anytime.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg text-neutral-300 mb-8"
          >
            Ready to watch? Enter your email to create or restart your membership.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-red-600 text-white text-lg md:text-xl font-bold rounded flex items-center justify-center gap-2 hover:bg-red-700 transition-all transform hover:scale-105"
            >
              Get Started
              <FiChevronRight className="text-2xl group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode}
      />
    </div>
  );
};

export default Landing;
