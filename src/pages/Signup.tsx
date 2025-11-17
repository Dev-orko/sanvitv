import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiX, FiCheck, FiUser, FiMail, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { isValidEmail, validatePassword } from '../services/apiService'

const Signup = () => {
  const navigate = useNavigate()
  const { signup, sendOTP, verifyOTP, isLoading, error } = useAuth()
  const [currentStep, setCurrentStep] = useState<'form' | 'otp'>('form')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const response = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      })
      
      console.log('Registration successful:', response.message)
      
      // Move to OTP verification step
      setCurrentStep('otp')
      setErrors({})
    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors({ general: error.message || 'Registration failed. Please try again.' })
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' })
      return
    }

    try {
      await verifyOTP(formData.email, otp)
      // Navigate to home on success
      navigate('/')
    } catch (error: any) {
      console.error('OTP verification error:', error)
      setErrors({ otp: error.message || 'OTP verification failed. Please try again.' })
    }
  }

  const handleResendOTP = async () => {
    try {
      await sendOTP(formData.email)
      setErrors({})
    } catch (error: any) {
      setErrors({ otp: error.message || 'Failed to resend OTP. Please try again.' })
    }
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
    setErrors({})
  }

  // Show OTP verification screen
  if (currentStep === 'otp') {
    return (
      <div className="min-h-screen bg-black text-white relative flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent mb-2">
                Verify Your Email
              </h1>
              <p className="text-white/60 text-sm">
                We've sent a 6-digit code to {formData.email}
              </p>
            </div>

            {errors.otp && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <FiX className="text-red-400" size={16} />
                  <span className="text-red-200 text-sm">{errors.otp}</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-red-500/60 focus:bg-white/10 transition-all duration-300 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Complete Signup</span>
                    <FiArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="text-center space-y-4">
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200 disabled:opacity-50"
                >
                  Resend Code
                </button>
                
                <button
                  onClick={() => setCurrentStep('form')}
                  className="block w-full text-white/60 hover:text-white/80 text-sm transition-colors duration-200"
                >
                  ← Back to Signup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-red-400/5 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-red-500/10 p-8">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                <FiUser className="text-red-400" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-400 text-sm">
                Join Sanviplex for unlimited streaming
              </p>
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

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className={`w-full px-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
                      errors.firstName
                        ? 'border-red-500/60 focus:border-red-500 focus:bg-red-500/10'
                        : 'border-white/20 focus:border-red-500/60 focus:bg-white/10'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-red-400 text-xs flex items-center space-x-1">
                      <FiX size={12} />
                      <span>{errors.firstName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className={`w-full px-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
                      errors.lastName
                        ? 'border-red-500/60 focus:border-red-500 focus:bg-red-500/10'
                        : 'border-white/20 focus:border-red-500/60 focus:bg-white/10'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-red-400 text-xs flex items-center space-x-1">
                      <FiX size={12} />
                      <span>{errors.lastName}</span>
                    </p>
                  )}
                </div>
              </div>

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
                    placeholder="Create a strong password"
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-4 pr-12 py-4 bg-white/5 border rounded-2xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
                      errors.confirmPassword
                        ? 'border-red-500/60 focus:border-red-500 focus:bg-red-500/10'
                        : 'border-white/20 focus:border-red-500/60 focus:bg-white/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/60 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-red-400 text-xs flex items-center space-x-1">
                    <FiX size={12} />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Terms and Newsletter */}
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                      formData.agreeToTerms
                        ? 'bg-red-500 border-red-500'
                        : 'border-white/30 group-hover:border-white/50'
                    }`}>
                      {formData.agreeToTerms && (
                        <FiCheck className="text-white" size={12} />
                      )}
                    </div>
                  </div>
                  <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-200">
                    I agree to the{' '}
                    <Link to="/terms" className="text-red-400 hover:text-red-300 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-red-400 hover:text-red-300 underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {errors.agreeToTerms && (
                  <p className="text-red-400 text-xs flex items-center space-x-1">
                    <FiX size={12} />
                    <span>{errors.agreeToTerms}</span>
                  </p>
                )}

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.subscribeNewsletter}
                      onChange={(e) => handleInputChange('subscribeNewsletter', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                      formData.subscribeNewsletter
                        ? 'bg-red-500 border-red-500'
                        : 'border-white/30 group-hover:border-white/50'
                    }`}>
                      {formData.subscribeNewsletter && (
                        <FiCheck className="text-white" size={12} />
                      )}
                    </div>
                  </div>
                  <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-200">
                    Subscribe to our newsletter for updates
                  </span>
                </label>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
                  </>
                )}
              </button>
            </form>



            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-white/60 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup