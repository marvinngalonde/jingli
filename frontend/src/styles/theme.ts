import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#eef3ff',
      '#dce4f5',
      '#b9c7e2',
      '#94a8d0',
      '#748dc1',
      '#5f7cb8',
      '#5474b4',
      '#44639f',
      '#39588f',
      '#2d4b81',
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
      styles: (theme) => ({
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glassmorphism base
          backdropFilter: 'blur(10px)',
        },
      }),
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
      styles: (theme) => ({
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      }),
    }
  },
});
