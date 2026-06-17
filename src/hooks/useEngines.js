import { useState, useCallback } from 'react'
import { runAnalysis } from '../lib/api.js'
import { mockData } from '../lib/mockData.js'

const STORAGE_PREFIX = 'bizwatch_analytics_'

function readCachedAnalytics(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const parsed = JSON.parse(cached)
    if (!parsed?.data) return null

    return {
      data: parsed.data,
      lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : null,
    }
  } catch {
    return null
  }
}

function writeCachedAnalytics(cacheKey, data, lastUpdated) {
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        lastUpdated: lastUpdated?.toISOString?.() ?? null,
      })
    )
  } catch {
    // Ignore storage errors so the UI can still render
  }
}

export function useEngines(businessType) {
  const cacheKey = `${STORAGE_PREFIX}${businessType}`
  const cached = readCachedAnalytics(cacheKey)

  const [data, setData] = useState(cached?.data ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(cached?.lastUpdated ?? null)

  const analyse = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && data) return

      setLoading(true)
      setError(null)
      try {
        const result =
          process.env.NEXT_PUBLIC_USE_MOCK === 'true'
            ? await new Promise((res) => setTimeout(() => res(mockData), 1200))
            : await runAnalysis(businessType)

        const updatedAt = new Date()

        setData(result)
        setLastUpdated(updatedAt)
        writeCachedAnalytics(cacheKey, result, updatedAt)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [businessType, cacheKey, data]
  )

  return { data, loading, error, lastUpdated, analyse }
}