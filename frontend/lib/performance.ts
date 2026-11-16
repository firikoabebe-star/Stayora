// Performance monitoring and optimization utilities

// Image optimization utilities
export const getOptimizedImageUrl = (
  url: string, 
  width?: number, 
  height?: number, 
  quality = 80
): string => {
  if (!url) return ''
  
  // If it's a Cloudinary URL, add transformations
  if (url.includes('cloudinary.com')) {
    const transformations = []
    
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    transformations.push(`q_${quality}`, 'f_auto')
    
    const transformString = transformations.join(',')
    return url.replace('/upload/', `/upload/${transformString}/`)
  }
  
  return url
}

// Lazy loading intersection observer
export const createLazyLoadObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, defaultOptions)
}

// Debounce utility for search and API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Cache management
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  size(): number {
    return this.cache.size
  }
}

export const cache = new CacheManager()

// API response caching decorator
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => string,
  ttl = 5 * 60 * 1000
): T => {
  return (async (...args: Parameters<T>) => {
    const cacheKey = getCacheKey(...args)
    const cached = cache.get(cacheKey)
    
    if (cached) {
      return cached
    }
    
    const result = await fn(...args)
    cache.set(cacheKey, result, ttl)
    
    return result
  }) as T
}

// Performance metrics
interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  interactionTime: number
  memoryUsage?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private startTime = performance.now()

  markLoadComplete(): void {
    const loadTime = performance.now() - this.startTime
    this.addMetric({ loadTime, renderTime: 0, interactionTime: 0 })
  }

  markRenderComplete(): void {
    const renderTime = performance.now() - this.startTime
    this.updateLastMetric({ renderTime })
  }

  markInteraction(): void {
    const interactionTime = performance.now() - this.startTime
    this.updateLastMetric({ interactionTime })
  }

  private addMetric(metric: Partial<PerformanceMetrics>): void {
    this.metrics.push({
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: this.getMemoryUsage(),
      ...metric
    })
  }

  private updateLastMetric(updates: Partial<PerformanceMetrics>): void {
    const lastMetric = this.metrics[this.metrics.length - 1]
    if (lastMetric) {
      Object.assign(lastMetric, updates)
    }
  }

  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return undefined
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageLoadTime(): number {
    const loadTimes = this.metrics.map(m => m.loadTime).filter(t => t > 0)
    return loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length || 0
  }

  reset(): void {
    this.metrics = []
    this.startTime = performance.now()
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Bundle size analyzer (development only)
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    
    console.group('📦 Bundle Analysis')
    console.log('Scripts:', scripts.length)
    console.log('Stylesheets:', styles.length)
    
    // Estimate bundle size (rough approximation)
    let totalSize = 0
    scripts.forEach((script: any) => {
      if (script.src.includes('/_next/')) {
        // Rough estimation based on typical Next.js bundle sizes
        totalSize += 200 // KB
      }
    })
    
    console.log(`Estimated bundle size: ~${totalSize}KB`)
    console.groupEnd()
  }
}

// Preload critical resources
export const preloadCriticalResources = (): void => {
  const criticalImages = [
    '/hero-bg.jpg',
    '/logo.svg'
  ]

  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}

// Service Worker registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered:', registration)
    } catch (error) {
      console.log('SW registration failed:', error)
    }
  }
}

// Web Vitals tracking
export const trackWebVitals = (): void => {
  if (typeof window !== 'undefined') {
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`${entry.name}:`, entry.value)
        
        // Send to analytics (replace with your analytics service)
        if (typeof gtag !== 'undefined') {
          gtag('event', entry.name, {
            value: Math.round(entry.name === 'CLS' ? entry.value * 1000 : entry.value),
            event_category: 'Web Vitals',
            non_interaction: true,
          })
        }
      })
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
  }
}

// Memory leak detection
export const detectMemoryLeaks = (): void => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory
    const threshold = 50 * 1024 * 1024 // 50MB
    
    if (memory.usedJSHeapSize > threshold) {
      console.warn('⚠️ High memory usage detected:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      })
    }
  }
}

// Initialize performance monitoring
export const initPerformanceMonitoring = (): void => {
  if (typeof window !== 'undefined') {
    // Track page load
    window.addEventListener('load', () => {
      performanceMonitor.markLoadComplete()
      analyzeBundleSize()
      preloadCriticalResources()
    })

    // Track DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.markRenderComplete()
    })

    // Track first interaction
    const trackFirstInteraction = () => {
      performanceMonitor.markInteraction()
      document.removeEventListener('click', trackFirstInteraction)
      document.removeEventListener('keydown', trackFirstInteraction)
    }
    
    document.addEventListener('click', trackFirstInteraction)
    document.addEventListener('keydown', trackFirstInteraction)

    // Register service worker
    registerServiceWorker()

    // Track web vitals
    trackWebVitals()

    // Memory leak detection (development only)
    if (process.env.NODE_ENV === 'development') {
      setInterval(detectMemoryLeaks, 30000) // Check every 30 seconds
    }
  }
}