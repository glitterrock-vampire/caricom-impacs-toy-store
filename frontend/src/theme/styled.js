import styled, { css } from 'styled-components';
import { themeGet } from './utils';

/**
 * Create a styled component with theme access
 * @param {string|Function} element - HTML element or component to style
 * @param {Object|Function} styles - Styles object or function that receives theme
 * @returns {Function} - Styled component
 */
export const createStyled = (element) => (styles, ...interpolations) => {
  return styled(element)(
    (props) => {
      const theme = props.theme || {};
      
      // If styles is a function, call it with theme and props
      const styleResult = typeof styles === 'function' 
        ? styles({ theme, ...props })
        : styles;
      
      // Process nested styles (media queries, pseudo-selectors, etc.)
      const processStyles = (stylesObj) => {
        if (!stylesObj) return null;
        
        return Object.entries(stylesObj).reduce((result, [key, value]) => {
          // Handle nested objects (media queries, pseudo-selectors, etc.)
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // If the key starts with @, it's a media query
            if (key.startsWith('@')) {
              return {
                ...result,
                [key]: processStyles(value),
              };
            }
            
            // Handle pseudo-selectors and other nested selectors
            return {
              ...result,
              [key]: typeof value === 'function' 
                ? value({ theme, ...props }) 
                : processStyles(value),
            };
          }
          
          // Handle theme values (e.g., 'colors.primary.500')
          if (typeof value === 'string' && value.includes('.')) {
            const themeValue = themeGet(value, value);
            if (themeValue !== value) {
              return {
                ...result,
                [key]: themeValue,
              };
            }
          }
          
          // Handle theme functions in template literals
          if (typeof value === 'function') {
            const computedValue = value({ theme, ...props });
            return {
              ...result,
              [key]: computedValue,
            };
          }
          
          return {
            ...result,
            [key]: value,
          };
        }, {});
      };
      
      return processStyles(styleResult);
    },
    ...interpolations.map(interpolation => 
      typeof interpolation === 'function' 
        ? (props) => interpolation({ theme: props.theme || {}, ...props })
        : interpolation
    )
  );
};

// Create shorthands for common HTML elements
export const styledComponents = {
  div: createStyled('div'),
  span: createStyled('span'),
  p: createStyled('p'),
  h1: createStyled('h1'),
  h2: createStyled('h2'),
  h3: createStyled('h3'),
  h4: createStyled('h4'),
  h5: createStyled('h5'),
  h6: createStyled('h6'),
  a: createStyled('a'),
  button: createStyled('button'),
  input: createStyled('input'),
  label: createStyled('label'),
  form: createStyled('form'),
  ul: createStyled('ul'),
  ol: createStyled('ol'),
  li: createStyled('li'),
  table: createStyled('table'),
  thead: createStyled('thead'),
  tbody: createStyled('tbody'),
  tr: createStyled('tr'),
  th: createStyled('th'),
  td: createStyled('td'),
  img: createStyled('img'),
  section: createStyled('section'),
  article: createStyled('article'),
  header: createStyled('header'),
  footer: createStyled('footer'),
  nav: createStyled('nav'),
  main: createStyled('main'),
  aside: createStyled('aside'),
};

// Export all styled components for convenience
export const {
  div,
  span,
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  a,
  button,
  input,
  label,
  form,
  ul,
  ol,
  li,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
  img,
  section,
  article,
  header,
  footer,
  nav,
  main,
  aside,
} = styledComponents;

// Export styled from styled-components for advanced usage
export { css, keyframes, createGlobalStyle, ThemeProvider } from 'styled-components';

// Export our custom theme utilities
export * from './utils';

export default styledComponents;
