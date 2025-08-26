import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// Finpay UI exact colors
  			finpay: {
  				'teal': {
  					'50': '#f0fdfa',
  					'100': '#ccfbf1',
  					'200': '#99f6e4',
  					'300': '#5eead4',
  					'400': '#2dd4bf',
  					'500': '#14b8aa',
  					'600': '#0d9488',
  					'700': '#0f766e',
  					'800': '#115e59',
  					'900': '#134e4a',
  					'950': '#042f2e',
  				},
  				'blue': {
  					'50': '#eff6ff',
  					'100': '#dbeafe',
  					'200': '#bfdbfe',
  					'300': '#93c5fd',
  					'400': '#60a5fa',
  					'500': '#3b82f6',
  					'600': '#2563eb',
  					'700': '#1d4ed8',
  					'800': '#1e40af',
  					'900': '#1e3a8a',
  					'950': '#172554',
  				},
  				'pink': {
  					'50': '#fdf2f8',
  					'100': '#fce7f3',
  					'200': '#fbcfe8',
  					'300': '#f9a8d4',
  					'400': '#f472b6',
  					'500': '#ec4899',
  					'600': '#db2777',
  					'700': '#be185d',
  					'800': '#9d174d',
  					'900': '#831843',
  					'950': '#500724',
  				},
  				'purple': {
  					'50': '#faf5ff',
  					'100': '#f3e8ff',
  					'200': '#e9d5ff',
  					'300': '#d8b4fe',
  					'400': '#c084fc',
  					'500': '#a855f7',
  					'600': '#9333ea',
  					'700': '#7c3aed',
  					'800': '#6b21a8',
  					'900': '#581c87',
  					'950': '#3b0764',
  				},
  				'gray': {
  					'50': '#f9fafb',
  					'100': '#f3f4f6',
  					'200': '#e5e7eb',
  					'300': '#d1d5db',
  					'400': '#9ca3af',
  					'500': '#6b7280',
  					'600': '#4b5563',
  					'700': '#374151',
  					'800': '#1f2937',
  					'900': '#111827',
  					'950': '#030712',
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
