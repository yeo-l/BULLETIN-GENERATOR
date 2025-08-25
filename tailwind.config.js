/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      './public/**/*.html',
    ],
    theme: {
      extend: {
        colors: {
          dhis2: {
            blue: '#1976d2',
            'blue-dark': '#1565c0',
            'blue-light': '#42a5f5',
            green: '#4caf50',
            'green-dark': '#388e3c',
            'green-light': '#66bb6a',
            orange: '#ff9800',
            'orange-dark': '#f57c00',
            'orange-light': '#ffb74d',
            red: '#f44336',
            'red-dark': '#d32f2f',
            'red-light': '#ef5350',
            purple: '#9c27b0',
            'purple-dark': '#7b1fa2',
            'purple-light': '#ba68c8',
            gray: {
              50: '#fafafa',
              100: '#f5f5f5',
              200: '#eeeeee',
              300: '#e0e0e0',
              400: '#bdbdbd',
              500: '#9e9e9e',
              600: '#757575',
              700: '#616161',
              800: '#424242',
              900: '#212121',
            }
          },
          pev: {
            primary: '#1976d2',
            secondary: '#4caf50',
            accent: '#ff9800',
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196f3'
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace']
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem'
        },
        borderRadius: {
          'xl': '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem'
        },
        boxShadow: {
          'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.1)',
          'medium': '0 4px 25px 0 rgba(0, 0, 0, 0.1)',
          'hard': '0 10px 40px 0 rgba(0, 0, 0, 0.15)',
          'dhis2': '0 2px 4px 0 rgba(25, 118, 210, 0.1)'
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'slide-down': 'slideDown 0.3s ease-out',
          'pulse-slow': 'pulse 3s infinite'
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          },
          slideDown: {
            '0%': { transform: 'translateY(-20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          }
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
          'pev-gradient': 'linear-gradient(135deg, #1976d2 0%, #4caf50 100%)'
        },
        typography: {
          DEFAULT: {
            css: {
              maxWidth: 'none',
              color: '#374151',
              h1: {
                color: '#1976d2',
                fontWeight: '700'
              },
              h2: {
                color: '#1976d2',
                fontWeight: '600'
              },
              h3: {
                color: '#424242',
                fontWeight: '600'
              },
              a: {
                color: '#1976d2',
                '&:hover': {
                  color: '#1565c0'
                }
              }
            }
          }
        }
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
      require('@tailwindcss/aspect-ratio'),
      // Plugin personnalisé pour les utilitaires PEV
      function({ addUtilities, theme }) {
        const newUtilities = {
          '.dhis2-integration': {
            minHeight: '100vh',
            backgroundColor: theme('colors.gray.50')
          },
          '.bulletin-card': {
            backgroundColor: 'white',
            borderRadius: theme('borderRadius.lg'),
            boxShadow: theme('boxShadow.soft'),
            border: `1px solid ${theme('colors.gray.200')}`,
            padding: theme('spacing.6'),
            marginBottom: theme('spacing.4')
          },
          '.disease-stat': {
            background: 'linear-gradient(135deg, #1976d2 0%, #4caf50 100%)',
            color: 'white',
            padding: theme('spacing.4'),
            borderRadius: theme('borderRadius.lg')
          },
          '.export-button': {
            backgroundColor: theme('colors.dhis2.blue'),
            '&:hover': {
              backgroundColor: theme('colors.dhis2.blue-dark')
            },
            color: 'white',
            padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
            borderRadius: theme('borderRadius.md'),
            display: 'flex',
            alignItems: 'center',
            gap: theme('spacing.2'),
            transition: 'colors 0.2s ease'
          },
          '.alert-high': {
            backgroundColor: theme('colors.red.50'),
            borderColor: theme('colors.red.200'),
            color: theme('colors.red.800')
          },
          '.alert-medium': {
            backgroundColor: theme('colors.orange.50'),
            borderColor: theme('colors.orange.200'),
            color: theme('colors.orange.800')
          },
          '.alert-low': {
            backgroundColor: theme('colors.green.50'),
            borderColor: theme('colors.green.200'),
            color: theme('colors.green.800')
          },
          '.pev-container': {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: `0 ${theme('spacing.6')}`
          },
          '.chart-container': {
            backgroundColor: 'white',
            borderRadius: theme('borderRadius.lg'),
            padding: theme('spacing.6'),
            boxShadow: theme('boxShadow.soft')
          }
        }
        addUtilities(newUtilities)
      }
    ],
    // Configuration pour la compatibilité avec DHIS2
    corePlugins: {
      preflight: false, // Désactiver le reset CSS pour éviter les conflits avec DHIS2
    },
    // Purge/Content configuration pour l'optimisation
    safelist: [
      'bg-red-50',
      'bg-red-100', 
      'bg-red-200',
      'bg-orange-50',
      'bg-orange-100',
      'bg-orange-200',
      'bg-green-50',
      'bg-green-100',
      'bg-green-200',
      'bg-blue-50',
      'bg-blue-100',
      'bg-blue-200',
      'text-red-600',
      'text-red-700',
      'text-red-800',
      'text-orange-600',
      'text-orange-700', 
      'text-orange-800',
      'text-green-600',
      'text-green-700',
      'text-green-800',
      'text-blue-600',
      'text-blue-700',
      'text-blue-800',
      'border-red-200',
      'border-orange-200',
      'border-green-200',
      'border-blue-200'
    ]
  }