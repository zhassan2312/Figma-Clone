import React from 'react';
import { Point, XYWH, Color } from '@/types';
import { getLayerRotationTransform, getLayerStyles } from '@/utils';

// Common props interface for canvas components
export interface CanvasComponentProps {
  id: string;
  layer: any;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}

// Higher-order component for canvas layers with common functionality
export function withCanvasLayer<T extends CanvasComponentProps>(
  Component: React.ComponentType<T>
) {
  return function CanvasLayerWrapper(props: T) {
    const { layer } = props;
    
    // Common layer properties
    const rotationTransform = getLayerRotationTransform(layer);
    const { fillStyle, strokeStyle } = getLayerStyles(layer);
    
    // Pass through all props plus common computed values
    return (
      <Component
        {...props}
        rotationTransform={rotationTransform}
        fillStyle={fillStyle}
        strokeStyle={strokeStyle}
      />
    );
  };
}

// Common layer wrapper component
export function LayerWrapper({
  children,
  layer,
  className = "group",
  transform,
}: {
  children: React.ReactNode;
  layer: any;
  className?: string;
  transform?: string;
}) {
  const layerTransform = getLayerRotationTransform(layer);
  const finalTransform = transform ? `${transform} ${layerTransform}` : layerTransform;
  
  return (
    <g className={className} transform={finalTransform}>
      {children}
    </g>
  );
}

// Common selection outline component
export function SelectionOutline({
  bounds,
  strokeColor = "#0b99ff",
  strokeWidth = 1,
  strokeDasharray,
}: {
  bounds: XYWH;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}) {
  return (
    <rect
      x={bounds.x}
      y={bounds.y}
      width={bounds.width}
      height={bounds.height}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      pointerEvents="none"
    />
  );
}

// Common resize handle component
export function ResizeHandle({
  x,
  y,
  size = 8,
  cursor = "nwse-resize",
  onPointerDown,
}: {
  x: number;
  y: number;
  size?: number;
  cursor?: string;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      fill="white"
      stroke="#0b99ff"
      strokeWidth={1}
      style={{ cursor }}
      onPointerDown={onPointerDown}
    />
  );
}

// Common button component with variants
export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  className?: string;
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "hover:bg-gray-100 text-gray-700 focus:ring-gray-500"
  };
  
  const sizeClasses = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      className={allClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Common input component
export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  className = "",
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500";
  const disabledClasses = disabled ? "bg-gray-50 cursor-not-allowed" : "";
  const allClasses = `${baseClasses} ${disabledClasses} ${className}`;
  
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={allClasses}
      {...props}
    />
  );
}

// Common dropdown component
export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const baseClasses = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
  const disabledClasses = disabled ? "bg-gray-50 cursor-not-allowed" : "";
  const allClasses = `${baseClasses} ${disabledClasses} ${className}`;
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={allClasses}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Common tooltip component
export function Tooltip({
  children,
  content,
  position = "top",
}: {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
    left: "right-full top-1/2 -translate-y-1/2 mr-1",
    right: "left-full top-1/2 -translate-y-1/2 ml-1"
  };
  
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg ${positionClasses[position]}`}>
          {content}
        </div>
      )}
    </div>
  );
}

// Common loading spinner component
export function LoadingSpinner({
  size = "medium",
  className = "",
}: {
  size?: "small" | "medium" | "large";
  className?: string;
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
}

// Common icon button component
export function IconButton({
  icon,
  onClick,
  tooltip,
  size = "medium",
  variant = "ghost",
  disabled = false,
  className = "",
}: {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-12 h-12"
  };
  
  const button = (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={`${sizeClasses[size]} p-0 ${className}`}
    >
      {icon}
    </Button>
  );
  
  return tooltip ? (
    <Tooltip content={tooltip}>
      {button}
    </Tooltip>
  ) : button;
}

// Global loading overlay component
export function GlobalLoadingOverlay({
  isVisible,
  message = "Processing your request...",
  progress,
}: {
  isVisible: boolean;
  message?: string;
  progress?: number;
}) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="large" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
            {progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader component
export function SkeletonLoader({
  width = "100%",
  height = "1rem",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

// Loading button component
export function LoadingButton({
  children,
  onClick,
  loading = false,
  loadingText = "Loading...",
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  className?: string;
}) {
  const [isLoading, setIsLoading] = React.useState(loading);
  
  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="small" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}

// Progress bar component
export function ProgressBar({
  value,
  max = 100,
  showPercentage = true,
  className = "",
  color = "blue",
}: {
  value: number;
  max?: number;
  showPercentage?: boolean;
  className?: string;
  color?: "blue" | "green" | "red" | "yellow";
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Toast notification component
export function Toast({
  message,
  type = "info",
  isVisible,
  onClose,
  duration = 5000,
}: {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}) {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) return null;
  
  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  
  const iconMap = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };
  
  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right">
      <div className={`border rounded-lg p-4 shadow-lg max-w-sm ${typeStyles[type]}`}>
        <div className="flex items-center space-x-3">
          <span className="text-lg">{iconMap[type]}</span>
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading state wrapper component
export function LoadingWrapper({
  children,
  loading,
  error,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty = false,
}: {
  children: React.ReactNode;
  loading: boolean;
  error?: string | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  isEmpty?: boolean;
}) {
  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error) {
    return errorComponent || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (isEmpty) {
    return emptyComponent || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-600">There's nothing to display at the moment.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Card with loading state
export function LoadingCard({
  loading = false,
  children,
  className = "",
}: {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative bg-white rounded-lg border p-6 ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      {children}
    </div>
  );
}

// Inline loading text
export function LoadingText({
  text = "Loading",
  dotCount = 3,
}: {
  text?: string;
  dotCount?: number;
}) {
  const [dots, setDots] = React.useState('');
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= dotCount ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, [dotCount]);
  
  return <span>{text}{dots}</span>;
}

// Pull to refresh component
export function PullToRefresh({
  children,
  onRefresh,
  refreshing = false,
}: {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
}) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const startY = React.useRef(0);
  const threshold = 100;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };
  
  const handleTouchEnd = async () => {
    if (pullDistance >= threshold) {
      await onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isPulling ? `translateY(${pullDistance * 0.5}px)` : undefined,
        transition: !isPulling ? 'transform 0.3s ease-out' : undefined,
      }}
    >
      {(isPulling || refreshing) && (
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-4">
          <LoadingSpinner size="small" />
        </div>
      )}
      {children}
    </div>
  );
}

// Full page loader component
export function PageLoader({
  message = "Loading...",
  showLogo = true,
}: {
  message?: string;
  showLogo?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Figma Clone</h1>
          </div>
        )}
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Navigation loading bar
export function NavigationLoadingBar({
  isVisible,
  progress = 0,
}: {
  isVisible: boolean;
  progress?: number;
}) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div 
        className="h-full bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

// Inline loading placeholder
export function InlineLoader({
  width = "100%",
  height = "20px",
  lines = 3,
  className = "",
}: {
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader 
          key={i} 
          width={i === lines - 1 ? "60%" : width} 
          height={height} 
        />
      ))}
    </div>
  );
}
