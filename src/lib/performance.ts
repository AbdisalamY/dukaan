// src/lib/performance.ts
import { lazy } from 'react'

// Lazy load heavy components
export const LazyComponents = {
  // Admin components
  AdminDashboard: lazy(() => import('@/app/admin/dashboard/page')),
  AdminShops: lazy(() => import('@/app/admin/shops/page')),
  AdminPayments: lazy(() => import('@/app/admin/payments/page')),
  AdminAnalytics: lazy(() => import('@/app/admin/analytics/page')),
  
  // Shop components
  ShopDashboard: lazy(() => import('@/app/shop/dashboard/page')),
  ShopPayments: lazy(() => import('@/app/shop/payments/page')),
  
  // Forms and modals
  ShopForm: lazy(() => import('@/components/shop/ShopForm').then(mod => ({ default: mod.ShopForm }))),
  PaymentDialog: lazy(() => import('@/components/shop/PaymentDialog').then(mod => ({ default: mod.PaymentDialog }))),
  
  // Charts and analytics
  ShopAnalytics: lazy(() => import('@/components/admin/ShopAnalytics')),
  
  // DevTools (development only)
  ReactQueryDevtools: lazy(() => 
    import('@tanstack/react-query-devtools').then(mod => ({ 
      default: mod.ReactQueryDevtools 
    }))
  ),
}

// Image optimization configuration
export const imageConfig = {
  domains: ['localhost', 'supabase.co'],
  formats: ['image/webp', 'image/avif'],
  sizes: {
    avatar: '(max-width: 768px) 40px, 80px',
    logo: '(max-width: 768px) 100px, 200px',
    thumbnail: '(max-width: 768px) 150px, 300px',
  },
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Virtual scrolling configuration for large lists
export const virtualScrollConfig = {
  itemHeight: 80, // Height of each item in pixels
  containerHeight: 400, // Height of the container
  overscan: 5, // Number of items to render outside of visible area
}

// Bundle analyzer configuration
export const bundleAnalyzerConfig = {
  analyzer: {
    analyzerMode: 'static',
    reportFilename: './bundle-report.html',
    openAnalyzer: false,
  },
}

// Web Vitals tracking
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log('Web Vital:', metric)
    
    // Example: Send to Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // })
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  // Preload fonts
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = '/fonts/inter-var.woff2'
  fontLink.as = 'font'
  fontLink.type = 'font/woff2'
  fontLink.crossOrigin = 'anonymous'
  document.head.appendChild(fontLink)
  
  // Preload critical API endpoints
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Preload common API routes
      fetch('/api/lookup/industries').catch(() => {})
      fetch('/api/lookup/cities').catch(() => {})
    })
  }
}

// Service Worker registration
export function registerServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  }
}

// Memory usage monitoring (development only)
export function monitorMemoryUsage() {
  if (
    process.env.NODE_ENV === 'development' &&
    'performance' in window &&
    'memory' in (window.performance as any)
  ) {
    const memory = (window.performance as any).memory
    console.log('Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`,
    })
  }
}

// Error tracking and reporting
export class ErrorTracker {
  private static instance: ErrorTracker
  private errors: Array<{ error: Error; timestamp: Date; context?: string }> = []
  
  private constructor() {
    this.setupGlobalErrorHandling()
  }
  
  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }
  
  private setupGlobalErrorHandling() {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), 'Global Error Handler')
    })
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(event.reason || 'Unhandled Promise Rejection'),
        'Promise Rejection Handler'
      )
    })
  }
  
  public captureError(error: Error, context?: string) {
    const errorRecord = {
      error,
      timestamp: new Date(),
      context,
    }
    
    this.errors.push(errorRecord)
    
    // Keep only last 50 errors to prevent memory issues
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50)
    }
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorRecord)
    } else {
      console.error('Captured Error:', errorRecord)
    }
  }
  
  private reportError(errorRecord: any) {
    // Example: Send to error monitoring service like Sentry
    // Sentry.captureException(errorRecord.error, {
    //   contexts: {
    //     error: {
    //       timestamp: errorRecord.timestamp,
    //       context: errorRecord.context,
    //     },
    //   },
    // })
  }
  
  public getErrors() {
    return this.errors
  }
  
  public clearErrors() {
    this.errors = []
  }
}