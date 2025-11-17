# FTP Provider Fixes for Mission: Impossible - The Final Reckoning

## Problem
"Mission: Impossible - The Final Reckoning" wasn't playing because the FTP provider wasn't properly handling:
1. Year-based directory structure (e.g., `/2025/Movie-Name/`)
2. Fuzzy token matching with punctuation and special characters
3. Score thresholds were too strict

## Solution

### 1. Prioritize Year Directories
When a year is provided (from TMDB release date), the provider now:
- Checks for a year directory first (e.g., `2025/`)
- Adds it to the top of the search queue with highest priority (score: 1.0)
- Then ranks and searches other directories by relevance

### 2. Improved Token Matching
- Normalizes titles by removing punctuation, hyphens, colons
- Tokenizes: "Mission: Impossible - The Final Reckoning" → `["mission", "impossible", "final", "reckoning"]`
- Scores directories and files by token overlap
- Bonus scoring for:
  - Year match in path/filename (+0.25)
  - Consecutive token sequences (+0.5)
  - File extension preference (.mp4 > .mkv > .webm)
- Penalties for:
  - Sample files (-0.5)
  - Trailers (-0.4)
  - CAM/TS releases (-0.2-0.25)

### 3. Lowered Score Threshold
- Changed from `0.3` to `0.25` minimum score for candidates
- This allows fuzzy matches while still filtering garbage

### 4. Enhanced Logging
- Now logs year directory discovery
- Shows number of candidates found per directory
- Displays top 5 matches with scores for debugging
- Reports directories searched on failure

## Example Flow

For "Mission: Impossible - The Final Reckoning (2025)":

1. Extract year: `2025`
2. Tokenize: `["mission", "impossible", "final", "reckoning"]`
3. Check root directory for `2025/` → ✅ Found
4. Search inside `2025/` for matching subdirectories
5. Find: `Mission-Impossible-The-Final-Reckoning-2025/` (score: 0.95+)
6. Scan that directory for video files
7. Find: `Mission-Impossible-The-Final-Reckoning-2025-1080p-AMZN-WEB-DL-DDP5-1-Atmos-H-264-BYNDR_reencoded.mp4`
8. Return as direct stream source via Vite proxy

## Files Changed
- `src/utils/streamingService.ts` - Enhanced year directory prioritization and scoring
- `src/ui/VideoPlayer.tsx` - Added year and altTitles props
- `src/pages/MovieDetails.tsx` - Pass year from TMDB release_date

## Testing
Created `public/test-ftp-provider.html` for debugging:
- Direct path testing
- Token matching visualization
- Year directory scanning
- Video playback testing

## Usage
```typescript
// VideoPlayer automatically receives year from MovieDetails
<VideoPlayer
  movieTitle="Mission: Impossible - The Final Reckoning"
  year={2025}
  altTitles={[]}
  // ... other props
/>
```

The provider now handles complex titles with punctuation, year-based directory structures, and fuzzy matching automatically.
