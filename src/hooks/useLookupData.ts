// src/hooks/useLookupData.ts
'use client';

import { useState, useEffect } from 'react';

export function useLookupData() {
  const [industries, setIndustries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [malls, setMalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLookupData = async () => {
      setIsLoading(true);
      try {
        // Fetch industries
        const industriesResponse = await fetch('/api/lookup/industries');
        if (!industriesResponse.ok) throw new Error('Failed to fetch industries');
        const industriesData = await industriesResponse.json();
        
        // Fetch cities
        const citiesResponse = await fetch('/api/lookup/cities');
        if (!citiesResponse.ok) throw new Error('Failed to fetch cities');
        const citiesData = await citiesResponse.json();
        
        // Fetch malls
        const mallsResponse = await fetch('/api/lookup/malls');
        if (!mallsResponse.ok) throw new Error('Failed to fetch malls');
        const mallsData = await mallsResponse.json();
        
        setIndustries(industriesData.industries);
        setCities(citiesData.cities);
        setMalls(mallsData.malls);
      } catch (err) {
        console.error('Error fetching lookup data:', err);
        setError('Failed to load reference data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLookupData();
  }, []);

  // Function to get malls for a specific city
  const getMallsByCity = async (cityId: string) => {
    try {
      const response = await fetch(`/api/lookup/malls?cityId=${cityId}`);
      if (!response.ok) throw new Error('Failed to fetch malls');
      const data = await response.json();
      return data.malls;
    } catch (err) {
      console.error('Error fetching malls by city:', err);
      return [];
    }
  };

  return {
    industries,
    cities,
    malls,
    isLoading,
    error,
    getMallsByCity
  };
}