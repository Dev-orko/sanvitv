import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import MobileNav from './components/layout/MobileNav'
import OptimizedHome from './pages/OptimizedHome'
import MovieDetails from './pages/MovieDetails'
import Movies from './pages/Movies'
import Series from './pages/Series'
import NewAndPopular from './pages/NewAndPopular'
import LiveTV from './pages/LiveTV'
import Landing from './pages/Landing'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider, useAuth } from './contexts/FirebaseAuthContext'

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <Landing />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-black overflow-x-hidden antialiased">
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 pb-20 md:pb-8">
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
                <MobileNav />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <AppRoutes />
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
