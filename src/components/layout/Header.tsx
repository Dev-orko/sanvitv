import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;
import {
  FiSearch, FiUser, FiBell, FiMenu, FiSettings, FiLogOut, FiHeart, 
  FiFilm, FiTv, FiTrendingUp, FiX, FiHome, FiClock, FiStar, FiDownload, FiPlay, FiRadio, FiAward
} from 'react-icons/fi';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';

// --- TYPE DEFINITIONS ---
interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv' | string;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: string;
  read: boolean;
}

interface User {
  name: string;
  email: string;
  avatarInitial: string;
  plan: string;
}

// --- MOCK DATA ---
const MOCK_USER: User = {
  name: 'Orko Biswas',
  email: 'orkobiswas.mail@gmail.com',
  avatarInitial: 'O',
  plan: 'Developer',
};

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 1, title: "New Episode Available", message: "Succession S4E10 is now streaming", time: "2m ago", type: "new", read: false },
    { id: 2, title: "Download Complete", message: "Oppenheimer (2023) is ready to watch", time: "1h ago", type: "download", read: false },
    { id: 3, title: "Watchlist Update", message: "Dune: Part Two is now available", time: "3h ago", type: "update", read: true },
    { id: 4, title: "Top Pick For You", message: "Based on your interest in Sci-Fi", time: "1d ago", type: "recommend", read: true },
];

const MOCK_SEARCH_HISTORY = ['Inception', 'The Bear', 'Stranger Things'];

// --- HOOKS ---
const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => setScrollPosition(window.pageYOffset);
    window.addEventListener('scroll', updatePosition);
    updatePosition();
    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};


// --- SUB-COMPONENTS ---

const Logo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // If already on homepage, reload and scroll to top
      window.location.reload();
    } else {
      // Navigate to homepage
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      onClick={handleLogoClick}
      className="flex items-center cursor-pointer select-none touch-target"
    >
      <div className="relative">
        {/* Netflix-style bold text - smaller on mobile */}
        <span className="text-[18px] sm:text-[24px] md:text-[28px] font-black tracking-[-0.05em] leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontStretch: 'condensed', letterSpacing: '-0.02em' }}>
          <span className="text-[#E50914]">sanviplex</span>
        </span>
      </div>
    </div>
  );
};

const DesktopNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const menuItems = [
      { label: 'Home', path: '/' },
      { label: 'Movies', path: '/movies' },
      { label: 'Series', path: '/series' },
      { label: 'New & Popular', path: '/new-popular' },
      { label: 'Live TV', path: '/live-tv', live: true },
    ];

    return (
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`relative px-2 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors duration-300 ${isActive ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <span className="flex items-center gap-1.5">
                  {item.label}
                  {item.live && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                  )}
                </span>
                {isActive && (
                  <MotionDiv
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                    layoutId="underline"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>
    );
};

const DesktopSearch = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem('searchHistory');
        return saved ? JSON.parse(saved) : MOCK_SEARCH_HISTORY;
    });
    const debouncedQuery = useDebounce(query, 500);

    // Fetch search results from TMDB
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const searchMovies = async () => {
            setIsSearching(true);
            try {
                const response = await axios.get(
                    `${API_CONFIG.TMDB_BASE_URL}/search/multi?api_key=${API_CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(debouncedQuery)}&page=1`
                );
                const filtered = response.data.results
                    .filter((r: SearchResult) => r.media_type === 'movie' || r.media_type === 'tv')
                    .slice(0, 6);
                setResults(filtered);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        searchMovies();
    }, [debouncedQuery]);

    const handleResultClick = (result: SearchResult) => {
        const title = result.title || result.name || '';
        
        // Add to search history
        const newHistory = [title, ...searchHistory.filter(h => h !== title)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        
        // Navigate to detail page
        navigate(`/${result.media_type}/${result.id}`);
        setQuery('');
        setIsFocused(false);
    };

    const handleHistoryClick = (term: string) => {
        setQuery(term);
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    return (
        <div className="relative hidden md:block">
            <MotionDiv 
                className="relative flex items-center"
                animate={{ width: isFocused ? 260 : 180 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
                <FiSearch className="absolute left-3 text-neutral-500 pointer-events-none" size={16} />
                <input 
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="w-full h-9 pl-10 pr-3 bg-neutral-800/50 text-white text-sm placeholder-neutral-500 border border-transparent rounded-full transition-colors duration-300 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
                />
            </MotionDiv>
            <AnimatePresence>
                {isFocused && (query.length > 0 || MOCK_SEARCH_HISTORY.length > 0) && (
                    <MotionDiv
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-full max-w-[350px] bg-neutral-900/80 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-2xl overflow-hidden"
                    >
                         {isSearching ? (
                            <div className="flex items-center justify-center p-6">
                                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : results.length > 0 ? (
                            results.map(result => (
                                <div 
                                    key={result.id} 
                                    onClick={() => handleResultClick(result)}
                                    className="flex items-center gap-3 p-3 hover:bg-neutral-800 cursor-pointer transition-colors"
                                >
                                    {result.poster_path ? (
                                        <img 
                                            src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} 
                                            alt={result.title || result.name} 
                                            className="w-10 h-14 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-14 bg-neutral-700 rounded flex items-center justify-center">
                                            {result.media_type === 'tv' ? <FiTv className="text-neutral-500" /> : <FiFilm className="text-neutral-500" />}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-white text-sm line-clamp-1">{result.title || result.name}</p>
                                        <p className="text-xs text-neutral-400">
                                            {result.media_type === 'tv' ? 'TV Series' : 'Movie'}
                                            {result.release_date && ` • ${result.release_date.split('-')[0]}`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : query.length > 1 ? (
                             <p className="text-center text-sm text-neutral-400 p-4">No results for "{query}"</p>
                        ) : (
                            <div className="p-2">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <h4 className="text-xs font-semibold text-neutral-500 uppercase">Recent Searches</h4>
                                    {searchHistory.length > 0 && (
                                        <button 
                                            onClick={clearHistory}
                                            className="text-xs text-neutral-500 hover:text-red-500 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                {searchHistory.length > 0 ? (
                                    searchHistory.map((term, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => handleHistoryClick(term)}
                                            className="flex items-center gap-3 p-3 hover:bg-neutral-800 rounded-md cursor-pointer text-sm text-neutral-200"
                                        >
                                            <FiClock className="text-neutral-500" />
                                            <span>{term}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-xs text-neutral-500 p-4">No recent searches</p>
                                )}
                            </div>
                        )}
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

const DropdownPanel = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    
    return (
        <MotionDiv
            ref={panelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[400px] rounded-2xl overflow-hidden shadow-2xl z-[110]"
            style={{
                background: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7), 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
        >
            {children}
        </MotionDiv>
    );
};

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    
    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
        <DropdownPanel onClose={onClose}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-neutral-800/30">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-600 rounded-full text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-900/30 scrollbar-track-transparent p-2">
                {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                        <MotionDiv 
                            key={n.id} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                            className="group relative mb-2 last:mb-0"
                        >
                            <motion.div
                                className="p-3 rounded-lg cursor-pointer overflow-hidden relative"
                                onClick={() => markAsRead(n.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: !n.read ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
                                }}
                            >
                                {/* Red accent bar for unread */}
                                {!n.read && (
                                    <motion.div 
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600"
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: i * 0.05 + 0.2 }}
                                    />
                                )}
                                
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-white text-sm line-clamp-1 flex-1">
                                                {n.title}
                                            </h4>
                                            {!n.read && (
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                            )}
                                        </div>
                                        <p className="text-neutral-400 text-xs mb-1.5 line-clamp-1">
                                            {n.message}
                                        </p>
                                        <span className="text-[10px] text-neutral-600">{n.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </MotionDiv>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-14 h-14 rounded-full bg-neutral-900/50 flex items-center justify-center mb-3">
                            <FiBell className="text-neutral-600" size={24} />
                        </div>
                        <p className="text-neutral-500 text-sm">No notifications</p>
                    </div>
                )}
            </div>
        </DropdownPanel>
    );
};

const ProfilePanel = ({ onClose, user }: { onClose: () => void, user: User }) => {
    const navigate = useNavigate();
    
    const menuItems = [
      { icon: FiUser, label: 'My Profile', path: '/profile' },
      { icon: FiHeart, label: 'Watchlist', path: '/watchlist' },
      { icon: FiDownload, label: 'Downloads', path: '/downloads' },
      { icon: FiSettings, label: 'Settings', path: '/settings' },
    ];
    
    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };
    
    const handleSignOut = () => {
        console.log('Signing out...');
        onClose();
    };
    
    return (
        <DropdownPanel onClose={onClose}>
            {/* Profile Header */}
            <div className="p-5 border-b border-neutral-800/30">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-red-500/30 shadow-lg">
                        <img 
                            src="/orko.jpeg" 
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base line-clamp-1">{user.name}</h3>
                        <p className="text-neutral-500 text-xs line-clamp-1">{user.email}</p>
                    </div>
                </div>
                {/* Owner Rank Badge */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.1))',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        boxShadow: '0 0 20px rgba(234, 179, 8, 0.2)'
                    }}
                >
                    <FiAward className="text-yellow-500" size={14} />
                    <span className="text-yellow-500 text-xs font-bold uppercase tracking-wide">Owner Rank</span>
                </motion.div>
            </div>
            
            {/* Menu Items */}
            <div className="p-3 space-y-1">
                {menuItems.map((item, i) => (
                    <MotionButton 
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left group transition-all"
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                            <item.icon className="text-red-400 group-hover:text-red-300 transition-colors" size={16} />
                        </div>
                        <span className="text-neutral-300 text-sm font-medium group-hover:text-white transition-colors flex-1">
                            {item.label}
                        </span>
                        <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="text-neutral-600"
                        >
                            <FiPlay size={12} className="rotate-180" />
                        </motion.div>
                    </MotionButton>
                ))}
            </div>
            
            {/* Sign Out */}
            <div className="p-3 border-t border-white/5">
                <MotionButton 
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left group transition-all"
                    style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                >
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/30 transition-colors">
                        <FiLogOut className="text-red-400 group-hover:text-red-300 transition-colors" size={16} />
                    </div>
                    <span className="text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors flex-1">
                        Sign Out
                    </span>
                </MotionButton>
            </div>
        </DropdownPanel>
    );
};


// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const menuItems = [
      { icon: FiHome, label: 'Home', path: '/' },
      { icon: FiFilm, label: 'Movies', path: '/movies' },
      { icon: FiTv, label: 'Series', path: '/series' },
      { icon: FiTrendingUp, label: 'New & Popular', path: '/new-popular' },
      { icon: FiRadio, label: 'Live TV', path: '/live-tv', live: true },
      { icon: FiHeart, label: 'My Watchlist', path: '/watchlist' },
      { icon: FiDownload, label: 'Downloads', path: '/downloads' },
      { icon: FiSettings, label: 'Settings', path: '/settings' },
    ];
    
    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
                    />
                    
                    {/* Slide-out Menu */}
                    <MotionDiv
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[320px] bg-neutral-900 z-50 md:hidden overflow-y-auto hide-scrollbar-mobile"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-red-500/30">
                                    <img 
                                        src="/orko.jpeg" 
                                        alt={MOCK_USER.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm line-clamp-1">{MOCK_USER.name}</h3>
                                    <p className="text-neutral-400 text-xs">{MOCK_USER.plan}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 transition-colors touch-target">
                                <FiX className="text-white" size={22} />
                            </button>
                        </div>
                        
                        {/* Navigation Items */}
                        <div className="p-2 mt-2">
                            {menuItems.map((item, index) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <MotionDiv
                                        key={item.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <button
                                            onClick={() => handleNavigation(item.path)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors touch-target ${
                                                isActive 
                                                    ? 'bg-red-600 text-white' 
                                                    : 'text-neutral-300 hover:bg-neutral-800'
                                            }`}
                                        >
                                            <item.icon size={22} />
                                            <span className="font-medium text-base flex-1 text-left">{item.label}</span>
                                            {item.live && (
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                                                </span>
                                            )}
                                        </button>
                                    </MotionDiv>
                                );
                            })}
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 mt-auto border-t border-neutral-800">
                            <button className="w-full flex items-center gap-4 p-4 rounded-lg text-red-500 hover:bg-neutral-800 transition-colors touch-target">
                                <FiLogOut size={22} />
                                <span className="font-medium text-base">Sign Out</span>
                            </button>
                        </div>
                    </MotionDiv>
                </>
            )}
        </AnimatePresence>
    );
};

