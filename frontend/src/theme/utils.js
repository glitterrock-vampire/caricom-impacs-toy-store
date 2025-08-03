import { theme } from './index';

/**
 * Generate responsive styles based on breakpoints
 * @param {Object} styles - Object with breakpoint keys and style objects
 * @returns {Object} - Responsive style object
 */
export const responsive = (styles) => {
  if (!styles) return {};
  
  const breakpoints = theme.breakpoints;
  const responsiveStyles = {};
  
  // Handle base styles (no media query)
  if (styles.base) {
    Object.assign(responsiveStyles, styles.base);
    delete styles.base;
  }
  
  // Add responsive styles with media queries
  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoints[breakpoint]) {
      responsiveStyles[`@media (min-width: ${breakpoints[breakpoint]})`] = style;
    }
  });
  
  return responsiveStyles;
};

/**
 * Get a value from the theme by path
 * @param {string} path - Path to the theme value (e.g., 'colors.primary.500')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} - The theme value or defaultValue
 */
export const themeGet = (path, defaultValue = undefined) => {
  if (!path) return defaultValue;
  
  return path.split('.').reduce((result, key) => {
    return result && result[key] !== undefined ? result[key] : defaultValue;
  }, theme);
};

/**
 * Convert a pixel value to rem
 * @param {number} px - Pixel value to convert
 * @param {number} baseFontSize - Base font size in pixels (default: 16)
 * @returns {string} - Value in rem
 */
export const rem = (px, baseFontSize = 16) => {
  return `${px / baseFontSize}rem`;
};

/**
 * Convert a pixel value to em
 * @param {number} px - Pixel value to convert
 * @param {number} context - Context font size in pixels (default: 16)
 * @returns {string} - Value in em
 */
export const em = (px, context = 16) => {
  return `${px / context}em`;
};

/**
 * Generate a linear gradient
 * @param {string} direction - Gradient direction (e.g., 'to right', '45deg')
 * @param {...string} colors - Color stops
 * @returns {string} - CSS linear-gradient value
 */
export const linearGradient = (direction, ...colors) => {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
};

/**
 * Generate a box shadow
 * @param {string} shadow - Shadow key from theme or custom value
 * @returns {string} - CSS box-shadow value
 */
export const shadow = (shadow) => {
  return theme.shadows[shadow] || shadow;
};

/**
 * Generate a transition string
 * @param {string} property - CSS property to transition
 * @param {string} duration - Duration key from theme or custom value
 * @param {string} easing - Easing function key from theme or custom value
 * @param {string} delay - Delay value (default: '0s')
 * @returns {string} - CSS transition value
 */
export const transition = (property, duration = 'normal', easing = 'ease-in-out', delay = '0s') => {
  const durationValue = theme.transition.duration[duration] || duration;
  const easingValue = theme.transition.easing[easing] || easing;
  
  return `${property} ${durationValue} ${easingValue} ${delay}`.trim();
};
