// UI Constants
export const UI_CONSTANTS = {
  // Colors
  COLORS: {
    PRIMARY: '#0b99ff',
    SECONDARY: '#6b7280',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    WHITE: '#ffffff',
    BLACK: '#000000',
    TRANSPARENT: 'transparent',
  },
  
  // Selection colors
  SELECTION: {
    STROKE: '#0b99ff',
    FILL: 'rgba(11, 153, 255, 0.1)',
    HANDLE_SIZE: 8,
    STROKE_WIDTH: 1,
  },
  
  // Canvas settings
  CANVAS: {
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 5.0,
    DEFAULT_ZOOM: 1.0,
    ZOOM_STEP: 0.1,
    GRID_SIZE: 20,
    SNAP_THRESHOLD: 10,
  },
  
  // Layer settings
  LAYER: {
    MIN_SIZE: 1,
    DEFAULT_SIZE: 100,
    DEFAULT_OPACITY: 100,
    MIN_OPACITY: 0,
    MAX_OPACITY: 100,
  },
  
  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Z-index values
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1100,
    TOOLTIP: 1200,
    NOTIFICATION: 1300,
  },
  
  // Breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // Spacing scale (in pixels)
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    '2XL': 48,
    '3XL': 64,
  },
  
  // Border radius values
  BORDER_RADIUS: {
    NONE: 0,
    SM: 2,
    MD: 4,
    LG: 8,
    XL: 12,
    FULL: 9999,
  },
  
  // Shadow values
  SHADOWS: {
    SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
} as const;

// Keyboard shortcuts
export const SHORTCUTS = {
  // File operations
  NEW_FILE: 'ctrl+n',
  OPEN_FILE: 'ctrl+o',
  SAVE_FILE: 'ctrl+s',
  SAVE_AS: 'ctrl+shift+s',
  
  // Edit operations
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  CUT: 'ctrl+x',
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  DUPLICATE: 'ctrl+d',
  SELECT_ALL: 'ctrl+a',
  DELETE: 'delete',
  
  // View operations
  ZOOM_IN: 'ctrl+=',
  ZOOM_OUT: 'ctrl+-',
  ZOOM_TO_FIT: 'ctrl+0',
  ZOOM_TO_SELECTION: 'ctrl+2',
  
  // Tools
  SELECTION_TOOL: 'v',
  HAND_TOOL: 'h',
  RECTANGLE_TOOL: 'r',
  ELLIPSE_TOOL: 'o',
  TEXT_TOOL: 't',
  PEN_TOOL: 'p',
  
  // Layers
  GROUP: 'ctrl+g',
  UNGROUP: 'ctrl+shift+g',
  BRING_FORWARD: 'ctrl+]',
  SEND_BACKWARD: 'ctrl+[',
  BRING_TO_FRONT: 'ctrl+shift+]',
  SEND_TO_BACK: 'ctrl+shift+[',
  
  // Other
  ESCAPE: 'escape',
  ENTER: 'enter',
  SPACE: 'space',
} as const;

// Default layer properties
export const DEFAULT_LAYER_PROPS = {
  RECTANGLE: {
    width: 100,
    height: 100,
    opacity: 100,
    cornerRadius: 0,
    rotation: 0,
  },
  
  ELLIPSE: {
    width: 100,
    height: 100,
    opacity: 100,
    rotation: 0,
  },
  
  TEXT: {
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    textAlign: 'left',
    opacity: 100,
    rotation: 0,
  },
  
  LINE: {
    strokeWidth: 2,
    opacity: 100,
    rotation: 0,
  },
  
  ARROW: {
    strokeWidth: 2,
    arrowType: 'end',
    opacity: 100,
    rotation: 0,
  },
  
  FRAME: {
    width: 200,
    height: 200,
    opacity: 100,
    cornerRadius: 0,
    rotation: 0,
  },
  
  GROUP: {
    opacity: 100,
    rotation: 0,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred',
  NETWORK: 'Network error. Please check your connection',
  INVALID_INPUT: 'Invalid input provided',
  FILE_TOO_LARGE: 'File size is too large',
  UNSUPPORTED_FORMAT: 'Unsupported file format',
  SAVE_FAILED: 'Failed to save the file',
  LOAD_FAILED: 'Failed to load the file',
  PERMISSION_DENIED: 'Permission denied',
  NOT_FOUND: 'Resource not found',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'File saved successfully',
  COPIED: 'Copied to clipboard',
  DELETED: 'Deleted successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
} as const;

// Validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_LAYER_NAME_LENGTH: 50,
  MAX_PROJECT_NAME_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// API endpoints (if needed)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
  },
  
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    GET: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
  },
  
  ROOMS: {
    LIST: '/api/rooms',
    CREATE: '/api/rooms',
    GET: (id: string) => `/api/rooms/${id}`,
    UPDATE: (id: string) => `/api/rooms/${id}`,
    DELETE: (id: string) => `/api/rooms/${id}`,
  },
} as const;

// File types
export const FILE_TYPES = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
  VIDEOS: ['.mp4', '.webm', '.ogg'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt'],
  EXPORTS: ['.fig', '.sketch', '.pdf', '.png', '.jpg', '.svg'],
} as const;

// Tool types
export const TOOLS = {
  SELECT: 'select',
  HAND: 'hand',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  TEXT: 'text',
  PEN: 'pen',
  LINE: 'line',
  ARROW: 'arrow',
  FRAME: 'frame',
  ZOOM: 'zoom',
} as const;

// Canvas modes
export const CANVAS_MODES = {
  NONE: 'none',
  SELECTION_NET: 'selectionNet',
  TRANSLATING: 'translating',
  INSERTING: 'inserting',
  RESIZING: 'resizing',
  ROTATING: 'rotating',
  SCALING: 'scaling',
  DRAWING: 'drawing',
  PENCIL: 'pencil',
} as const;
