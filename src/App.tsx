import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import OptimizedHome from './pages/OptimizedHome'
import MovieDetails from './pages/MovieDetails'
import Movies from './pages/Movies'
import Series from './pages/Series'
import NewAndPopular from './pages/NewAndPopular'
import LiveTV from './pages/LiveTV'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-black overflow-x-hidden antialiased">
            <Routes>
              {/* Authentication routes (no header) */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Main app routes (with header) */}
              <Route path="/*" element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1 pb-safe">
                    <Routes>
                      <Route path="/" element={<OptimizedHome />} />
                      <Route path="/movies" element={<Movies />} />
                      <Route path="/series" element={<Series />} />
                      <Route path="/new-popular" element={<NewAndPopular />} />
                      <Route path="/live-tv" element={<LiveTV />} />
                      <Route path="/movie/:id" element={<MovieDetails />} />
                      <Route path="/tv/:id" element={<MovieDetails />} />
                    </Routes>
                  </main>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
