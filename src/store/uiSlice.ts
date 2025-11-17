import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  isScrolled: boolean
  isSearchActive: boolean
  searchQuery: string
  isSearching: boolean
  isProfileOpen: boolean
  isNotificationOpen: boolean
  isMoviesMenuOpen: boolean
  isQuickActionsOpen: boolean
  searchHistory: string[]
}

const initialState: UIState = {
  isScrolled: false,
  isSearchActive: false,
  searchQuery: '',
  isSearching: false,
  isProfileOpen: false,
  isNotificationOpen: false,
  isMoviesMenuOpen: false,
  isQuickActionsOpen: false,
  searchHistory: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setScrolled(state, action: PayloadAction<boolean>) {
      state.isScrolled = action.payload
    },
    setSearchActive(state, action: PayloadAction<boolean>) {
      state.isSearchActive = action.payload
    },
    toggleSearch(state) {
      state.isSearchActive = !state.isSearchActive
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setSearching(state, action: PayloadAction<boolean>) {
      state.isSearching = action.payload
    },
    toggleProfile(state) {
      state.isProfileOpen = !state.isProfileOpen
    },
    toggleNotification(state) {
      state.isNotificationOpen = !state.isNotificationOpen
    },
    toggleMoviesMenu(state) {
      state.isMoviesMenuOpen = !state.isMoviesMenuOpen
    },
    setMoviesMenu(state, action: PayloadAction<boolean>) {
      state.isMoviesMenuOpen = action.payload
    },
    toggleQuickActions(state) {
      state.isQuickActionsOpen = !state.isQuickActionsOpen
    },
    setQuickActions(state, action: PayloadAction<boolean>) {
      state.isQuickActionsOpen = action.payload
    },
    addSearchHistory(state, action: PayloadAction<string>) {
      const value = action.payload.trim()
      if (!value) return
      const existingIndex = state.searchHistory.findIndex(
        (entry) => entry.toLowerCase() === value.toLowerCase()
      )
      if (existingIndex !== -1) {
        state.searchHistory.splice(existingIndex, 1)
      }
      state.searchHistory.unshift(value)
      if (state.searchHistory.length > 6) {
        state.searchHistory = state.searchHistory.slice(0, 6)
      }
    },
    removeSearchHistoryItem(state, action: PayloadAction<string>) {
      state.searchHistory = state.searchHistory.filter(
        (entry) => entry.toLowerCase() !== action.payload.trim().toLowerCase()
      )
    },
    clearSearchHistory(state) {
      state.searchHistory = []
    },
    closeAllOverlays(state) {
      state.isSearchActive = false
      state.isProfileOpen = false
      state.isNotificationOpen = false
      state.isMoviesMenuOpen = false
      state.isQuickActionsOpen = false
    },
  },
})

export const {
  setScrolled,
  setSearchActive,
  toggleSearch,
  setSearchQuery,
  setSearching,
  toggleProfile,
  toggleNotification,
  toggleMoviesMenu,
  setMoviesMenu,
  toggleQuickActions,
  setQuickActions,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
  closeAllOverlays,
} = uiSlice.actions

export default uiSlice.reducer
