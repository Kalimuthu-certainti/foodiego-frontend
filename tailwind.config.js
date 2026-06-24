/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['"Bricolage Grotesque"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // FoodieGo brand — ember/tomato. Appetite + energy, kept professional.
        brand: {
          50: '#FDF3EE',
          100: '#FBE2D6',
          200: '#F7C3AD',
          300: '#F19E7A',
          400: '#EB774B',
          500: '#E2552C',
          600: '#C7431D',
          700: '#A5361A',
          800: '#86301B',
          900: '#6E2B1A',
        },
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: '#E2552C',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        primary: {
          DEFAULT: 'hsl(221.2 83.2% 53.3%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 84.2% 60.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(215.4 16.3% 46.9%)',
        },
        accent: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        success: {
          DEFAULT: 'hsl(142.1 76.2% 36.3%)',
          foreground: 'hsl(355.7 100% 97.3%)',
        },
        warning: {
          DEFAULT: 'hsl(38 92% 50%)',
          foreground: 'hsl(48 96% 89%)',
        },
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(28 25 23 / 0.04), 0 1px 3px 0 rgb(28 25 23 / 0.06)',
        soft: '0 2px 8px -2px rgb(28 25 23 / 0.08), 0 4px 16px -4px rgb(28 25 23 / 0.06)',
        pop: '0 10px 30px -8px rgb(28 25 23 / 0.18)',
      },
    },
  },
  plugins: [],
};
