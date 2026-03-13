import type { Config } from 'tailwindcss';
import { colors, shadows, radii, spacing } from './src/lib/brand';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          forest: colors.primary.forest,
          'forest-light': colors.primary.forestLight,
          'forest-muted': colors.primary.forestMuted,
          sage: colors.primary.sage,
          mint: colors.primary.mint,
        },
        // Coverage colors
        coverage: {
          excellent: colors.coverage.excellent,
          good: colors.coverage.good,
          limited: colors.coverage.limited,
          none: colors.coverage.none,
        },
        // shadcn/ui color system (keeping existing CSS variables)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        'brand-subtle': shadows.subtle,
        'brand-card': shadows.card,
        'brand-card-hover': shadows.cardHover,
        'brand-sheet': shadows.sheet,
      },
      borderRadius: {
        'brand-sm': radii.sm,
        'brand-md': radii.md,
        'brand-lg': radii.lg,
        'brand-full': radii.full,
        // Keep shadcn/ui radius system
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        'brand-xs': spacing.xs,
        'brand-sm': spacing.sm,
        'brand-md': spacing.md,
        'brand-lg': spacing.lg,
        'brand-xl': spacing.xl,
        'brand-2xl': spacing['2xl'],
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'brand-display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'brand-h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'brand-h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'brand-h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'brand-body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'brand-caption': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
