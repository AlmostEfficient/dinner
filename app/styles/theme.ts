/**
 * Theme configuration
 * 
 * This file centralizes all theme definitions using semantic naming and
 * provides theme switching functionality.
 */

export type ThemeConfig = {
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
};

export const dinerTheme: ThemeConfig = {
  name: "diner",
  colors: {
    background: "oklch(0.99 0.01 90)",
    foreground: "oklch(0.25 0.06 280)",
    card: "oklch(0.98 0.02 90)",
    cardForeground: "oklch(0.25 0.06 280)",
    primary: "oklch(0.6 0.2 40)",
    primaryForeground: "oklch(0.99 0.01 90)",
    secondary: "oklch(0.65 0.15 140)",
    secondaryForeground: "oklch(0.99 0.01 90)",
    accent: "oklch(0.65 0.2 40)",
    accentForeground: "oklch(0.99 0.01 90)",
    muted: "oklch(0.96 0.03 90)",
    mutedForeground: "oklch(0.5 0.05 250)",
    destructive: "oklch(0.65 0.3 25)",
    destructiveForeground: "oklch(0.99 0.01 90)",
    border: "oklch(0.85 0.05 90)",
    input: "oklch(0.85 0.05 90)",
    ring: "oklch(0.6 0.2 40 / 0.4)",
  },
  radii: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
};

// You can create additional themes following the same structure
export const sunsetTheme: ThemeConfig = {
  name: "sunset",
  colors: {
    background: "oklch(0.99 0.01 90)",
    foreground: "oklch(0.2 0.04 30)",
    card: "oklch(0.98 0.02 90)",
    cardForeground: "oklch(0.2 0.04 30)",
    primary: "oklch(0.6 0.2 40)",
    primaryForeground: "oklch(0.99 0.01 90)",
    secondary: "oklch(0.65 0.2 350)",
    secondaryForeground: "oklch(0.99 0.01 90)",
    accent: "oklch(0.65 0.2 40)",
    accentForeground: "oklch(0.99 0.01 90)",
    muted: "oklch(0.96 0.03 90)",
    mutedForeground: "oklch(0.5 0.05 30)",
    destructive: "oklch(0.65 0.3 25)",
    destructiveForeground: "oklch(0.99 0.01 90)",
    border: "oklch(0.85 0.05 30)",
    input: "oklch(0.85 0.05 30)",
    ring: "oklch(0.6 0.2 40 / 0.4)",
  },
  radii: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
};

// Export all available themes
export const themes = {
  diner: dinerTheme,
  sunset: sunsetTheme,
};

// Default theme
export const defaultTheme = dinerTheme; 