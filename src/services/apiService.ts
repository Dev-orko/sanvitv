import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// Types for API responses
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  email_verified: boolean
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface ApiError {
  message: string
  field?: string
  code?: string
}

// Security configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

class ApiService {
  private axiosInstance: AxiosInstance
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false, // We'll handle tokens manually for better security
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getValidAccessToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Add CSRF protection for state-changing requests
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
          config.headers['X-Requested-With'] = 'XMLHttpRequest'
        }

        // Add timestamp to prevent replay attacks
        config.headers['X-Request-Time'] = Date.now().toString()
        
        return config
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      }
    )

    // Response interceptor for token refresh and error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await this.refreshAccessToken()
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.axiosInstance.request(originalRequest)
            }
          } catch (refreshError) {
            this.handleAuthFailure()
            return Promise.reject(this.handleError(refreshError))
          }
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getStoredAccessToken()
    if (!accessToken) return null

    // Check if token needs refresh
    if (this.isTokenExpiring(accessToken)) {
      try {
        return await this.refreshAccessToken()
      } catch (error) {
        console.error('Token refresh failed:', error)
        return null
      }
    }

    return accessToken
  }

  private getStoredAccessToken(): string | null {
    try {
      const tokenData = localStorage.getItem('sanviplex_auth')
      if (!tokenData) return null

      const parsed = JSON.parse(tokenData)
      return parsed.access || null
    } catch (error) {
      console.error('Error reading access token:', error)
      this.clearStoredTokens()
      return null
    }
  }

  private getStoredRefreshToken(): string | null {
    try {
      const tokenData = localStorage.getItem('sanviplex_auth')
      if (!tokenData) return null

      const parsed = JSON.parse(tokenData)
      return parsed.refresh || null
    } catch (error) {
      console.error('Error reading refresh token:', error)
      this.clearStoredTokens()
      return null
    }
  }

  private isTokenExpiring(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()
      
      return expirationTime - currentTime < TOKEN_REFRESH_THRESHOLD
    } catch (error) {
      console.error('Error parsing token:', error)
      return true // Assume expired if we can't parse
    }
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getStoredRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/token/refresh/`,
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          timeout: 10000,
        }
      )

      const { access } = response.data
      this.updateStoredAccessToken(access)
      return access
    } catch (error) {
      this.handleAuthFailure()
      throw new Error('Token refresh failed')
    }
  }

  private updateStoredAccessToken(newAccessToken: string): void {
    try {
      const tokenData = localStorage.getItem('sanviplex_auth')
      if (tokenData) {
        const parsed = JSON.parse(tokenData)
        parsed.access = newAccessToken
        localStorage.setItem('sanviplex_auth', JSON.stringify(parsed))
      }
    } catch (error) {
      console.error('Error updating access token:', error)
    }
  }

  private handleAuthFailure(): void {
    this.clearStoredTokens()
    
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true'
    }
  }

  private clearStoredTokens(): void {
    localStorage.removeItem('sanviplex_auth')
    localStorage.removeItem('sanviplex_user')
  }

  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const data = error.response.data
        
        if (data && typeof data === 'object') {
          // Handle Django REST framework error format
          if (data.detail) {
            return { message: data.detail }
          }
          
          // Handle field-specific errors
          const fieldErrors = Object.entries(data)
            .filter(([key, value]) => Array.isArray(value) && value.length > 0)
            .map(([key, value]) => ({ field: key, message: (value as string[])[0] }))
          
          if (fieldErrors.length > 0) {
            return fieldErrors[0]
          }
        }
        
        return {
          message: `Server error: ${error.response.status}`,
          code: error.response.status.toString()
        }
      } else if (error.request) {
        // Request was made but no response received
        return { message: 'Network error. Please check your connection.' }
      }
    }

    return { message: error.message || 'An unexpected error occurred' }
  }

  // Public API methods
  public storeTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem('sanviplex_auth', JSON.stringify(tokens))
    } catch (error) {
      console.error('Error storing tokens:', error)
    }
  }

  public clearTokens(): void {
    this.clearStoredTokens()
  }

  public isAuthenticated(): boolean {
    const token = this.getStoredAccessToken()
    return !!token && !this.isTokenExpiring(token)
  }

  // Authentication API calls
  public async signup(userData: { email: string; first_name: string; last_name: string; password: string; confirm_password: string }): Promise<{ message: string; email: string }> {
    console.log('🔥 Signing up user:', userData.email, 'API URL:', this.axiosInstance.defaults.baseURL)
    try {
      const response = await this.axiosInstance.post('/signup/', userData)
      console.log('✅ Signup Response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Signup Error:', error)
      throw error
    }
  }

  public async login(email: string, password: string): Promise<LoginResponse | { message: string; email: string; requires_verification: boolean }> {
    console.log('🔥 Logging in user:', email)
    try {
      const response = await this.axiosInstance.post('/login/', {
        email: email,
        password: password
      })
      console.log('✅ Login Response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Login Error:', error)
      throw error
    }
  }

  public async sendOTP(email: string): Promise<{ message: string; email: string }> {
    console.log('🔥 Sending OTP to:', email, 'API URL:', this.axiosInstance.defaults.baseURL)
    try {
      const response = await this.axiosInstance.post('/send-otp/', {
        email: email
      })
      console.log('✅ OTP Response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ OTP Error:', error)
      throw error
    }
  }

  public async verifyOTP(email: string, otp: string): Promise<LoginResponse> {
    const response = await this.axiosInstance.post('/verify-otp/', {
      email: email,
      otp: otp
    })
    return response.data
  }

  // Update user profile information
  public async updateUserProfile(profileData: { first_name?: string; last_name?: string; email?: string }): Promise<User> {
    const response = await this.axiosInstance.put<{ user: User }>('/auth/profile/', profileData)
    return response.data.user
  }

  // Generic API request methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get(url, config)
    return response.data
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post(url, data, config)
    return response.data
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put(url, data, config)
    return response.data
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete(url, config)
    return response.data
  }
}

// Create and export singleton instance
export const apiService = new ApiService()

// Export utility functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}