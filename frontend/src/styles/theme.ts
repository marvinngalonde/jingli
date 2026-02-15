import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // Dark Navy Blue (#000035) color palette
  colors: {
    navy: [
      '#e6e6f0', // 0: very light (backgrounds, hover states)
      '#ccccde', // 1: light
      '#9999bd', // 2: 
      '#66669c', // 3:
      '#33337b', // 4:
      '#1a1a58', // 5:
      '#0d0d46', // 6: lighter version for some elements
      '#000035', // 7: Main color - the exact color requested
      '#00002b', // 8: slightly darker
      '#000021', // 9: deepest (for very dark elements)
    ],
  },
  primaryColor: 'navy',
  fontFamily: 'Inter, sans-serif', // Clean professional font
  defaultRadius: 'xs', // Sharp corners as requested
});
