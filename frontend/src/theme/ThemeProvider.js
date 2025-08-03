import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { theme as defaultTheme } from './index';

// Create a context for the theme
const ThemeContext = createContext(undefined);

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({
  theme: customTheme = {},
  children,
}) => {
  // Merge the default theme with any custom theme values
  const mergedTheme = useMemo(() => ({
    ...defaultTheme,
    ...customTheme,
    colors: {
      ...defaultTheme.colors,
      ...(customTheme.colors || {}),
    },
    typography: {
      ...defaultTheme.typography,
      ...(customTheme.typography || {}),
    },
    // Add other theme sections as needed
  }), [customTheme]);

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  theme: PropTypes.object,
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
