import React, { useState, useEffect, useRef } from 'react'
import { FiArrowLeft, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi'

interface OTPVerificationProps {
  phoneNumber: string
  onVerificationSuccess: (phone: string, otp: string) => Promise<void>
  onBack: () => void
  onResendOTP: (phone: string) => Promise<{ message: string; otp?: string }>
  isLoading: boolean
  error?: string | null
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerificationSuccess,
  onBack,
  onResendOTP,
  isLoading,
  error
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-move to next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && !isLoading) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const pastedOtp = text.replace(/\D/g, '').slice(0, 6).split('')
        const newOtp = [...otp]
        
        pastedOtp.forEach((digit, i) => {
          if (i < 6) {
            newOtp[i] = digit
          }
        })
        
        setOtp(newOtp)
        
        // Focus appropriate input
        const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
        inputRefs.current[focusIndex]?.focus()
        
        // Auto-submit if complete
        if (newOtp.every(digit => digit !== '')) {
          handleSubmit(newOtp.join(''))
        }
      })
    }
  }

  const handleSubmit = async (otpValue?: string) => {
    const finalOtp = otpValue || otp.join('')
    
    if (finalOtp.length !== 6) {
      return
    }

    try {
      await onVerificationSuccess(phoneNumber, finalOtp)
    } catch (error) {
      // Error handling is done in parent component
      console.error('OTP verification failed:', error)
    }
  }

  const handleResend = async () => {
    if (isResending || timeLeft > 240) return // Prevent spam (allow resend only after 1 minute)

    setIsResending(true)
    setResendMessage('')
    
    try {
      const response = await onResendOTP(phoneNumber)
      setResendMessage(response.message)
      setTimeLeft(300) // Reset timer
      setOtp(['', '', '', '', '', '']) // Clear OTP inputs
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="min-h-screen bg-black text-white relative flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black" />
        {[...Array(30)].map((_, i) => (
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
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-red-500/5 pointer-events-none" />
          
          {/* Back Button */}
          <button
            onClick={onBack}
            disabled={isLoading}
            className="relative z-10 flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FiCheck className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent mb-2">
              Verify Your Phone
            </h1>
            <p className="text-white/60 text-sm mb-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-red-400 font-medium text-sm">
              {formatPhoneNumber(phoneNumber)}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative z-10 mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl">
              <div className="flex items-center space-x-2">
                <FiX className="text-red-400" size={16} />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message for Resend */}
          {resendMessage && !error && (
            <div className="relative z-10 mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-2xl">
              <div className="flex items-center space-x-2">
                <FiCheck className="text-green-400" size={16} />
                <span className="text-green-200 text-sm">{resendMessage}</span>
              </div>
            </div>
          )}

          {/* OTP Input */}
          <div className="relative z-10 mb-8">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className={`w-12 h-14 bg-white/5 border-2 rounded-xl text-center text-xl font-bold text-white focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    digit
                      ? 'border-red-500 bg-red-500/10'
                      : error
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-white/20 focus:border-red-500/60 focus:bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Timer and Resend */}
          <div className="relative z-10 text-center mb-8">
            {timeLeft > 0 ? (
              <p className="text-white/60 text-sm">
                Code expires in <span className="text-red-400 font-medium">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-white/60 text-sm">
                Code has expired. Please request a new one.
              </p>
            )}
            
            <button
              onClick={handleResend}
              disabled={isResending || timeLeft > 240} // Allow resend after 1 minute
              className="mt-3 flex items-center justify-center space-x-2 mx-auto px-4 py-2 text-red-400 hover:text-red-300 disabled:text-white/40 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
            >
              {isResending ? (
                <>
                  <FiRefreshCw className="animate-spin" size={14} />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FiRefreshCw size={14} />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500/20 rounded-2xl">
                <div className="w-5 h-5 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
                <span className="text-white/80 text-sm font-medium">Verifying...</span>
              </div>
            </div>
          )}

          {/* Manual Submit Button (if needed) */}
          {!isLoading && otp.every(digit => digit !== '') && (
            <button
              onClick={() => handleSubmit()}
              className="relative z-10 w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/30 flex items-center justify-center space-x-2"
            >
              <span>Verify Code</span>
              <FiCheck size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-10 left-10 w-20 h-20 border border-red-500/20 rounded-full animate-pulse" />
      <div className="fixed top-1/4 right-20 w-16 h-16 border border-red-500/30 rounded-2xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}

export default OTPVerification