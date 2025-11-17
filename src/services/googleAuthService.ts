// Google OAuth configuration and integration
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void
          prompt: (callback?: (response: PromptResponse) => void) => void
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void
          disableAutoSelect: () => void
          cancel: () => void
        }
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient
        }
      }
    }
  }
}

interface GoogleInitConfig {
  client_id: string
  callback?: (response: CredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  context?: string
  itp_support?: boolean
}

interface CredentialResponse {
  credential: string
  select_by?: string
}

interface PromptResponse {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isDismissedMoment: () => boolean
  getDismissedReason: () => string
  getMomentType: () => string
}

interface GoogleButtonConfig {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: string
  locale?: string
}

interface TokenClientConfig {
  client_id: string
  scope: string
  callback?: (response: TokenResponse) => void
  error_callback?: (error: any) => void
}

interface TokenClient {
  requestAccessToken: () => void
  callback?: (response: TokenResponse) => void
}

interface TokenResponse {
  access_token: string
  authuser: string
  expires_in: number
  prompt: string
  scope: string
  token_type: string
}

class GoogleAuthService {
  private isInitialized = false
  private clientId: string
  private tokenClient: TokenClient | null = null

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    if (!this.clientId) {
      console.warn('Google Client ID not found. Please set VITE_GOOGLE_CLIENT_ID environment variable.')
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized || !this.clientId) return

    try {
      await this.loadGoogleScript()
      this.initializeGoogleAuth()
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error)
      throw new Error('Google authentication initialization failed')
    }
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.google?.accounts?.id) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        // Wait a bit for the global object to be fully available
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            resolve()
          } else {
            reject(new Error('Google script loaded but API not available'))
          }
        }, 100)
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Google authentication script'))
      }

      document.head.appendChild(script)
    })
  }

  private initializeGoogleAuth(): void {
    if (!window.google?.accounts?.id || !this.clientId) return

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      itp_support: true,
    })

    // Initialize OAuth2 token client for accessing user info
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: 'profile email',
      callback: (response: TokenResponse) => {
        // This will be handled by the promise in getAccessToken
      },
      error_callback: (error: any) => {
        console.error('Google OAuth error:', error)
      }
    })
  }

  public async signInWithPopup(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google Auth not properly initialized'))
        return
      }

      // Store the resolve/reject functions to use in the callback
      const originalCallback = this.tokenClient.callback
      this.tokenClient.callback = (response: TokenResponse) => {
        if (response.access_token) {
          resolve(response.access_token)
        } else {
          reject(new Error('No access token received'))
        }
        // Restore original callback
        if (this.tokenClient) {
          this.tokenClient.callback = originalCallback
        }
      }

      try {
        this.tokenClient.requestAccessToken()
      } catch (error) {
        reject(error)
      }
    })
  }

  public renderSignInButton(
    element: HTMLElement, 
    options: Partial<GoogleButtonConfig> = {},
    onSuccess?: (accessToken: string) => void,
    onError?: (error: Error) => void
  ): void {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      console.warn('Google Auth not initialized. Call initialize() first.')
      return
    }

    const buttonConfig: GoogleButtonConfig = {
      type: 'standard',
      theme: 'filled_black', // Dark theme to match your website
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
      ...options
    }

    // Clear any existing content
    element.innerHTML = ''

    try {
      window.google.accounts.id.renderButton(element, buttonConfig)
      
      // Add click handler for the custom flow
      element.addEventListener('click', async () => {
        try {
          if (onSuccess) {
            const accessToken = await this.signInWithPopup()
            onSuccess(accessToken)
          }
        } catch (error) {
          if (onError) {
            onError(error instanceof Error ? error : new Error('Google sign-in failed'))
          }
        }
      })
    } catch (error) {
      console.error('Error rendering Google sign-in button:', error)
      if (onError) {
        onError(new Error('Failed to render Google sign-in button'))
      }
    }
  }

  public async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const userInfo: GoogleUserInfo = await response.json()
      return userInfo
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw new Error('Failed to fetch user information from Google')
    }
  }

  public signOut(): void {
    if (!this.isInitialized || !window.google?.accounts?.id) return

    try {
      window.google.accounts.id.disableAutoSelect()
      window.google.accounts.id.cancel()
    } catch (error) {
      console.error('Error during Google sign out:', error)
    }
  }

  public isAvailable(): boolean {
    return this.isInitialized && !!window.google?.accounts?.id && !!this.clientId
  }
}

export interface GoogleUserInfo {
  sub: string        // Google user ID
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService()

// Utility function to validate Google access token
export const validateGoogleToken = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    return response.ok
  } catch (error) {
    console.error('Error validating Google token:', error)
    return false
  }
}