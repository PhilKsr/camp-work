import { THEME_COLORS } from './constants';

// Brand color utilities
export const getBrandColor = (colorName: keyof typeof THEME_COLORS) => {
  return THEME_COLORS[colorName];
};

// CSS custom property helpers
export const getCSSVariable = (variableName: string) => {
  return `hsl(var(--${variableName}))`;
};

// Brand-specific component variants
export const brandVariants = {
  button: {
    primary: 'bg-brand-primary hover:bg-brand-primary/90 text-white',
    secondary:
      'bg-brand-secondary hover:bg-brand-secondary/80 text-brand-forest',
    accent: 'bg-brand-accent hover:bg-brand-accent/90 text-white',
    ghost: 'hover:bg-brand-accent/10 text-brand-forest',
  },
  card: {
    default: 'bg-card border-brand-neutral/20',
    elevated: 'bg-card shadow-lg border-brand-neutral/20',
    interactive: 'bg-card hover:bg-brand-secondary/30 border-brand-neutral/20',
  },
  badge: {
    default: 'bg-brand-neutral/20 text-brand-forest',
    success: 'bg-brand-accent/20 text-brand-forest',
    warning: 'bg-brand-earth/20 text-brand-forest',
    info: 'bg-brand-sky/20 text-brand-forest',
  },
} as const;
