"use client";

import { useEffect, useState } from "react";

interface ZoomIndicatorProps {
  zoom: number;
  isVisible: boolean;
}

export default function ZoomIndicator({ zoom, isVisible }: ZoomIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => setShouldRender(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const percentage = Math.round(zoom * 100);

  return (
    <div className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-black/80 px-3 py-2 text-sm font-medium text-white shadow-lg transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {percentage}%
    </div>
  );
}
