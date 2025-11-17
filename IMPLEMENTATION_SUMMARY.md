# FTP Streaming Implementation Summary

## Overview
Successfully implemented FTP-based movie and TV show streaming with Netflix-style custom video player.

## Features Implemented

### 1. **FTP Directory Provider** (`src/utils/streamingService.ts`)
- Scrapes FTP directory listings from `server2.ftpbd.net`
- Two separate paths:
  - Movies: `/ftp/FTP-2/English%20Movies/`
  - TV Shows: `/ftp/FTP-2/English%20TV%20Shows/`

#### Smart Search Algorithm:
- **Tokenization**: Removes special characters, stopwords, and normalizes titles
- **Fuzzy Matching**: Scores matches based on token overlap
- **Year-based Prioritization**: Automatically searches year directories (e.g., `2025/`)
- **BFS Directory Traversal**: Explores subdirectories intelligently
- **Quality Detection**: Extracts quality from filenames (2160p, 1080p, 720p, etc.)
- **Penalty System**: Reduces scores for samples, trailers, CAM/TS releases
- **Season/Episode Support**: For TV shows, adds S01E01 format to search tokens

#### Search Parameters:
- `movieTitle`: The title from TMDB
- `year`: Release year for better matching
- `isTV`: Boolean to choose Movies vs TV Shows path
- `season` & `episode`: For TV show episode selection
- `altTitles`: Alternative titles for better matching

### 2. **Netflix-Style Video Player** (`src/ui/NetflixVideoPlayer.tsx`)
- Custom HTML5 video controls
- Features:
  - ▶️ Play/Pause
  - 🎯 Seek bar with buffered indicator
  - 🔊 Volume control with mute
  - ⏪⏩ Skip ±10 seconds
  - 🖥️ Fullscreen toggle
  - 🎬 Quality selector (if multiple sources available)
  - ⌨️ Auto-hiding controls (fade after 3s)
  - 🎨 Netflix-style gradient overlays
  - ⚠️ Error handling with retry option
  - ⏳ Loading states

### 3. **TV Series Support** (`src/pages/MovieDetails.tsx`)
- Season and Episode selection dropdowns
- Shows number of episodes per season from TMDB data
- Button text changes: "Watch S1E1" for TV shows
- Passes season/episode to video player
- Filters out "Season 0" (specials)

#### UI Components:
```
📺 Season Selector
   - Dropdown with all seasons
   - Auto-resets episode to 1 when changing season

📺 Episode Selector  
   - Dropdown with all episodes in selected season
   - Shows current selection: "Now playing: Season X, Episode Y"
```

### 4. **Vite Proxy Configuration** (`vite.config.ts`)
```typescript
server: {
  proxy: {
    '/ftp': {
      target: 'https://server2.ftpbd.net',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/ftp/, '')
    }
  }
}
```
- Bypasses CORS restrictions during development
- Transparent proxy: `/ftp/...` → `https://server2.ftpbd.net/...`

## How It Works

### For Movies:
1. User clicks on movie from TMDB
2. Clicks "Watch Now"
3. FTP provider searches `/ftp/FTP-2/English%20Movies/`
4. Looks for year directory (e.g., `2025/`)
5. Finds movie subdirectory (e.g., `Mission-Impossible-The-Final-Reckoning-2025/`)
6. Locates video files (.mp4, .mkv, etc.)
7. Scores and ranks by quality and relevance
8. Returns top matches as StreamSource array
9. Video player loads first source

### For TV Shows:
1. User clicks on TV show from TMDB
2. Season/Episode selectors appear with TMDB data
3. User selects desired season and episode
4. Clicks "Watch S1E1"
5. FTP provider searches `/ftp/FTP-2/English%20TV%20Shows/`
6. Adds "S01E01" tokens to search query
7. Finds matching episode file
8. Video player loads the episode

## Search Algorithm Details

### Scoring System:
- **Base Score**: Token overlap ratio (0.0 - 1.0)
- **Consecutive Bonus**: +0.5 if tokens appear in sequence
- **Length Bonus**: Up to +0.3 for similar token count
- **Year Bonus**: +0.25 if year appears in filename
- **Quality Bonus**: +0.05 for .mp4, +0.02 for .mkv
- **Penalties**: -0.5 for samples, -0.4 for trailers, -0.25 for CAM

