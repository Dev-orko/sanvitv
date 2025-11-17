// VidSrc.xyz API - Movie streaming embed URL
export function vidsrcMovieEmbedUrl({ imdb, tmdb, sub_url, ds_lang, autoplay }: { imdb?: string; tmdb?: number | string; sub_url?: string; ds_lang?: string; autoplay?: 0 | 1 }) {
  const base = 'https://vidsrc.xyz/embed/movie'
  const params = new URLSearchParams()
  
  if (imdb) params.set('imdb', imdb)
  if (tmdb) params.set('tmdb', String(tmdb))
  if (sub_url) params.set('sub_url', sub_url)
  if (ds_lang) params.set('ds_lang', ds_lang)
  if (autoplay !== undefined) params.set('autoplay', String(autoplay))
  
  const s = params.toString()
  return s ? `${base}?${s}` : base
}

// VidSrc.xyz API - TV show/episode streaming embed URL
export function vidsrcTvEmbedUrl({ imdb, tmdb, season, episode, sub_url, ds_lang, autoplay, autonext }: { 
  imdb?: string; 
  tmdb?: number | string; 
  season?: number; 
  episode?: number; 
  sub_url?: string; 
  ds_lang?: string; 
  autoplay?: 0 | 1; 
  autonext?: 0 | 1 
}) {
  const base = 'https://vidsrc.xyz/embed/tv'
  const params = new URLSearchParams()
  
  if (imdb) params.set('imdb', imdb)
  if (tmdb) params.set('tmdb', String(tmdb))
  if (season !== undefined) params.set('season', String(season))
  if (episode !== undefined) params.set('episode', String(episode))
  if (sub_url) params.set('sub_url', sub_url)
  if (ds_lang) params.set('ds_lang', ds_lang)
  if (autoplay !== undefined) params.set('autoplay', String(autoplay))
  if (autonext !== undefined) params.set('autonext', String(autonext))
  
  const s = params.toString()
  return s ? `${base}?${s}` : base
}

