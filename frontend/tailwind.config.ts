import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: '#00F0FF',
          50: '#E0FCFF',
          100: '#B8F8FF',
          200: '#7AF2FF',
          300: '#3DEBFF',
          400: '#00E5FF',
          500: '#00F0FF',
          600: '#00C4D4',
          700: '#0098A8',
          800: '#006C7D',
          900: '#004051',
        },
        magenta: {
          DEFAULT: '#FF00FF',
          50: '#FFE0FF',
          100: '#FFB8FF',
          200: '#FF7AFF',
          300: '#FF3DFF',
          400: '#FF00FF',
          500: '#FF00FF',
          600: '#D400D4',
          700: '#A800A8',
          800: '#7D007D',
          900: '#510051',
        },
        gold: {
          DEFAULT: '#FFD700',
          50: '#FFF9E0',
          100: '#FFF2B8',
          200: '#FFE87A',
          300: '#FFDE3D',
          400: '#FFD700',
          500: '#FFD700',
          600: '#D4B300',
          700: '#A88F00',
          800: '#7D6B00',
          900: '#514600',
        },
        'dark-blue': {
          DEFAULT: '#0A0E27',
          50: '#1A1F3A',
          100: '#151A33',
          200: '#10142D',
          300: '#0A0E27',
          400: '#070A1E',
          500: '#040615',
          600: '#02030C',
          700: '#000103',
        },
        surface: {
          DEFAULT: '#1A1F3A',
          light: '#252A4A',
          lighter: '#303560',
          dark: '#12162D',
        },
        success: '#00FF88',
        danger: '#FF3366',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00F0FF, 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-magenta': '0 0 5px #FF00FF, 0 0 20px rgba(255, 0, 255, 0.3)',
        'neon-gold': '0 0 5px #FFD700, 0 0 20px rgba(255, 215, 0, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, #00F0FF 0%, #FF00FF 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00F0FF, 0 0 10px #00F0FF' },
          '100%': { boxShadow: '0 0 10px #00F0FF, 0 0 30px #00F0FF, 0 0 50px #00F0FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
