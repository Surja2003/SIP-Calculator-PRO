import plugin from 'tailwindcss/plugin';

export default plugin(function({ addBase }) {
  addBase({
    ':root': {
      // Light mode colors
      '--color-primary': '#4F46E5',
      '--color-primary-light': '#6366F1',
      '--color-primary-dark': '#4338CA',
      '--color-secondary': '#10B981',
      '--color-secondary-light': '#34D399',
      '--color-secondary-dark': '#059669',
      '--color-background': '#FFFFFF',
      '--color-surface': '#F3F4F6',
      '--color-text': '#1F2937',
      '--color-text-secondary': '#6B7280',
      '--color-border': '#E5E7EB',
      '--color-success': '#10B981',
      '--color-error': '#EF4444',
      '--color-warning': '#F59E0B',
    },
    '.dark': {
      // Dark mode colors
      '--color-primary': '#6366F1',
      '--color-primary-light': '#818CF8',
      '--color-primary-dark': '#4F46E5',
      '--color-secondary': '#34D399',
      '--color-secondary-light': '#6EE7B7',
      '--color-secondary-dark': '#10B981',
      '--color-background': '#111827',
      '--color-surface': '#1F2937',
      '--color-text': '#F9FAFB',
      '--color-text-secondary': '#9CA3AF',
      '--color-border': '#374151',
      '--color-success': '#34D399',
      '--color-error': '#F87171',
      '--color-warning': '#FBBF24',
    }
  });
});