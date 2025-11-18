// API Configuration with fallback values
export const API_CONFIG = {
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY || '3ccf3bbfa9b25213ac74c50f96d238d0',
  TMDB_READ_TOKEN: import.meta.env.VITE_TMDB_READ_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzY2NmM2JiZmE5YjI1MjEzYWM3NGM1MGY5NmQyMzhkMCIsIm5iZiI6MTczMjk3NDAwMy4wNjIsInN1YiI6IjY3NGIxNWIzMDExNzg1MWNkMDFjMjQ4OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._aQY-s2iBoSka9Sc7Iry4EpXgPjBWm__HSIvnrxNtZ4',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p'
}
