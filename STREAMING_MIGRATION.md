# Migration to fmoviesunblocked.net Streaming

## Summary
Successfully migrated from FTP-based streaming to **fmoviesunblocked.net** iframe embedding.

---

## Changes Made

### 1. **Streaming Service** (`src/utils/streamingService.ts`)
- **Removed**: All FTP directory scraping, tokenization, fuzzy matching, BFS traversal logic
- **Added**: Simple URL builder for fmoviesunblocked.net
- **URLs**:
  - Movies: `https://fmoviesunblocked.net/spa/videoPlayPage/movies?id={movieId}`
  - TV Shows: `https://fmoviesunblocked.net/spa/videoPlayPage/tv?id={movieId}&season={season}&episode={episode}`

### 2. **Video Player** (`src/ui/NetflixVideoPlayer.tsx`)
- **Removed**: 
  - HTML5 video element and all custom controls (play/pause, seek, volume, etc.)
  - Complex video event handlers
  - Multiple source management
  - Quality selector
  - Buffer tracking
- **Added**:
  - Iframe embedding with proper sandbox and allow attributes
  - Minimal overlay controls (close button, fullscreen, title display)
  - Auto-hiding control bar on mouse move
  - 3-second loading delay before removing spinner

### 3. **Vite Configuration** (`vite.config.ts`)
- **Removed**: FTP proxy configuration (`/ftp` → `server2.ftpbd.net`)
- **Result**: Clean, minimal config

---

## How It Works

### For Movies:
1. User clicks on movie from TMDB
2. User clicks "Watch Now"
3. `NetflixVideoPlayer` loads
4. `streamingService.getStreamingSources()` builds URL:
   ```
   https://fmoviesunblocked.net/spa/videoPlayPage/movies?id={tmdbId}
   ```
5. Iframe loads the fmoviesunblocked player page
6. User interacts with fmoviesunblocked's built-in controls

### For TV Shows:
1. User clicks on TV show from TMDB
2. User selects season and episode from dropdowns
3. User clicks "Watch S1E1"
4. `streamingService.getStreamingSources()` builds URL:
   ```
   https://fmoviesunblocked.net/spa/videoPlayPage/tv?id={tmdbId}&season=1&episode=1
   ```
5. Iframe loads the fmoviesunblocked player page
6. User interacts with fmoviesunblocked's built-in controls

---

## Features

### ✅ Working
- Movie playback via iframe
- TV show playback with season/episode selection
- Close button to exit player
- Fullscreen toggle
- Title and episode info display
- Loading spinner
- Error handling with retry

### ❌ Removed (handled by fmoviesunblocked)
- Custom video controls
- Quality selection
- Seek bar
- Volume control
- Skip buttons
- Play/pause button
- Time display
- Buffer indicator

---

## Player UI

```
┌─────────────────────────────────────────┐
│ [X]        Mission Impossible      [⛶] │  ← Top bar (auto-hides)
│                                         │
│                                         │
│                                         │
│          [Iframe Player Here]           │
│      (fmoviesunblocked.net embed)       │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Controls:
- **[X]**: Close player
- **[⛶]**: Toggle fullscreen
- **Title**: Shows movie/show name
- **Subtitle**: Shows "Season X • Episode Y" for TV shows

---

## Iframe Configuration

```tsx
<iframe
  src={streamUrl}
  className="w-full h-full border-0"
  allowFullScreen
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
/>
```

### Sandbox Attributes:
- `allow-same-origin`: Required for video playback
- `allow-scripts`: Required for player functionality
- `allow-popups`: May be needed for some player features
- `allow-forms`: For any form interactions in player
- `allow-presentation`: For fullscreen API

---

## Benefits

### 👍 Pros:
1. **Simpler Code**: Removed 300+ lines of complex video handling
2. **No CORS Issues**: Iframe handles cross-origin properly
3. **No File Search**: No need to scrape FTP directories
4. **Professional Player**: fmoviesunblocked has mature player with subtitles, quality selection, etc.
5. **Always Up-to-Date**: Uses their latest streaming sources
6. **Mobile Support**: Their player works on mobile devices

### 👎 Cons:
1. **Less Control**: Can't customize player appearance
2. **Dependency**: Relies on external site being available
3. **Ads/Popups**: May show ads (controlled by fmoviesunblocked)
4. **No Offline**: Can't cache or download
5. **Privacy**: Third-party tracking from fmoviesunblocked

---

## Testing

### To Test:
1. **Movies**:
   - Go to any movie (e.g., Mission Impossible)
   - Click "Watch Now"
   - Verify iframe loads with movie player
   - Check that TMDB movie ID is in URL

2. **TV Shows**:
   - Go to any TV show
   - Select season and episode
   - Click "Watch S1E1"
   - Verify iframe loads with correct episode
   - Check that season/episode params are in URL

3. **Controls**:
   - Test close button (should exit player)
   - Test fullscreen toggle
   - Verify controls auto-hide after 3 seconds
   - Verify controls reappear on mouse move

---

## Debugging

### Console Logs:
```javascript
🎬 Loading streaming from fmoviesunblocked.net
📋 Parameters: { movieTitle, movieId, isTV, season, episode, year }
✅ Stream URL: https://fmoviesunblocked.net/spa/videoPlayPage/movies?id=123456
```

### Common Issues:

#### Iframe Not Loading:
- Check browser console for CORS errors
- Verify fmoviesunblocked.net is accessible
- Check network tab for 404/500 errors

#### Wrong Content:
- Verify TMDB movie ID is correct
- Check if fmoviesunblocked has that content
- Try opening URL directly in new tab

#### Controls Not Hiding:
- Check console for JavaScript errors
- Verify `handleMouseMove` is being called
- Check timeout duration (3000ms)

---

## Future Improvements

### Possible Enhancements:
1. **Fallback Providers**: Add multiple iframe sources if fmoviesunblocked fails
2. **Ad Blocker**: Integrate ad-blocking for better UX
3. **Continue Watching**: Save position via localStorage
4. **Watchlist Integration**: Track watched episodes
5. **Direct Link**: Add "Open in New Tab" button

### Alternative Providers:
If fmoviesunblocked.net becomes unavailable, consider:
- `vidsrc.to`
- `vidsrc.me`
- `2embed.to`
- `multiembed.mov`

Each would need similar iframe integration with their own URL patterns.

---

## URL Patterns (for reference)

### fmoviesunblocked.net:
```
Movies:   /spa/videoPlayPage/movies?id={tmdbId}
TV Shows: /spa/videoPlayPage/tv?id={tmdbId}&season={s}&episode={e}
```

### Alternative Patterns (not implemented):
```
vidsrc.to:
  Movies:   /embed/movie/{tmdbId}
  TV:       /embed/tv/{tmdbId}/{season}/{episode}

vidsrc.me:
  Movies:   /embed/{tmdbId}
  TV:       /embed/{tmdbId}/{season}-{episode}
```

---

## Migration Complete ✅

All FTP-related code has been removed. The app now uses iframe embedding for streaming.
