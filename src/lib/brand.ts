import type { CoverageType } from '../types/coverage';

// Complete brand color system
export const colors = {
  // Primary colors
  primary: {
    warmGold: '#E19B53',
    cream: '#F9F8E6',
    skyBlue: '#ABD8EF',
  },
  // Extended palette
  extended: {
    goldDark: '#C47F35',
    goldLight: '#F0C48A',
    skyBlueDark: '#6AA3C9',
    skyBlueLight: '#D5ECF7',
    creamDark: '#E8E5C8',
    border: '#E8E4D8',
  },
  // Text colors
  text: {
    primary: '#2D2A26',
    secondary: '#5C5650',
    backgroundWhite: '#FEFDF8',
  },
  // Semantic colors for network coverage
  coverage: {
    excellent: '#28A745', // 5G - Green
    good: '#E19B53', // LTE/4G - Gold
    limited: '#FFC107', // 3G - Yellow
    none: '#DC3545', // No signal - Red
  },
} as const;

// Network coverage color mapping
export const coverageColors: Record<
  CoverageType | 'none',
  {
    hex: string;
    label: string;
    description: string;
  }
> = {
  '5g': {
    hex: colors.coverage.excellent,
    label: '5G',
    description: 'Exzellente Geschwindigkeit',
  },
  '4g': {
    hex: colors.coverage.good,
    label: 'LTE/4G',
    description: 'Gut zum Arbeiten',
  },
  '3g': {
    hex: colors.coverage.limited,
    label: '3G',
    description: 'Eingeschränkt',
  },
  '2g': {
    hex: colors.coverage.limited,
    label: '2G',
    description: 'Nur für Notfälle',
  },
  wifi: {
    hex: colors.primary.skyBlue,
    label: 'WiFi',
    description: 'WLAN verfügbar',
  },
  none: {
    hex: colors.coverage.none,
    label: 'Kein Netz',
    description: 'Nicht empfohlen',
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
