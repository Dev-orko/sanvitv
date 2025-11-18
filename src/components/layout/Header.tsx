import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;
import {
  FiSearch, FiUser, FiBell, FiMenu, FiSettings, FiLogOut, FiHeart, 
  FiFilm, FiTv, FiTrendingUp, FiX, FiHome, FiClock, FiStar, FiDownload, FiPlay
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
  
  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      onClick={handleLogoClick}
      className="flex items-center cursor-pointer select-none"
    >
      <div className="relative">
        {/* Netflix-style bold text with condensed/tall appearance */}
        <span className="text-[20px] sm:text-[24px] md:text-[28px] font-black tracking-[-0.05em] leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontStretch: 'condensed', letterSpacing: '-0.02em' }}>
          <span className="text-[#E50914]">SanviTV</span>
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
                {item.label}
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
    return (
        <MotionDiv
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-full right-0 mt-2 sm:mt-4 w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[400px] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl z-50 bg-neutral-900/80 backdrop-blur-xl border border-neutral-700"
        >
            {children}
        </MotionDiv>
    );
};

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
    // Component content remains largely the same, but with refined styling
    // This is mostly to demonstrate structure; styles would be in className
    return (
        <DropdownPanel onClose={onClose}>
            <div className="p-3 sm:p-4 border-b border-neutral-700 flex items-center justify-between">
                <h3 className="font-bold text-white text-base sm:text-lg">Notifications</h3>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-700 transition-colors text-neutral-400 hover:text-white"><FiX size={18} /></button>
            </div>
            <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto scrollbar-hide custom-scrollbar">
                {MOCK_NOTIFICATIONS.map((n, i) => (
                     <MotionDiv key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                         className={`p-4 border-b border-neutral-800 cursor-pointer transition-colors hover:bg-neutral-800 ${!n.read ? 'bg-red-600/5' : ''}`}>
                         {/* ... Notification item JSX ... */}
                     </MotionDiv>
                ))}
            </div>
        </DropdownPanel>
    );
};

const ProfilePanel = ({ onClose, user }: { onClose: () => void, user: User }) => {
    const menuItems = [
      { icon: FiUser, label: 'My Profile' },
      { icon: FiHeart, label: 'Watchlist' },
      { icon: FiDownload, label: 'Downloads' },
      { icon: FiSettings, label: 'Settings' },
    ];
    
    return (
        <DropdownPanel onClose={onClose}>
            <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                        {user.avatarInitial}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base sm:text-lg line-clamp-1">{user.name}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm line-clamp-1">{user.email}</p>
                    </div>
                </div>
                 <div className="mt-4 px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs font-bold text-white inline-block">
                    {user.plan.toUpperCase()}
                 </div>
            </div>
             <div className="p-2 border-t border-neutral-800">
                {menuItems.map((item, i) => (
                    <MotionButton key={item.label} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: 4 }}
                        className="w-full flex items-center gap-4 p-3 rounded-lg text-left">
                        <item.icon className="text-neutral-400" size={20} />
                        <span className="text-neutral-200 font-medium">{item.label}</span>
                    </MotionButton>
                ))}
            </div>
            <div className="p-2 border-t border-neutral-700">
                 <MotionButton whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: 4 }} className="w-full flex items-center gap-4 p-3 rounded-lg text-left">
                    <FiLogOut className="text-red-500" size={20} />
                    <span className="text-red-500 font-medium">Sign Out</span>
                </MotionButton>
            </div>
        </DropdownPanel>
    );
};


// --- MAIN HEADER COMPONENT ---

export default function Header() {
    const scrollPosition = useScrollPosition();
    const [openDropdown, setOpenDropdown] = useState<'notifications' | 'profile' | null>(null);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const isScrolled = scrollPosition > 10;
    
    const closeAllPopups = useCallback(() => {
      setOpenDropdown(null);
      setMobileMenuOpen(false);
    }, []);

    const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

    return (
        <>
            <MotionDiv 
                className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300`}
                animate={{
                    background: isScrolled ? 'rgba(10, 10, 10, 0.7)' : 'linear-gradient(180deg, rgba(10,10,10,0.7) 0%, transparent 100%)',
                    backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
                    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'
                }}
            >
                <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-16 sm:h-18 md:h-20 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <DesktopNav />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                        <DesktopSearch />

                        {/* Mobile Search Button */}
                           <MotionButton 
                           className="p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-700/50 transition-colors md:hidden"
                           whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        >
                            <FiSearch size={18} />
                        </MotionButton>                        {/* Notifications */}
                        <div className="relative">
                           <MotionButton 
                                onClick={() => setOpenDropdown(p => p === 'notifications' ? null : 'notifications')} 
                                className="p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-700/50 transition-colors"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            >
                                {unreadCount > 0 && (
                                    <MotionDiv
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-neutral-900"
                                    >
                                        {unreadCount}
                                    </MotionDiv>
                                )}
                                <FiBell size={20} />
                            </MotionButton>
                            <AnimatePresence>
                                {openDropdown === 'notifications' && <NotificationPanel onClose={closeAllPopups} />}
                            </AnimatePresence>
                        </div>
                        
                        {/* Profile */}
                        <div className="relative">
                            <MotionButton 
                                onClick={() => setOpenDropdown(p => p === 'profile' ? null : 'profile')} 
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg" 
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            >
                                {MOCK_USER.avatarInitial}
                            </MotionButton>
                             <AnimatePresence>
                                {openDropdown === 'profile' && <ProfilePanel onClose={closeAllPopups} user={MOCK_USER} />}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Menu Button */}
                        <MotionButton className="md:hidden p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-700/50 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setMobileMenuOpen(true)}>
                            <FiMenu size={20} />
                        </MotionButton>
                    </div>
                </div>
            </MotionDiv>
        </>
    );
}
