export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
export { radii } from './radii';

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radii } from './radii';

export const theme = {
  colors,
  spacing,
  typography,
  radii,
} as const;

export type Theme = typeof theme;
