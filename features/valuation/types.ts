export type PropertyType = "detached" | "semi-detached" | "terraced" | "flat";

export type Confidence = "high" | "medium" | "low";

export interface PostcodeLocation {
  postcode: string;
  latitude: number;
  longitude: number;
  country: string;
  adminDistrict: string | null;
  adminDistrictCode: string | null;
}

export interface NearbyPostcode {
  postcode: string;
  distanceMetres: number;
}

export interface Sale {
  id: string;
  postcode: string;
  address: string;
  price: number;
  date: string;
}

/** Index values keyed by month, "YYYY-MM". */
export interface HousePriceIndex {
  region: string;
  latestMonth: string;
  values: Record<string, number>;
}

export interface Comparable extends Sale {
  distanceMetres: number;
  ageMonths: number;
  adjustedPrice: number;
  weight: number;
}

export interface Estimate {
  value: number;
  low: number;
  high: number;
  confidence: Confidence;
}

export interface Valuation {
  postcode: string;
  propertyType: PropertyType;
  searchRadiusMetres: number;
  indexRegion: string;
  indexMonth: string;
  estimate: Estimate | null;
  comparables: Comparable[];
}
