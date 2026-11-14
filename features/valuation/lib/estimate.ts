import {
  AGE_HALF_WEIGHT_MONTHS,
  CONFIDENCE_THRESHOLDS,
  DISTANCE_HALF_WEIGHT_METRES,
  MIN_COMPARABLES,
  MIN_RANGE_SPREAD,
} from "../constants.ts";
import type {
  Comparable,
  Confidence,
  Estimate,
  HousePriceIndex,
  NearbyPostcode,
  Sale,
} from "../types.ts";

const MS_PER_MONTH = (365.25 / 12) * 24 * 60 * 60 * 1000;

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function monthsBetween(from: string, to: Date): number {
  return Math.max(0, (to.getTime() - new Date(from).getTime()) / MS_PER_MONTH);
}

/**
 * Inflate a past sale price to today's prices using the house price index:
 * price × index(latest month) ÷ index(month of sale).
 */
export function adjustToToday(
  price: number,
  saleDate: string,
  index: HousePriceIndex,
): number {
  const latest = index.values[index.latestMonth];
  const months = Object.keys(index.values).sort();
  const saleMonth = monthKey(saleDate);

  // Sales newer than the latest published index month need no adjustment.
  if (!latest || saleMonth >= index.latestMonth || months.length === 0) {
    return price;
  }

  const atSale =
    index.values[saleMonth] ??
    index.values[months.find((m) => m >= saleMonth) ?? months[0]];

  return atSale ? (price * latest) / atSale : price;
}

/** Closer and more recent sales count more: each halves its weight at a set distance and age. */
export function weightFor(distanceMetres: number, ageMonths: number): number {
  return (
    0.5 ** (distanceMetres / DISTANCE_HALF_WEIGHT_METRES) *
    0.5 ** (ageMonths / AGE_HALF_WEIGHT_MONTHS)
  );
}

export function buildComparables(
  sales: Sale[],
  nearby: NearbyPostcode[],
  index: HousePriceIndex,
  now: Date,
): Comparable[] {
  const distances = new Map(
    nearby.map((p) => [p.postcode, p.distanceMetres] as const),
  );

  return sales
    .filter((sale) => distances.has(sale.postcode))
    .map((sale) => {
      const distanceMetres = distances.get(sale.postcode) ?? 0;
      const ageMonths = monthsBetween(sale.date, now);

      return {
        ...sale,
        distanceMetres,
        ageMonths,
        adjustedPrice: adjustToToday(sale.price, sale.date, index),
        weight: weightFor(distanceMetres, ageMonths),
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

/**
 * The value below which `fraction` of the total weight lies.
 * weightedPercentile(items, 0.5) is the weighted median.
 */
export function weightedPercentile(
  items: Array<{ value: number; weight: number }>,
  fraction: number,
): number {
  const sorted = items
    .filter((item) => item.weight > 0)
    .sort((a, b) => a.value - b.value);

  if (sorted.length === 0) {
    return Number.NaN;
  }

  const total = sorted.reduce((sum, item) => sum + item.weight, 0);
  const target = total * fraction;
  let cumulative = 0;

  for (const item of sorted) {
    cumulative += item.weight;
    if (cumulative >= target) {
      return item.value;
    }
  }

  return sorted[sorted.length - 1].value;
}

export function confidenceFor(count: number): Confidence {
  if (count >= CONFIDENCE_THRESHOLDS.high) return "high";
  if (count >= CONFIDENCE_THRESHOLDS.medium) return "medium";
  return "low";
}

function roundPrice(value: number): number {
  const step = value >= 1_000_000 ? 10_000 : 1_000;
  return Math.round(value / step) * step;
}

export function estimateValue(comparables: Comparable[]): Estimate | null {
  if (comparables.length < MIN_COMPARABLES) {
    return null;
  }

  const items = comparables.map((c) => ({
    value: c.adjustedPrice,
    weight: c.weight,
  }));
  const value = weightedPercentile(items, 0.5);
  const confidence = confidenceFor(comparables.length);
  const spread = MIN_RANGE_SPREAD[confidence];

  return {
    value: roundPrice(value),
    low: roundPrice(
      Math.min(weightedPercentile(items, 0.25), value * (1 - spread)),
    ),
    high: roundPrice(
      Math.max(weightedPercentile(items, 0.75), value * (1 + spread)),
    ),
    confidence,
  };
}
