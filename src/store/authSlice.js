import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getMe, logout as apiLogout } from '../lib/api.js'
import { mockUser } from '../lib/mockData.js'

export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return mockUser
  return await getMe()
})

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') await apiLogout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,    // { name, email, picture, connectedSources }
    loading: true,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
    },
    updateConnectedSources(state, action) {
      if (state.user) {
        state.user.connectedSources = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.user = null
        state.loading = false
        state.error = action.error.message
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
