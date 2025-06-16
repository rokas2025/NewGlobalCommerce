'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Theme configuration for Global Commerce
export const themeConfig = {
  defaultTheme: 'system',
  enableSystem: true,
  disableTransitionOnChange: true,
  themes: ['light', 'dark'],
  storageKey: 'global-commerce-theme',
} as const

// Brand colors for easy access in components
export const brandColors = {
  primary: {
    50: 'oklch(0.98 0.01 220)',
    100: 'oklch(0.95 0.02 220)',
    200: 'oklch(0.9 0.04 220)',
    300: 'oklch(0.82 0.08 220)',
    400: 'oklch(0.7 0.15 220)',
    500: 'oklch(0.6 0.2 220)',
    600: 'oklch(0.5 0.18 220)',
    700: 'oklch(0.4 0.15 220)',
    800: 'oklch(0.3 0.12 220)',
    900: 'oklch(0.2 0.08 220)',
    950: 'oklch(0.1 0.04 220)',
  },
  success: {
    50: 'oklch(0.98 0.02 140)',
    100: 'oklch(0.94 0.05 140)',
    200: 'oklch(0.87 0.1 140)',
    300: 'oklch(0.76 0.18 140)',
    400: 'oklch(0.64 0.25 140)',
    500: 'oklch(0.54 0.28 140)',
    600: 'oklch(0.45 0.25 140)',
    700: 'oklch(0.37 0.22 140)',
    800: 'oklch(0.3 0.18 140)',
    900: 'oklch(0.25 0.15 140)',
    950: 'oklch(0.15 0.1 140)',
  },
  warning: {
    50: 'oklch(0.98 0.02 60)',
    100: 'oklch(0.95 0.05 60)',
    200: 'oklch(0.9 0.12 60)',
    300: 'oklch(0.82 0.2 60)',
    400: 'oklch(0.72 0.28 60)',
    500: 'oklch(0.64 0.32 60)',
    600: 'oklch(0.55 0.28 60)',
    700: 'oklch(0.45 0.25 60)',
    800: 'oklch(0.37 0.2 60)',
    900: 'oklch(0.3 0.16 60)',
    950: 'oklch(0.2 0.12 60)',
  },
  error: {
    50: 'oklch(0.98 0.01 20)',
    100: 'oklch(0.95 0.03 20)',
    200: 'oklch(0.9 0.08 20)',
    300: 'oklch(0.82 0.15 20)',
    400: 'oklch(0.7 0.22 20)',
    500: 'oklch(0.58 0.25 20)',
    600: 'oklch(0.48 0.22 20)',
    700: 'oklch(0.39 0.18 20)',
    800: 'oklch(0.32 0.15 20)',
    900: 'oklch(0.26 0.12 20)',
    950: 'oklch(0.18 0.08 20)',
  },
} as const

export type BrandColor = keyof typeof brandColors
export type ColorShade = keyof typeof brandColors.primary
