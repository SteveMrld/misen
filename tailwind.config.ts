import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // === MISEN V7 DESIGN SYSTEM ===

      colors: {
        // Famille DARK — Fonds et surfaces
        dark: {
          50: '#F6F7F9',
          100: '#ECEEF2',
          200: '#D5D9E2',
          300: '#B0B8C9',
          400: '#8491AB',
          500: '#4B5563',
          600: '#394150',
          700: '#1E2330',
          800: '#12151B',
          850: '#0F1218',
          900: '#0D0F14',
          950: '#0B0D11',
        },
        // Famille ORANGE — Couleur principale (signal)
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Famille GOLD — Accent premium
        gold: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#C8A44E',
          600: '#A68A3E',
          700: '#856D2F',
          800: '#634F1F',
          900: '#422F10',
          950: '#211700',
        },
        // Famille SLATE — Neutres fonctionnels
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Famille CYAN — Héritage logo (usage minimal)
        cyan: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
        // Couleurs sémantiques (feedback)
        success: {
          light: '#34D399',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        error: {
          light: '#F87171',
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        warning: {
          light: '#FBBF24',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        info: {
          light: '#38BDF8',
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
        },
        // Couleurs par modèle IA
        model: {
          kling: '#8B5CF6',
          runway: '#3B82F6',
          sora: '#10B981',
          veo: '#F59E0B',
          seedance: '#EC4899',
          wan: '#F97316',
          hailuo: '#06B6D4',
        },
      },

      // Typographie
      fontFamily: {
        display: ['DM Serif Display', 'Playfair Display', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
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

      // Spacing (base 4px)
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },

      // Border radius
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },

      // Box shadows
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4)',
        'glow-orange': '0 0 0 1px rgba(249,115,22,0.3), 0 0 20px rgba(249,115,22,0.1)',
        'glow-gold': '0 0 0 1px rgba(200,164,78,0.3), 0 0 20px rgba(200,164,78,0.1)',
      },

      // Transitions
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },

      // Max widths
      maxWidth: {
        'dashboard': '1440px',
        'auth': '400px',
        'onboarding': '560px',
      },

      // Layout
      width: {
        'sidebar': '260px',
        'sidebar-collapsed': '64px',
      },

      height: {
        'header': '56px',
      },

      // Animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-orange': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249,115,22,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(249,115,22,0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-in-out',
        'slide-in-right': 'slide-in-right 200ms ease-in-out',
        'pulse-orange': 'pulse-orange 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