### Threshold:
- Minimum score: **0.15** (lenient to catch more matches)
- Returns top 10 candidates

### Directory Exploration:
- Max directories visited: **30**
- Max depth: **3 levels**
- BFS with score-based priority queue

## Debugging Tools Created

### 1. `public/test-search.html`
- Manual search testing
- Shows tokenization process
- Displays scores and matches
- Direct playback testing

### 2. `public/diagnostics.html`
- Step-by-step pipeline testing
- Tests proxy connection
- Tests directory access
- Tests video file access
- Simulates full search
- Video playback with event logging

### 3. Enhanced Console Logging
- Query tokens
- Directory exploration path
- File scoring details
- Match rankings
- Video load events
- Error details

## Known Limitations

1. **FTP Directory Structure Dependency**
   - Requires year-based organization
   - Assumes movie/show folders with descriptive names

2. **Search Accuracy**
   - Depends on filename matching
   - Special characters in titles may reduce accuracy
   - Year is important for better matching

3. **TV Show Episode Detection**
   - Relies on S##E## format in filenames
   - May not work if FTP uses different naming conventions

4. **Development Only**
   - Vite proxy only works in dev mode
   - Production needs backend proxy or direct CORS handling

## Future Improvements

1. **Cache Directory Listings**
   - Reduce repeated FTP requests
   - Store common paths in localStorage

2. **Better TV Show Support**
   - Detect various episode formats (1x01, ep01, etc.)
   - Support multi-episode files

3. **Subtitle Support**
   - Search for .srt files alongside videos
   - Add subtitle track to video player

4. **Continue Watching**
   - Save progress in localStorage
   - Resume from last position

5. **Bandwidth Detection**
   - Auto-select quality based on connection speed
   - Adaptive streaming if possible

## Testing Checklist

✅ Mission Impossible 2025 - Plays correctly
✅ Search algorithm finds matches
✅ Video player controls work
✅ Fullscreen mode works
✅ Quality selector (if multiple sources)
✅ Error handling and retry
⏳ TV show season/episode selection (needs testing with actual TV show)
⏳ Various movie titles and years
⏳ Different quality formats (1080p, 720p, etc.)

## Usage Example

```typescript
// For Movies
await streamingService.getStreamingSources({
  movieTitle: "Mission: Impossible - The Final Reckoning",
  year: 2025,
  isTV: false,
  altTitles: []
})

// For TV Shows
await streamingService.getStreamingSources({
  movieTitle: "Breaking Bad",
  year: 2008,
  isTV: true,
  season: 1,
  episode: 1,
  altTitles: []
})
```

## Console Output Example

```
🎬 FTP: Getting streaming sources for: Mission: Impossible - The Final Reckoning (year 2025)
📺 Type: Movie
📂 Base path: /ftp/FTP-2/English%20Movies/
🔎 Query tokens: [mission, impossible, final, reckoning]
📅 Year to search: 2025
📂 Fetching root directory: /ftp/FTP-2/English%20Movies/
✅ Root directory fetched successfully (15234 chars)
📊 Found 47 directories and 3 files at root
✅ Found year directory: 2025/
🔍 Exploring directory (1/30):
   Path: /ftp/FTP-2/English%20Movies/2025/
   Score: 1.000, Level: 1
   📂 Contains 23 subdirectories:
      - Mission-Impossible-The-Final-Reckoning-2025/ (tokens: mission,impossible,final,reckoning,2025, score: 0.950)
  📁 Scanning directory: /ftp/.../Mission-Impossible-The-Final-Reckoning-2025/
     Found 2 video files
     - Mission-Impossible-...-1080p-...-reencoded.mp4: base_score=0.850, final_score=1.150
  ✅ Found 1 candidates (best score: 1.150)
```

---

**Status**: ✅ Fully Functional for Movies | ⏳ TV Shows Ready (Needs FTP Structure Verification)
