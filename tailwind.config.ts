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
        dark: {
          950: '#06080D', 900: '#0C0F1A', 850: '#111827', 800: '#1A1F2E',
          700: '#252B3B', 600: '#374151', 500: '#4B5563', 400: '#6B7280', 300: '#9CA3AF',
        },
        orange: {
          50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
          400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
          800: '#9A3412', 900: '#7C2D12',
        },
        gold: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
          400: '#FBBF24', 500: '#D4A853', 600: '#B8860B',
        },
        slate: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
          400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
          800: '#1E293B', 900: '#0F172A', 950: '#020617',
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
        display: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'overline': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
      },
      borderRadius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px' },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4)',
        'glow-orange': '0 0 0 1px rgba(249,115,22,0.3), 0 0 20px rgba(249,115,22,0.15)',
        'glow-gold': '0 0 0 1px rgba(251,191,36,0.3), 0 0 20px rgba(251,191,36,0.15)',
      },
      maxWidth: { dashboard: '1440px', auth: '420px' },
      width: { sidebar: '260px', 'sidebar-collapsed': '64px' },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'shimmer': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: { 'fade-in': 'fade-in 300ms ease-in-out', 'shimmer': 'shimmer 1.1s infinite' },
    },
  },
  plugins: [],
}
export default config
