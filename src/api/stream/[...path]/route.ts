// Simple proxy to test VidSrc.ts integration
// This is a demo implementation - in production, deploy your own VidSrc.ts API

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  
  // Remove 'api' and 'stream' from path
  const apiPath = pathSegments.slice(2) // Remove 'api/stream'
  
  if (apiPath.length === 0) {
    return Response.json({ error: 'Missing TMDB ID' }, { status: 400 })
  }
  
  const tmdbId = apiPath[0]
  const season = apiPath[1] ? parseInt(apiPath[1]) : undefined
  const episode = apiPath[2] ? parseInt(apiPath[2]) : undefined
  
  // Mock response for testing (replace with actual VidSrc.ts implementation)
  const mockResponse = [
    {
      name: "Server 1",
      image: "",
      mediaId: tmdbId,
      stream: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` // Demo video
    },
    {
      name: "Server 2", 
      image: "",
      mediaId: tmdbId,
      stream: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4` // Demo video
    }
  ]
  
  console.log('Streaming API called:', { tmdbId, season, episode })
  
  return Response.json(mockResponse, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}