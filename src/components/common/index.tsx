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
