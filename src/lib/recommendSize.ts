import { SIZE_LIMITS } from "@/config/sizes";

export interface RecommendedSize {
  width: number;
  depth: number;
  height: number;
}

export interface RecommendConfig {
  baseWidth: number;
  baseDepth: number;
  baseHeight: number;
  weightFactor: number;
  lengthFactor: number;
}

export const RECOMMEND_CONFIG: RecommendConfig = {
  baseWidth: 500,
  baseDepth: 400,
  baseHeight: 450,
  weightFactor: 25,
  lengthFactor: 1.2,
};

export function recommendSize(weight: number, bodyLength?: number): RecommendedSize {
  let width = RECOMMEND_CONFIG.baseWidth + weight * RECOMMEND_CONFIG.weightFactor;
  let depth = RECOMMEND_CONFIG.baseDepth + weight * RECOMMEND_CONFIG.weightFactor * 0.7;
  let height = RECOMMEND_CONFIG.baseHeight + weight * RECOMMEND_CONFIG.weightFactor * 0.5;

  if (bodyLength && bodyLength > 0) {
    width = Math.max(width, bodyLength * RECOMMEND_CONFIG.lengthFactor + 100);
    depth = Math.max(depth, bodyLength * 0.8 + 80);
  }

  width = Math.round(width / 5) * 5;
  depth = Math.round(depth / 5) * 5;
  height = Math.round(height / 5) * 5;

  width = Math.max(SIZE_LIMITS.MIN_WIDTH, Math.min(SIZE_LIMITS.MAX_WIDTH, width));
  depth = Math.max(SIZE_LIMITS.MIN_DEPTH, Math.min(SIZE_LIMITS.MAX_DEPTH, depth));
  height = Math.max(SIZE_LIMITS.MIN_HEIGHT, Math.min(SIZE_LIMITS.MAX_HEIGHT, height));

  return { width, depth, height };
}
