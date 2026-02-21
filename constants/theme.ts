
// ─── Design Tokens ─────────────────────────────
// AlmaShop Design System — Figma Source of Truth
// Exported as JS constants for programmatic use
// (Tailwind classes should be preferred; use these for dynamic styling)

export const Colors = {
  primary: {
    DEFAULT: '#FF6B57', // Brand Orange
    light: '#FF8A7A',
  },
  accent: {
    DEFAULT: '#121926', // Neutral 900 (Dark)
    dark: '#000000',
  },
  info: '#0076F5', // Blue
  bg: '#FFFFFF', // White
  surface: '#F8FAFC', // Neutral 50
  text: {
    DEFAULT: '#121926', // Neutral 900
    muted: '#9AA4B2', // Neutral 400
  },
  border: '#E3E8EF', // Neutral 200
  success: '#00D79E',
  error: '#FF3E38', // Danger
  warning: '#FFB13B',
  // ─── Full Neutral Palette (from Figma) ─────────
  neutral: {
    25: '#FCFCFD',
    50: '#F8FAFC',
    100: '#EEF2F6',
    200: '#E3E8EF',
    300: '#CDD5DF',
    400: '#9AA4B2',
    500: '#697586',
    600: '#4B5565',
    700: '#364152',
    800: '#202939',
    900: '#121926',
  },
  base: {
    white: '#FFFFFF',
    black: '#000000',
  },
} as const;

export const Typography = {
  display: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, lineHeight: 40 },
  h1: { fontFamily: 'Inter_600SemiBold', fontSize: 24, lineHeight: 32 },
  h2: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28 },
  h3: { fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24 },
  bodyLg: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  bodyMd: { fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
  price: { fontFamily: 'Inter_700Bold', fontSize: 18, lineHeight: 24 },
  button: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20 },
} as const;

export const Spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Elevation = {
  xs: {
    shadowColor: '#1C202B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1C202B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1C202B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1C202B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#1C202B',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 10,
  },
  xxl: {
    shadowColor: '#1C202B',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.30,
    shadowRadius: 48,
    elevation: 16,
  },
} as const;
