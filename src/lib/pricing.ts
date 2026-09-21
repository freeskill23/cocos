import { PRICING_CONFIG } from "@/config/pricing";
import { OPTION_PRICES, type OptionChoice } from "@/config/options";
import { DESIGNS, type DesignId } from "@/config/designs";
import { SIZE_LIMITS } from "@/config/sizes";

export interface HouseDimensions {
  width: number;
  depth: number;
  height: number;
}

export interface PriceBreakdown {
  baseFee: number;
  areaCost: number;
  scaleCost: number;
  designCost: number;
  optionCost: number;
  packagingFee: number;
  shippingFee: number;
  total: number;
}

export interface PriceInput {
  dimensions: HouseDimensions;
  designId: DesignId;
  options: OptionChoice;
}

function clampDimensions(d: HouseDimensions): HouseDimensions {
  return {
    width: Math.max(SIZE_LIMITS.MIN_WIDTH, Math.min(SIZE_LIMITS.MAX_WIDTH, d.width)),
    depth: Math.max(SIZE_LIMITS.MIN_DEPTH, Math.min(SIZE_LIMITS.MAX_DEPTH, d.depth)),
    height: Math.max(SIZE_LIMITS.MIN_HEIGHT, Math.min(SIZE_LIMITS.MAX_HEIGHT, d.height)),
  };
}

function calcOptionCost(options: OptionChoice): number {
  let sum = 0;
  sum += OPTION_PRICES.doorPosition[options.doorPosition];
  sum += OPTION_PRICES.doorSizeMode[options.doorSizeMode];
  sum += OPTION_PRICES.engraving[options.engraving];
  sum += OPTION_PRICES.floor[options.floor];
  sum += OPTION_PRICES.cushion[options.cushion];
  sum += OPTION_PRICES.top[options.top];
  return sum;
}

export function calcArea(d: HouseDimensions): number {
  return 2 * (d.width * d.height) + 2 * (d.depth * d.height) + d.width * d.depth;
}

export function calcScaleFactor(d: HouseDimensions): number {
  const { MIN_WIDTH, MIN_DEPTH, MIN_HEIGHT } = SIZE_LIMITS;
  const wRatio = d.width / MIN_WIDTH;
  const dRatio = d.depth / MIN_DEPTH;
  const hRatio = d.height / MIN_HEIGHT;
  const volume = wRatio * dRatio * hRatio;
  return Math.max(0, volume - 1);
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const d = clampDimensions(input.dimensions);
  const design = DESIGNS.find((x) => x.id === input.designId);
  const designCost = design?.extraPrice ?? 0;

  const baseFee = PRICING_CONFIG.BASE_FEE;
  const areaCost = Math.round(calcArea(d) * PRICING_CONFIG.AREA_RATE_PER_SQMM);
  const scaleCost = Math.round(calcScaleFactor(d) * PRICING_CONFIG.SIZE_SCALE_RATE * 1000) * 10;
  const optionCost = calcOptionCost(input.options);

  const packagingFee: number = PRICING_CONFIG.PACKAGING_FEE;
  let shippingFee: number = PRICING_CONFIG.SHIPPING_FEE;
  const subtotal = baseFee + areaCost + scaleCost + designCost + optionCost + packagingFee;
  if (subtotal >= PRICING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    shippingFee = 0;
  }

  const total = baseFee + areaCost + scaleCost + designCost + optionCost + packagingFee + shippingFee;

  return { baseFee, areaCost, scaleCost, designCost, optionCost, packagingFee, shippingFee, total };
}

export function formatWon(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
