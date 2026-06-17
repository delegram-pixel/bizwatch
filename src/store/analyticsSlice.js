import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { runAnalysis } from '../lib/api.js'
import { mockData } from '../lib/mockData.js'

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetch',
  async (businessType = 'general') => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await new Promise((res) => setTimeout(res, 1200))
      return mockData
    }
    return await runAnalysis(businessType)
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default analyticsSlice.reducer
