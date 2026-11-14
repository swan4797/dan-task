import { PROPERTY_TYPES } from "./constants";
import type { PropertyType } from "./types";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return currency.format(value);
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMonth(month: string): string {
  return new Date(`${month}-01`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDistance(metres: number): string {
  return metres < 1000
    ? `${Math.round(metres / 10) * 10}m`
    : `${(metres / 1000).toFixed(1)}km`;
}

export function propertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function propertyTypeNoun(type: PropertyType): string {
  return PROPERTY_TYPES.find((t) => t.value === type)?.noun ?? type;
}
