import type { ServiceDataRow } from '@/types/service.types'
import * as d3 from 'd3'
import { DataLoadError, ErrorHandler } from '@/lib/errors'

interface CacheEntry {
  data: ServiceDataRow[]
  timestamp: number
  etag?: string
}

/**
 * Data cache manager for CSV files to avoid redundant loading
 */
export class DataCache {
  private static instance: DataCache | null = null
  private cache = new Map<string, CacheEntry>()
  private readonly maxAge: number
  private readonly maxSize: number

  private constructor(maxAge = 5 * 60 * 1000, maxSize = 10) { // 5 minutes, 10 entries
    this.maxAge = maxAge
    this.maxSize = maxSize
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache()
    }
    return DataCache.instance
  }

  /**
   * Load CSV data with caching
   */
  async loadCSVData(url: string, forceRefresh = false): Promise<ServiceDataRow[]> {
    const cacheKey = this.normalizeCacheKey(url)

    // Check cache first
    if (!forceRefresh) {
      const cachedData = this.getCachedData(cacheKey)
      if (cachedData) {
        console.log(`Cache hit for ${url}`)
        return cachedData
      }
    }

    // Load data with error handling
    console.log(`Loading data from ${url}`)
    const data = await ErrorHandler.safeAsync(
      () => this.fetchCSVData(url),
      error => new DataLoadError(url, error, { cacheKey }),
    )

    // Cache the data
    this.setCachedData(cacheKey, data)

    return data
  }

  /**
   * Fetch CSV data from URL
   */
  private async fetchCSVData(url: string): Promise<ServiceDataRow[]> {
    return await d3.csv(url) as ServiceDataRow[]
  }

  /**
   * Get cached data if valid
   */
  private getCachedData(cacheKey: string): ServiceDataRow[] | null {
    const entry = this.cache.get(cacheKey)

    if (!entry) {
      return null
    }

    // Check if data is still fresh
    const age = Date.now() - entry.timestamp
    if (age > this.maxAge) {
      console.log(`Cache expired for ${cacheKey} (age: ${Math.round(age / 1000)}s)`)
      this.cache.delete(cacheKey)
      return null
    }

    return entry.data
  }

  /**
   * Cache data with LRU eviction
   */
  private setCachedData(cacheKey: string, data: ServiceDataRow[]): void {
    // Implement simple LRU by deleting oldest entries
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        console.log(`Evicting oldest cache entry: ${oldestKey}`)
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })

    console.log(`Cached data for ${cacheKey} (${data.length} rows)`)
  }

  /**
   * Normalize cache key from URL
   */
  private normalizeCacheKey(url: string): string {
    // Remove query parameters and normalize path
    try {
      const urlObj = new URL(url, window.location.origin)
      return urlObj.pathname
    }
    catch {
      // Fallback for relative URLs
      return url.split('?')[0] || url
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    console.log('Clearing all cache entries')
    this.cache.clear()
  }

  /**
   * Clear specific cache entry
   */
  clearEntry(url: string): void {
    const cacheKey = this.normalizeCacheKey(url)
    if (this.cache.delete(cacheKey)) {
      console.log(`Cleared cache entry for ${url}`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    entries: Array<{ key: string, age: number, rows: number }>
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Math.round((now - entry.timestamp) / 1000),
      rows: entry.data.length,
    }))

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries,
    }
  }

  /**
   * Preload data for multiple URLs
   */
  async preloadData(urls: string[]): Promise<void> {
    console.log(`🚀 Preloading ${urls.length} data sources`)

    const loadPromises = urls.map(async (url) => {
      try {
        await this.loadCSVData(url)
      }
      catch (error) {
        console.warn(`Failed to preload ${url}:`, error)
      }
    })

    await Promise.allSettled(loadPromises)
    console.log('✅ Preloading complete')
  }
}

/**
 * Convenience function to get the data cache instance
 */
export function getDataCache(): DataCache {
  return DataCache.getInstance()
}

/**
 * Load CSV data with caching (convenience function)
 */
export async function loadCachedCSVData(url: string, forceRefresh = false): Promise<ServiceDataRow[]> {
  return getDataCache().loadCSVData(url, forceRefresh)
}
