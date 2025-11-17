import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiEye, FiEyeOff, FiArrowRight, FiX, FiCheck } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { isValidEmail } from '../services/apiService'

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await login(formData.email, formData.password)
      // Navigate to home on success
      navigate('/')
    } catch (error: any) {
      console.error('Login error:', error)
      setErrors({ general: error.message || 'Login failed. Please try again.' })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black" />
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-red-500/30 rounded-full animate-pulse"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: (3 + Math.random() * 4) + 's'
            }}
          />
        ))}
        
        {/* Floating geometric shapes */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute border border-red-500/20 rounded-2xl animate-pulse"
            style={{
              width: 20 + Math.random() * 80 + 'px',
              height: 20 + Math.random() * 80 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (4 + Math.random() * 6) + 's',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-50 flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 group"
      >
        <FiArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform duration-300" size={18} />
        <span className="font-medium">Back to Sanviplex</span>
      </Link>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-red-500/5 pointer-events-none" />
          
          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/src/utils/logo.png" 
                alt="Sanviplex" 
                className="h-16 w-auto filter drop-shadow-2xl"
              />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-white/60 text-sm">
              Sign in to continue your streaming journey
            </p>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm">Enter your email and password to sign in</p>
          </div>

          {/* Error Message */}
          {(errors.general || error) && (
            <div className="relative z-10 mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl">
              <div className="flex items-center space-x-2">
                <FiX className="text-red-400" size={16} />
                <span className="text-red-200 text-sm">{errors.general || error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            
            {/* Email Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-white/40" size={18} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
                    errors.email
                      ? 'border-red-500/60 focus:border-red-500 focus:bg-red-500/10'
                      : 'border-white/20 focus:border-red-500/60 focus:bg-white/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-red-400 text-xs flex items-center space-x-1">
                  <FiX size={12} />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-4 pr-12 py-4 bg-white/5 border rounded-2xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
                    errors.password
                      ? 'border-red-500/60 focus:border-red-500 focus:bg-red-500/10'
                      : 'border-white/20 focus:border-red-500/60 focus:bg-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/60 transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-red-400 text-xs flex items-center space-x-1">
                  <FiX size={12} />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>



            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                    formData.rememberMe
                      ? 'bg-red-500 border-red-500'
                      : 'border-white/30 group-hover:border-white/50'
                  }`}>
                    {formData.rememberMe && (
                      <FiCheck className="text-white" size={12} />
                    )}
                  </div>
                </div>
                <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-200">
                  Remember this device
                </span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="relative z-10 text-center mt-8 text-white/60">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="fixed bottom-10 left-10 w-20 h-20 border border-red-500/20 rounded-full animate-pulse" />
      <div className="fixed top-1/4 right-20 w-16 h-16 border border-red-500/30 rounded-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed bottom-1/4 right-10 w-12 h-12 bg-red-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  )
}

export default Login