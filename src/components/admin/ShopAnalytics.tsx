// src/components/admin/ShopAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
// ... other imports

export default function ShopAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<string>('yearly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics?timeFrame=${timeFrame}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const result = await response.json();
        setData(result.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeFrame]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  if (error || !data) {
    return <div className="text-red-500 p-4">{error || 'Failed to load data'}</div>;
  }

  // ... render analytics components with the data
}