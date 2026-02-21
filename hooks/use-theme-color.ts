/**
 * AlmaShop Theme Color Hook
 * Returns colors from the Heritage Modernity design system.
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
): string {
  // AlmaShop currently uses a single theme (Heritage Modernity)
  const colorFromProps = props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  const color = Colors[colorName];
  if (typeof color === 'string') {
    return color;
  }
  // For nested objects like primary.DEFAULT
  if (typeof color === 'object' && 'DEFAULT' in color) {
    return (color as { DEFAULT: string }).DEFAULT;
  }
  return '#2D2D2D'; // fallback
}
