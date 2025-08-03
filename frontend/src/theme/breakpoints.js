// Breakpoints (mobile-first approach)
export const breakpoints = {
  // Small screen / phone
  sm: '640px',
  // Medium screen / tablet
  md: '768px',
  // Large screen / desktop
  lg: '1024px',
  // Extra large screen / wide desktop
  xl: '1280px',
  // 2X large screen / extra wide desktop
  '2xl': '1536px',
};

// Media query helpers
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  // Reduced motion
  reduceMotion: '(prefers-reduced-motion: reduce)',
  // Dark mode
  dark: '(prefers-color-scheme: dark)',
  // Print
  print: 'print',
};

// Container max-widths
export const containerMaxWidths = {
  sm: breakpoints.sm,
  md: breakpoints.md,
  lg: breakpoints.lg,
  xl: breakpoints.xl,
  '2xl': breakpoints['2xl'],
};

// Grid system
export const grid = {
  columns: 12,
  gutter: '1.5rem', // 24px
  container: {
    padding: '1rem', // 16px
    maxWidth: '1200px',
  },
};
