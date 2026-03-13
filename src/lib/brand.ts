import type { CoverageType } from '../types/coverage';

export const colors = {
  primary: {
    forest: '#1B4332', // Dunkelgrün – CTAs, Primary Actions
    forestLight: '#2D6A4F', // Hover-State
    forestMuted: '#40916C', // Sekundäre Elemente
    sage: '#95D5B2', // Backgrounds, Tags, Light Accents
    mint: '#D8F3DC', // Sehr helle Flächen, Hover
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#FAFAFA', // Page Background
    gray100: '#F5F5F5', // Card Backgrounds, Sidebar
    gray200: '#E5E5E5', // Borders
    gray300: '#D4D4D4', // Disabled States
    gray400: '#A3A3A3', // Placeholder Text
    gray500: '#737373', // Secondary Text
    gray600: '#525252', // Body Text
    gray800: '#262626', // Headings
    gray900: '#171717', // Primary Text
  },
  coverage: {
    excellent: '#22C55E', // 5G – Grün
    good: '#3B82F6', // 4G/LTE – Blau
    limited: '#F59E0B', // 3G – Amber
    none: '#D4D4D4', // Unbekannt – Hellgrau
  },
  semantic: {
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    info: '#3B82F6',
  },
} as const;

// Network coverage color mapping - O2-specific
export const coverageColors: Record<
  CoverageType | 'none',
  {
    hex: string;
    label: string;
    description: string;
  }
> = {
  '5g': {
    hex: '#22C55E',
    label: 'O2 5G',
    description: '5G-Netz von O2 verfügbar',
  },
  '4g': {
    hex: '#3B82F6',
    label: 'O2 LTE',
    description: 'LTE/4G-Netz von O2 – gut zum Arbeiten',
  },
  '3g': {
    hex: '#F59E0B',
    label: 'O2 2G',
    description: 'Nur GSM-Basisversorgung (O2 hat kein 3G mehr)',
  },
  '2g': {
    hex: '#F59E0B',
    label: 'O2 2G',
    description: 'Nur GSM-Basisversorgung (O2 hat kein 3G mehr)',
  },
  wifi: {
    hex: colors.primary.sage,
    label: 'WiFi',
    description: 'WLAN verfügbar',
  },
  none: {
    hex: '#D4D4D4',
    label: 'Kein O2-Netz',
    description: 'Kein O2-Mobilfunk. Andere Anbieter können verfügbar sein.',
  },
} as const;

// Shadow system (Airbnb-style soft shadows)
export const shadows = {
  subtle: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  cardHover:
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  sheet: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Border radius system
export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
} as const;

// Spacing system (4px base grid)
export const spacing = {
  xs: '4px', // 1 unit
  sm: '8px', // 2 units
  md: '16px', // 4 units
  lg: '24px', // 6 units
  xl: '32px', // 8 units
  '2xl': '48px', // 12 units
} as const;

// Typography system
export const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
  },
  fontSize: {
    display: {
      size: '3rem', // 48px
      lineHeight: '1.1',
      fontWeight: '700',
    },
    h1: {
      size: '2.25rem', // 36px
      lineHeight: '1.2',
      fontWeight: '700',
    },
    h2: {
      size: '1.875rem', // 30px
      lineHeight: '1.3',
      fontWeight: '600',
    },
    h3: {
      size: '1.5rem', // 24px
      lineHeight: '1.4',
      fontWeight: '600',
    },
    body: {
      size: '1rem', // 16px
      lineHeight: '1.5',
      fontWeight: '400',
    },
    caption: {
      size: '0.875rem', // 14px
      lineHeight: '1.4',
      fontWeight: '400',
    },
  },
} as const;

// CSS custom property helpers
export const getCSSVariable = (variableName: string) => {
  return `hsl(var(--${variableName}))`;
};

// Utility to get brand color by path
export const getBrandColor = (path: string): string | undefined => {
  const keys = path.split('.');
  let value: unknown = colors;

  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
};
