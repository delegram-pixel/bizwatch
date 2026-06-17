import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import analyticsReducer from './analyticsSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
  },
})

/** @typedef {typeof store.dispatch} AppDispatch */
/** @typedef {ReturnType<typeof store.getState>} RootState */
