// App configuration constants
export const APP_NAME = 'Camp Work';
export const APP_SHORT_NAME = 'CampWork';
export const APP_DESCRIPTION =
  'Find the perfect camping spots with network coverage';

// Map configuration
export const DEFAULT_MAP_CENTER = {
  latitude: 51.1657,
  longitude: 10.4515, // Center of Germany
};

export const DEFAULT_MAP_ZOOM = 6;

// Theme configuration
export const THEME_COLORS = {
  primary: '#E19B53', // Sunset Orange
  secondary: '#F9F8E6', // Warm Ivory
  accent: '#3D6B47', // Forest Green
  neutral: '#847A72', // Warm Stone
  earth: '#A68B5B', // Earth Tone
  forest: '#205429', // Deep Forest
  sky: '#A8D8F0', // Light Sky
} as const;

// PWA configuration
export const PWA_CONFIG = {
  name: APP_NAME,
  short_name: APP_SHORT_NAME,
  description: APP_DESCRIPTION,
  theme_color: THEME_COLORS.primary,
  background_color: THEME_COLORS.secondary,
  display: 'standalone',
  orientation: 'portrait',
} as const;
