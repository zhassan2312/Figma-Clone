'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavigationLoadingBar } from './common';

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isLoading) {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 100);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading]);

  // Listen for route changes (this is a simplified version)
  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);
    };
    
    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    };

    // In a real app, you'd listen to Next.js router events
    // For now, we'll just show the loading bar on mount briefly
    const timer = setTimeout(() => {
      handleComplete();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationLoadingBar 
      isVisible={isLoading} 
      progress={progress} 
    />
  );
}
