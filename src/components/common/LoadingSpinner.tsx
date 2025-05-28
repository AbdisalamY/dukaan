// src/components/common/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8'
} as const

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn('animate-spin text-indigo-600', sizeMap[size])} />
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Loading states for different scenarios
export const LoadingStates = {
  Button: ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <Loader2 className={cn('animate-spin', sizeMap[size])} />
  ),
  
  Card: ({ text = 'Loading...' }: { text?: string }) => (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  ),
  
  Table: ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  ),
  
  Form: () => (
    <div className="space-y-4">
      <div className="h-10 bg-gray-100 rounded animate-pulse" />
      <div className="h-10 bg-gray-100 rounded animate-pulse" />
      <div className="h-32 bg-gray-100 rounded animate-pulse" />
    </div>
  ),
}