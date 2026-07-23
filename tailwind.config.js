/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
			screens: { '2xl': '1440px' },
		},
		extend: {
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      screens: { xs: '375px' },
			colors: {
				border:      'hsl(var(--border))',
				input:       'hsl(var(--input))',
				ring:        'hsl(var(--ring))',
				background:  'hsl(var(--background))',
				foreground:  'hsl(var(--foreground))',
				primary:     { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
				secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
				destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
				muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
				accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
				popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
				card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
			},
			borderRadius: {
				sm:   'calc(var(--radius) - 4px)',
				md:   'calc(var(--radius) - 2px)',
				lg:   'var(--radius)',
				xl:   '0.75rem',
				'2xl':'1rem',
				'3xl':'1.5rem',
			},
			keyframes: {
				'accordion-down': { from: { height: 0 }, to: { height: 'var(--radix-accordion-content-height)' } },
				'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: 0 } },
        'fade-up':   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'fade-in':   { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in':  { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':  'fade-up 0.5s var(--ease-out-expo, ease-out) forwards',
        'fade-in':  'fade-in 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.35s var(--ease-out-expo, ease-out) forwards',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
