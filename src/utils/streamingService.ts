export interface StreamSource {
  name: string
  image: string
  mediaId: string
  stream: string
  isMoviePage?: boolean
  quality?: string
  releaseDate?: string
}

export interface StreamingOptions {
  movieTitle: string
  movieId?: string
  isTV?: boolean
  season?: number
  episode?: number
  year?: number
  altTitles?: string[]
}

class StreamingService {
  private readonly baseUrl = 'https://fmoviesunblocked.net/spa/videoPlayPage/'

  async getStreamingSources(options: StreamingOptions): Promise<StreamSource[]> {
    const streamUrl = this.buildStreamUrl(options)

    return [
      {
        name: options.movieTitle,
        image: '',
        mediaId: options.movieId || 'unknown',
        stream: streamUrl,
        isMoviePage: true,
        quality: 'HD',
        releaseDate: options.year ? String(options.year) : undefined,
      },
    ]
  }

  private buildStreamUrl(options: StreamingOptions): string {
    // For TV shows, use tv endpoint with season/episode
    if (options.isTV && options.season && options.episode) {
      // Format: https://fmoviesunblocked.net/spa/videoPlayPage/tv?id={movieId}&season={season}&episode={episode}
      return `${this.baseUrl}tv?id=${options.movieId || ''}&season=${options.season}&episode=${options.episode}`
    }
    
    // For movies, use movies endpoint
    // Format: https://fmoviesunblocked.net/spa/videoPlayPage/movies?id={movieId}
    return `${this.baseUrl}movies?id=${options.movieId || ''}`
  }

  getFallbackIframeUrl(options: StreamingOptions): string {
    return this.buildStreamUrl(options)
  }
}

export const streamingService = new StreamingService()
