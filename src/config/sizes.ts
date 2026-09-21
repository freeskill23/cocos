export const SIZE_LIMITS = {
  MIN_WIDTH: 400,
  MAX_WIDTH: 1200,
  MIN_DEPTH: 350,
  MAX_DEPTH: 900,
  MIN_HEIGHT: 400,
  MAX_HEIGHT: 1000,
} as const;

export const SLIDER_STEP = 5;

export type SizeLimitKey = keyof typeof SIZE_LIMITS;