// VidSrc.xyz API - Get latest movies list
export async function getLatestMovies(page: number = 1): Promise<any> {
  try {
    const response = await fetch(`https://vidsrc.xyz/movies/latest/page-${page}.json`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch latest movies:', error)
    throw error
  }
}

// VidSrc.xyz API - Get latest TV shows list  
export async function getLatestTvShows(page: number = 1): Promise<any> {
  try {
    const response = await fetch(`https://vidsrc.xyz/tvshows/latest/page-${page}.json`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch latest TV shows:', error)
    throw error
  }
}

// VidSrc.xyz API - Get latest episodes list
export async function getLatestEpisodes(page: number = 1): Promise<any> {
  try {
    const response = await fetch(`https://vidsrc.xyz/episodes/latest/page-${page}.json`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch latest episodes:', error)
    throw error
  }
}

// =============================================================================
// VidLink.pro API Functions
// =============================================================================

// VidLink.pro API - Movie embed URL
export function vidlinkMovieEmbedUrl({ 
  tmdbId, 
  primaryColor, 
  secondaryColor, 
  icons, 
  iconColor, 
  title, 
  poster, 
  autoplay, 
  player, 
  startAt, 
  sub_file, 
  sub_label 
}: {
  tmdbId: number | string;
  primaryColor?: string;
  secondaryColor?: string;
  icons?: 'vid' | 'default';
  iconColor?: string;
  title?: boolean;
  poster?: boolean;
  autoplay?: boolean;
  player?: 'jw';
  startAt?: number;
  sub_file?: string;
  sub_label?: string;
}) {
  const base = `https://vidlink.pro/movie/${tmdbId}`
  const params = new URLSearchParams()
  
  if (primaryColor) params.set('primaryColor', primaryColor)
  if (secondaryColor) params.set('secondaryColor', secondaryColor)
  if (icons) params.set('icons', icons)
  if (iconColor) params.set('iconColor', iconColor)
  if (title !== undefined) params.set('title', String(title))
  if (poster !== undefined) params.set('poster', String(poster))
  if (autoplay !== undefined) params.set('autoplay', String(autoplay))
  if (player) params.set('player', player)
  if (startAt !== undefined) params.set('startAt', String(startAt))
  if (sub_file) params.set('sub_file', sub_file)
  if (sub_label) params.set('sub_label', sub_label)
  
  const s = params.toString()
  return s ? `${base}?${s}` : base
}

// VidLink.pro API - TV show/episode embed URL
export function vidlinkTvEmbedUrl({ 
  tmdbId, 
  season, 
  episode, 
  primaryColor, 
  secondaryColor, 
  icons, 
  iconColor, 
  title, 
  poster, 
  autoplay, 
  nextbutton, 
  player, 
  startAt, 
  sub_file, 
  sub_label 
}: {
  tmdbId: number | string;
  season: number;
  episode: number;
  primaryColor?: string;
  secondaryColor?: string;
  icons?: 'vid' | 'default';
  iconColor?: string;
  title?: boolean;
  poster?: boolean;
  autoplay?: boolean;
  nextbutton?: boolean;
  player?: 'jw';
  startAt?: number;
  sub_file?: string;
  sub_label?: string;
}) {
  const base = `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
  const params = new URLSearchParams()
  
  if (primaryColor) params.set('primaryColor', primaryColor)
  if (secondaryColor) params.set('secondaryColor', secondaryColor)
  if (icons) params.set('icons', icons)
  if (iconColor) params.set('iconColor', iconColor)
  if (title !== undefined) params.set('title', String(title))
  if (poster !== undefined) params.set('poster', String(poster))
  if (autoplay !== undefined) params.set('autoplay', String(autoplay))
  if (nextbutton !== undefined) params.set('nextbutton', String(nextbutton))
  if (player) params.set('player', player)
  if (startAt !== undefined) params.set('startAt', String(startAt))
  if (sub_file) params.set('sub_file', sub_file)
  if (sub_label) params.set('sub_label', sub_label)
  
  const s = params.toString()
  return s ? `${base}?${s}` : base
}

// VidLink.pro API - Anime embed URL
export function vidlinkAnimeEmbedUrl({ 
  malId, 
  number, 
  subOrDub, 
  fallback, 
  primaryColor, 
  secondaryColor, 
  icons, 
  iconColor, 
  title, 
  poster, 
  autoplay, 
  player, 
  startAt, 
  sub_file, 
  sub_label 
}: {
  malId: number | string;
  number: number;
  subOrDub: 'sub' | 'dub';
  fallback?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  icons?: 'vid' | 'default';
  iconColor?: string;
  title?: boolean;
  poster?: boolean;
  autoplay?: boolean;
  player?: 'jw';
  startAt?: number;
  sub_file?: string;
  sub_label?: string;
}) {
  const base = `https://vidlink.pro/anime/${malId}/${number}/${subOrDub}`
  const params = new URLSearchParams()
  
  if (fallback !== undefined) params.set('fallback', String(fallback))
  if (primaryColor) params.set('primaryColor', primaryColor)
  if (secondaryColor) params.set('secondaryColor', secondaryColor)
  if (icons) params.set('icons', icons)
  if (iconColor) params.set('iconColor', iconColor)
  if (title !== undefined) params.set('title', String(title))
  if (poster !== undefined) params.set('poster', String(poster))
  if (autoplay !== undefined) params.set('autoplay', String(autoplay))
  if (player) params.set('player', player)
  if (startAt !== undefined) params.set('startAt', String(startAt))
  if (sub_file) params.set('sub_file', sub_file)
  if (sub_label) params.set('sub_label', sub_label)
  
  const s = params.toString()
  return s ? `${base}?${s}` : base
}

// =============================================================================
// VidSrc.icu API Functions  
// =============================================================================

// VidSrc.icu API - Movie embed URL
export function vidsrcIcuMovieEmbedUrl({ id }: { id: string | number }) {
  return `https://vidsrc.icu/embed/movie/${id}`
}

// VidSrc.icu API - TV show/episode embed URL
export function vidsrcIcuTvEmbedUrl({ 
  id, 
  season, 
  episode 
}: { 
  id: string | number; 
  season?: number; 
  episode?: number 
}) {
  let url = `https://vidsrc.icu/embed/tv/${id}`
  if (season !== undefined) url += `/${season}`
  if (episode !== undefined) url += `/${episode}`
  return url
}

// VidSrc.icu API - Anime embed URL
export function vidsrcIcuAnimeEmbedUrl({ 
  id, 
  episode, 
  dub 
}: { 
  id: string | number; 
  episode: number; 
  dub?: 0 | 1 
}) {
  let url = `https://vidsrc.icu/embed/anime/${id}/${episode}`
  if (dub !== undefined) url += `/${dub}`
  return url
}

// VidSrc.icu API - Manga embed URL
export function vidsrcIcuMangaEmbedUrl({ 
  id, 
  chapter 
}: { 
  id: string | number; 
  chapter: number 
}) {
  return `https://vidsrc.icu/embed/manga/${id}/${chapter}`
}

// VidSrc.icu API - Get movie list
export async function getVidsrcIcuMovies(page: number = 1): Promise<any> {
  try {
    const response = await fetch(`https://vidsrc.icu/movie/${page}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch VidSrc.icu movies:', error)
    throw error
  }
}

// VidSrc.icu API - Get TV show list
export async function getVidsrcIcuTvShows(page: number = 1): Promise<any> {
  try {
    const response = await fetch(`https://vidsrc.icu/tv/${page}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch VidSrc.icu TV shows:', error)
    throw error
  }
}

// VidSrc.icu API - Get TV episodes list
export async function getVidsrcIcuEpisodes(page: number = 1): Promise<any> {
  try {
    const response = await fetch(`https://vidsrc.icu/episodes/${page}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch VidSrc.icu episodes:', error)
    throw error
  }
}

// =============================================================================
// AutoEmbed.cc API Functions
// =============================================================================

// AutoEmbed.cc API - Movie embed URL
export function autoembedMovieEmbedUrl({ 
  id, 
  server 
}: { 
  id: string | number; 
  server?: number 
}) {
  let url = `https://player.autoembed.cc/embed/movie/${id}`
  if (server !== undefined) url += `?server=${server}`
  return url
}

// AutoEmbed.cc API - TV show/episode embed URL
export function autoembedTvEmbedUrl({ 
  id, 
  season, 
  episode, 
  server 
}: { 
  id: string | number; 
  season: number; 
  episode: number; 
  server?: number 
}) {
  let url = `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
  if (server !== undefined) url += `?server=${server}`
  return url
}

// =============================================================================
// VidSrc.to API Functions
// =============================================================================

// VidSrc.to API - Movie embed URL
export function vidsrcToMovieEmbedUrl({ 
  id, 
  sub_file, 
  sub_label, 
  sub_json 
}: { 
  id: string | number; 
  sub_file?: string; 
  sub_label?: string; 
  sub_json?: string 
}) {
  let url = `https://vidsrc.to/embed/movie/${id}`
  const params = new URLSearchParams()
  
  if (sub_file) params.set('sub_file', sub_file)
  if (sub_label) params.set('sub_label', sub_label)
  if (sub_json) params.set('sub.info', sub_json)
  
  const s = params.toString()
  return s ? `${url}?${s}` : url
}

// VidSrc.to API - TV show embed URL (show only)
export function vidsrcToTvShowEmbedUrl({ id }: { id: string | number }) {
  return `https://vidsrc.to/embed/tv/${id}`
}

// VidSrc.to API - TV show season embed URL
export function vidsrcToTvSeasonEmbedUrl({ 
  id, 
  season 
}: { 
  id: string | number; 
  season: number 
}) {
  return `https://vidsrc.to/embed/tv/${id}/${season}`
}

// VidSrc.to API - TV show episode embed URL
export function vidsrcToTvEpisodeEmbedUrl({ 
  id, 
  season, 
  episode, 
  sub_file, 
  sub_label, 
  sub_json 
}: { 
  id: string | number; 
  season: number; 
  episode: number; 
  sub_file?: string; 
  sub_label?: string; 
  sub_json?: string 
}) {
  let url = `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
  const params = new URLSearchParams()
  
  if (sub_file) params.set('sub_file', sub_file)
  if (sub_label) params.set('sub_label', sub_label)
  if (sub_json) params.set('sub.info', sub_json)
  
  const s = params.toString()
  return s ? `${url}?${s}` : url
}

// VidSrc.to API - Get movies by type
export async function getVidsrcToMovies(type: 'new' | 'add', page?: number): Promise<any> {
  try {
    let url = `https://vidsrc.to/vapi/movie/${type}`
    if (page !== undefined) url += `/${page}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch VidSrc.to movies:', error)
    throw error
  }
}

// VidSrc.to API - Get TV shows by type
export async function getVidsrcToTvShows(type: 'new' | 'add', page?: number): Promise<any> {
  try {
    let url = `https://vidsrc.to/vapi/tv/${type}`
    if (page !== undefined) url += `/${page}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch VidSrc.to TV shows:', error)
    throw error
  }
}

// VidSrc.to API - Get latest episodes
export async function getVidsrcToLatestEpisodes(page?: number): Promise<any> {
  try {
    let url = `https://vidsrc.to/vapi/episode/latest`
    if (page !== undefined) url += `/${page}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch VidSrc.to latest episodes:', error)
    throw error
  }
}
