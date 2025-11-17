import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService, LoginResponse, isValidEmail } from '../services/apiService'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  email_verified: boolean
  profilePicture?: string
  preferences?: {
    language: string
    theme: 'dark' | 'light'
    notifications: boolean
    autoplay: boolean
  }
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ message: string; email: string }>
  sendOTP: (email: string) => Promise<{ message: string; email: string }>
  verifyOTP: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  clearError: () => void
}



const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  })

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('sanviplex_user')
        
        if (savedUser && apiService.isAuthenticated()) {
          const user = JSON.parse(savedUser)
          
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null
          })
        } else {
          // Clear invalid session data
          apiService.clearTokens()
          localStorage.removeItem('sanviplex_user')
          
          setAuthState(prev => ({
            ...prev,
            isLoading: false
          }))
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        apiService.clearTokens()
        localStorage.removeItem('sanviplex_user')
        
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Session expired. Please sign in again.'
        })
      }
    }
    
    initializeAuth()
  }, [])

  const setLoading = (isLoading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading }))
  }

  const setError = (error: string | null) => {
    setAuthState(prev => ({ ...prev, error }))
  }

  const setUser = (user: User | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      error: null
    }))
  }

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format')
      }

      const response = await apiService.login(email, password)
      
      // Check if response requires email verification
      if ('requires_verification' in response && response.requires_verification) {
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.')
      }
      
      // If we get here, it's a successful login response
      const loginResponse = response as LoginResponse
      
      // Store tokens securely
      apiService.storeTokens({
        access: loginResponse.access,
        refresh: loginResponse.refresh
      })

      // Create user object with preferences
      const user: User = {
        ...loginResponse.user,
        full_name: `${loginResponse.user.first_name} ${loginResponse.user.last_name}`.trim(),
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: true,
          autoplay: true
        }
      }

      // Store user data
      localStorage.setItem('sanviplex_user', JSON.stringify(user))
      
      setUser(user)
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData: { firstName: string; lastName: string; email: string; password: string }): Promise<{ message: string; email: string }> => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isValidEmail(userData.email)) {
        throw new Error('Invalid email format')
      }

      const response = await apiService.signup({
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        password: userData.password,
        confirm_password: userData.password
      })
      
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const sendOTP = async (email: string): Promise<{ message: string; email: string }> => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format')
      }

      const response = await apiService.sendOTP(email)
      
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response: LoginResponse = await apiService.verifyOTP(email, otp)
      
      // Store tokens securely
      apiService.storeTokens({
        access: response.access,
        refresh: response.refresh
      })

      // Create user object with preferences
      const user: User = {
        ...response.user,
        full_name: `${response.user.first_name} ${response.user.last_name}`.trim(),
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: true,
          autoplay: true
        }
      }

      // Store user data
      localStorage.setItem('sanviplex_user', JSON.stringify(user))
      
      setUser(user)
    } catch (error: any) {
      const errorMessage = error.message || 'OTP verification failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setLoading(true)
    
    try {
      // Clear tokens and user data
      apiService.clearTokens()
      localStorage.removeItem('sanviplex_user')
      
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) throw new Error('No user logged in')
    
    setLoading(true)
    setError(null)
    
    try {
      // TODO: Implement backend API call for profile updates
      // For now, update locally
      const updatedUser = { ...authState.user, ...updates }
      localStorage.setItem('sanviplex_user', JSON.stringify(updatedUser))
      
      setUser(updatedUser)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }



  const clearError = () => {
    setError(null)
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    sendOTP,
    verifyOTP,
    logout,
    updateProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for checking if user is authenticated
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && !isLoading
  }
}

// Hook for getting user preferences
export const useUserPreferences = () => {
  const { user, updateProfile } = useAuth()
  
  const updatePreferences = async (newPreferences: Partial<NonNullable<User['preferences']>>) => {
    if (!user || !user.preferences) return
    
    await updateProfile({
      preferences: { ...user.preferences, ...newPreferences }
    })
  }
  
  return {
    preferences: user?.preferences,
    updatePreferences
  }
}