// Mobile Search Modal
const MobileSearch = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem('searchHistory');
        return saved ? JSON.parse(saved) : MOCK_SEARCH_HISTORY;
    });
    const debouncedQuery = useDebounce(query, 500);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const searchMovies = async () => {
            setIsSearching(true);
            try {
                const response = await axios.get(
                    `${API_CONFIG.TMDB_BASE_URL}/search/multi?api_key=${API_CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(debouncedQuery)}&page=1`
                );
                const filtered = response.data.results
                    .filter((r: SearchResult) => r.media_type === 'movie' || r.media_type === 'tv')
                    .slice(0, 10);
                setResults(filtered);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        searchMovies();
    }, [debouncedQuery]);

    const handleResultClick = (result: SearchResult) => {
        const title = result.title || result.name || '';
        
        const newHistory = [title, ...searchHistory.filter(h => h !== title)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        
        navigate(`/${result.media_type}/${result.id}`);
        setQuery('');
        onClose();
    };

    const handleHistoryClick = (term: string) => {
        setQuery(term);
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-neutral-900 z-50 md:hidden flex flex-col"
                >
                    {/* Search Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-neutral-800">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 transition-colors touch-target">
                            <FiX className="text-white" size={22} />
                        </button>
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search movies & series..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-neutral-800 text-white text-base placeholder-neutral-500 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 touch-target"
                            />
                        </div>
                    </div>
                    
                    {/* Search Results */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar-mobile">
                        {isSearching ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : results.length > 0 ? (
                            <div className="p-2">
                                {results.map(result => (
                                    <div 
                                        key={result.id} 
                                        onClick={() => handleResultClick(result)}
                                        className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors touch-target"
                                    >
                                        {result.poster_path ? (
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} 
                                                alt={result.title || result.name} 
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-16 bg-neutral-700 rounded flex items-center justify-center">
                                                {result.media_type === 'tv' ? <FiTv className="text-neutral-500" size={20} /> : <FiFilm className="text-neutral-500" size={20} />}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-white text-base line-clamp-1">{result.title || result.name}</p>
                                            <p className="text-sm text-neutral-400">
                                                {result.media_type === 'tv' ? 'TV Series' : 'Movie'}
                                                {result.release_date && ` • ${result.release_date.split('-')[0]}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : query.length > 1 ? (
                            <div className="text-center p-12">
                                <FiSearch className="mx-auto text-neutral-600 mb-3" size={40} />
                                <p className="text-neutral-400">No results for "{query}"</p>
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-neutral-400 uppercase">Recent Searches</h4>
                                    {searchHistory.length > 0 && (
                                        <button 
                                            onClick={clearHistory}
                                            className="text-sm text-neutral-500 hover:text-red-500 transition-colors touch-target"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                {searchHistory.length > 0 ? (
                                    <div className="space-y-2">
                                        {searchHistory.map((term, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => handleHistoryClick(term)}
                                                className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg cursor-pointer text-base text-neutral-200 touch-target"
                                            >
                                                <FiClock className="text-neutral-500" size={20} />
                                                <span>{term}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-neutral-500 p-8">No recent searches</p>
                                )}
                            </div>
                        )}
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};


// --- MAIN HEADER COMPONENT ---

export default function Header() {
    const scrollPosition = useScrollPosition();
    const [openDropdown, setOpenDropdown] = useState<'notifications' | 'profile' | null>(null);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
    
    const isScrolled = scrollPosition > 10;
    
    const closeAllPopups = useCallback(() => {
      setOpenDropdown(null);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }, []);

    const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

    return (
        <>
            {/* Mobile Menu */}
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            
            {/* Mobile Search */}
            <MobileSearch isOpen={isMobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
            
            <MotionDiv 
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 rounded-b-[32px] overflow-visible`}
                animate={{
                    background: isScrolled ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                }}
                style={{
                    boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
                    border: isScrolled ? '2px solid rgba(255, 255, 255, 0.12)' : '2px solid rgba(255, 255, 255, 0.08)',
                    borderTop: 'none'
                }}
            >
                <div className="flex items-center justify-between px-4 sm:px-4 md:px-6 h-16 sm:h-18 md:h-20 max-w-7xl mx-auto">
                    {/* Left: Mobile Menu + Logo */}
                    <div className="flex items-center gap-3 sm:gap-8">
                        {/* Mobile Menu Button - Hidden on mobile since we have bottom nav */}
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="hidden md:hidden p-3 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-700/50 transition-colors touch-target active:scale-95"
                        >
                            <FiMenu size={24} />
                        </button>
                        
                        <Logo />
                        <DesktopNav />
                    </div>
                    
                    {/* Right: Search + Notifications + Profile */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                        <DesktopSearch />

                        {/* Mobile Search Button */}
                        <button 
                            onClick={() => setMobileSearchOpen(true)}
                            className="md:hidden p-3 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-700/50 transition-colors touch-target active:scale-95"
                        >
                            <FiSearch size={22} />
                        </button>
                        
                        {/* Notifications */}
                        <div className="relative">
                           <motion.button 
                                onClick={() => setOpenDropdown(p => p === 'notifications' ? null : 'notifications')} 
                                className="relative p-2.5 sm:p-2.5 rounded-full text-neutral-300 transition-all touch-target active:scale-90"
                                animate={{
                                    backgroundColor: openDropdown === 'notifications' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0)',
                                    color: openDropdown === 'notifications' ? '#ef4444' : '#d4d4d8',
                                    scale: openDropdown === 'notifications' ? 0.95 : 1
                                }}
                                whileHover={{ 
                                    scale: 1.05,
                                    backgroundColor: openDropdown === 'notifications' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(115, 115, 115, 0.3)'
                                }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                {unreadCount > 0 && (
                                    <MotionDiv
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                        className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-neutral-900 shadow-lg"
                                    >
                                        {unreadCount}
                                    </MotionDiv>
                                )}
                                <motion.div
                                    animate={{ rotate: openDropdown === 'notifications' ? [0, -10, 10, -10, 0] : 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <FiBell size={22} />
                                </motion.div>
                            </motion.button>
                            <AnimatePresence>
                                {openDropdown === 'notifications' && <NotificationPanel onClose={closeAllPopups} />}
                            </AnimatePresence>
                        </div>
                        
                        {/* Profile */}
                        <div className="relative">
                            <motion.button 
                                onClick={() => setOpenDropdown(p => p === 'profile' ? null : 'profile')} 
                                className="relative w-10 h-10 sm:w-10 sm:h-10 rounded-full overflow-hidden touch-target shadow-lg transition-all ring-2 active:scale-90"
                                animate={{
                                    scale: openDropdown === 'profile' ? 0.95 : 1
                                }}
                                style={{
                                    boxShadow: openDropdown === 'profile' 
                                        ? '0 0 0 4px rgba(239, 68, 68, 0.3), 0 8px 24px rgba(239, 68, 68, 0.4)'
                                        : '0 0 0 2px rgba(239, 68, 68, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)'
                                }}
                                whileHover={{ scale: openDropdown === 'profile' ? 0.95 : 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <img 
                                    src="/orko.jpeg" 
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </motion.button>
                             <AnimatePresence>
                                {openDropdown === 'profile' && <ProfilePanel onClose={closeAllPopups} user={MOCK_USER} />}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </MotionDiv>
        </>
    );
}
