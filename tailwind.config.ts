import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm cinematic blacks (brown-tinted)
        dark: {
          950: '#0A0806', 900: '#110E0B', 850: '#1A1613', 800: '#231E1A',
          700: '#332C26', 600: '#4A4038', 500: '#635850', 400: '#7D726A', 300: '#A09590',
        },
        // Copper/amber — primary accent
        orange: {
          50: '#FDF8F0', 100: '#F9ECD8', 200: '#F0D5AD', 300: '#E5B97A',
          400: '#D4974A', 500: '#C07B2A', 600: '#A36520', 700: '#83501A',
          800: '#6B4017', 900: '#4A2D10',
        },
        copper: {
          50: '#FDF8F0', 100: '#F9ECD8', 200: '#F0D5AD', 300: '#E5B97A',
          400: '#D4974A', 500: '#C07B2A', 600: '#A36520', 700: '#83501A',
        },
        gold: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
          400: '#FBBF24', 500: '#D4A853', 600: '#B8860B',
        },
        slate: {
          50: '#FAF8F6', 100: '#F1EDE8', 200: '#E2DCD5', 300: '#C9C1B8',
          400: '#A09590', 500: '#7D726A', 600: '#5C534B', 700: '#3D3530',
          800: '#231E1A', 900: '#110E0B', 950: '#0A0806',
        },
        cyan: {
          400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 900: '#164E63',
        },
        success: { light: '#34D399', DEFAULT: '#059669', dark: '#059669' },
        error: { light: '#FCA5A5', DEFAULT: '#DC2626', dark: '#DC2626' },
        warning: { light: '#FBBF24', DEFAULT: '#D97706', dark: '#D97706' },
        info: { light: '#38BDF8', DEFAULT: '#0284C7', dark: '#0284C7' },
        model: {
          kling: '#3B82F6', runway: '#8B5CF6', sora: '#EC4899',
          veo: '#10B981', seedance: '#14B8A6', wan: '#6366F1', hailuo: '#D946EF',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h1': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'overline': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '600' }],
      },
      borderRadius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px', '3xl': '24px' },
      boxShadow: {
        'card': '0 2px 8px rgba(10,8,6,0.5), 0 1px 3px rgba(10,8,6,0.3)',
        'card-hover': '0 8px 24px rgba(10,8,6,0.6), 0 0 0 1px rgba(212,151,74,0.1)',
        'glow-copper': '0 0 0 1px rgba(192,123,42,0.3), 0 0 24px rgba(192,123,42,0.12)',
        'glow-orange': '0 0 0 1px rgba(192,123,42,0.3), 0 0 20px rgba(192,123,42,0.15)',
        'glow-gold': '0 0 0 1px rgba(251,191,36,0.3), 0 0 20px rgba(251,191,36,0.15)',
        'cinematic': '0 25px 50px -12px rgba(10,8,6,0.7)',
      },
      maxWidth: { dashboard: '1440px', auth: '420px' },
      width: { sidebar: '260px', 'sidebar-collapsed': '64px' },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'shimmer': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        'glow-pulse': { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        'film-grain': { '0%, 100%': { transform: 'translate(0,0)' }, '10%': { transform: 'translate(-1%,-1%)' }, '30%': { transform: 'translate(1%,0)' }, '50%': { transform: 'translate(-1%,1%)' }, '70%': { transform: 'translate(1%,-1%)' }, '90%': { transform: 'translate(0,1%)' } },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'film-grain': 'film-grain 0.3s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
export default config
