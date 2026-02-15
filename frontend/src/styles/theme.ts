import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#e7f5ff', // 0
      '#d0ebff', // 1
      '#a5d8ff', // 2
      '#74c0fc', // 3
      '#4dabf7', // 4
      '#339af0', // 5
      '#228be6', // 6 - Primary
      '#1c7ed6', // 7
      '#1971c2', // 8
      '#1864ab', // 9
    ],
  },
  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        variant: 'filled',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
        withBorder: true,
      },
      styles: () => ({
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        },
      }),
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
      styles: () => ({
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      }),
    }
  },
});
