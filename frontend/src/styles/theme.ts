import { createTheme, rem, type MantineColorsTuple, type CSSVariablesResolver } from '@mantine/core';

// ─── Brand Color Palette ──────────────────────────────────────────────────────
const brand: MantineColorsTuple = [
  '#e7f5ff', // 0 - lightest
  '#d0ebff', // 1
  '#a5d8ff', // 2
  '#74c0fc', // 3
  '#4dabf7', // 4
  '#339af0', // 5
  '#228be6', // 6 - primary
  '#1c7ed6', // 7
  '#1971c2', // 8
  '#1864ab', // 9 - darkest
];

// ─── Semantic Color Palette (for status/accents) ──────────────────────────────
const success: MantineColorsTuple = [
  '#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9',
  '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b',
];
const danger: MantineColorsTuple = [
  '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787',
  '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a',
];
const warning: MantineColorsTuple = [
  '#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b',
  '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700',
];

// ─── CSS Variables Resolver (light/dark semantic tokens) ─────────────────────
export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--app-radius-sm': theme.radius.sm,
    '--app-radius-md': theme.radius.md,
    '--app-radius-lg': theme.radius.lg,
    '--app-spacing-xs': theme.spacing.xs,
    '--app-spacing-sm': theme.spacing.sm,
    '--app-spacing-md': theme.spacing.md,
    '--app-spacing-lg': theme.spacing.lg,
    '--app-spacing-xl': theme.spacing.xl,
    '--app-font-heading': 'Inter, sans-serif',
  },
  light: {
    '--app-surface': '#ffffff',
    '--app-surface-dim': '#f8f9fa',
    '--app-surface-hover': '#f1f3f5',
    '--app-border': '#dee2e6',
    '--app-border-light': '#e9ecef',
    '--app-text-primary': '#212529',
    '--app-text-secondary': '#495057',
    '--app-text-muted': '#868e96',
    '--app-shadow-sm': '0 1px 3px rgba(0,0,0,0.08)',
    '--app-shadow-md': '0 4px 12px rgba(0,0,0,0.08)',
    '--app-shadow-lg': '0 8px 24px rgba(0,0,0,0.10)',
    '--app-sidebar-bg': '#ffffff',
    '--app-header-bg': 'rgba(255,255,255,0.85)',
    '--app-overlay': 'rgba(0,0,0,0.5)',
  },
  dark: {
    '--app-surface': '#1a1b1e',
    '--app-surface-dim': '#141517',
    '--app-surface-hover': '#25262b',
    '--app-border': '#373a40',
    '--app-border-light': '#2c2e33',
    '--app-text-primary': '#c1c2c5',
    '--app-text-secondary': '#909296',
    '--app-text-muted': '#5c5f66',
    '--app-shadow-sm': '0 1px 3px rgba(0,0,0,0.3)',
    '--app-shadow-md': '0 4px 12px rgba(0,0,0,0.4)',
    '--app-shadow-lg': '0 8px 24px rgba(0,0,0,0.5)',
    '--app-sidebar-bg': '#141517',
    '--app-header-bg': 'rgba(26,27,30,0.85)',
    '--app-overlay': 'rgba(0,0,0,0.7)',
  },
});

// ─── Main Theme ──────────────────────────────────────────────────────────────
export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand,
    success,
    danger,
    warning,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: rem(36), lineHeight: '1.2' },
      h2: { fontSize: rem(28), lineHeight: '1.3' },
      h3: { fontSize: rem(22), lineHeight: '1.35' },
      h4: { fontSize: rem(18), lineHeight: '1.4' },
    },
  },
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.10)',
    xl: '0 12px 48px rgba(0,0,0,0.12)',
  },
  defaultRadius: 'md',

  // ─── Component Overrides ─────────────────────────────────────────────────
  components: {
    // Buttons
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Cards
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
        withBorder: true,
      },
      styles: () => ({
        root: {
          backgroundColor: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
        },
      }),
    },

    // Paper
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
      styles: () => ({
        root: {
          backgroundColor: 'var(--app-surface)',
        },
      }),
    },

    // Tables
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        withTableBorder: false,
        withColumnBorders: false,
      },
      styles: () => ({
        table: {
          fontSize: rem(14),
        },
        th: {
          fontSize: rem(12),
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          color: 'var(--app-text-muted)',
        },
      }),
    },

    // Modals
    Modal: {
      defaultProps: {
        radius: 'lg',
        centered: true,
        overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      },
      styles: () => ({
        header: {
          backgroundColor: 'var(--app-surface)',
          borderBottom: '1px solid var(--app-border-light)',
        },
        body: {
          backgroundColor: 'var(--app-surface)',
        },
      }),
    },

    // Drawers
    Drawer: {
      defaultProps: {
        overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      },
      styles: () => ({
        header: {
          backgroundColor: 'var(--app-surface)',
        },
        body: {
          backgroundColor: 'var(--app-surface)',
        },
      }),
    },

    // Inputs
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    DateInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    // NavLink (sidebar)
    NavLink: {
      defaultProps: {
        variant: 'subtle',
      },
      styles: () => ({
        root: {
          borderRadius: 'var(--app-radius-md)',
        },
      }),
    },

    // Tabs
    Tabs: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Badge
    Badge: {
      defaultProps: {
        radius: 'sm',
        variant: 'light',
      },
    },

    // AppShell
    AppShell: {
      styles: () => ({
        main: {
          backgroundColor: 'var(--app-surface-dim)',
        },
        navbar: {
          backgroundColor: 'var(--app-sidebar-bg)',
          borderRight: '1px solid var(--app-border-light)',
        },
        header: {
          backgroundColor: 'var(--app-header-bg)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--app-border-light)',
        },
      }),
    },

    // Tooltip
    Tooltip: {
      defaultProps: {
        radius: 'sm',
        withArrow: true,
      },
    },

    // ActionIcon
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Menu
    Menu: {
      defaultProps: {
        radius: 'md',
        shadow: 'md',
      },
      styles: () => ({
        dropdown: {
          backgroundColor: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
        },
      }),
    },

    // Notification
    Notification: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
