import type { PropertyType } from "./types";

export const POSTCODES_API =
  process.env.POSTCODES_API_URL ?? "https://api.postcodes.io";

export const LAND_REGISTRY_SPARQL =
  process.env.LAND_REGISTRY_SPARQL_URL ??
  "https://landregistry.data.gov.uk/landregistry/query";

export const PROPERTY_TYPES: Array<{
  value: PropertyType;
  label: string;
  noun: string;
  hint?: string;
}> = [
  { value: "detached", label: "Detached", noun: "detached house" },
  {
    value: "semi-detached",
    label: "Semi-detached",
    noun: "semi-detached house",
  },
  {
    value: "terraced",
    label: "Terraced",
    noun: "terraced house",
    hint: "Including end of terrace",
  },
  { value: "flat", label: "Flat or maisonette", noun: "flat or maisonette" },
];

/** Price Paid property type URIs, under lrcommon:. */
export const LAND_REGISTRY_PROPERTY_TYPE: Record<PropertyType, string> = {
  detached: "detached",
  "semi-detached": "semi-detached",
  terraced: "terraced",
  flat: "flat-maisonette",
};

/** UK HPI per-type index predicates, under ukhpi:. */
export const HPI_PROPERTY_TYPE: Record<PropertyType, string> = {
  detached: "housePriceIndexDetached",
  "semi-detached": "housePriceIndexSemiDetached",
  terraced: "housePriceIndexTerraced",
  flat: "housePriceIndexFlatMaisonette",
};

/** Price Paid data only covers England and Wales. */
export const SUPPORTED_COUNTRIES = ["England", "Wales"];

/** Nearest postcodes to search, capped by postcodes.io at 100 within 2km. */
export const NEARBY_POSTCODE_LIMIT = 100;
export const SEARCH_RADIUS_METRES = 2000;

/** How far back to look for sales. */
export const LOOKBACK_MONTHS = 60;

/** Most recent matching sales to use as comparables. */
export const MAX_COMPARABLES = 200;

/** A sale this far away (or this many months old) counts half as much. */
export const DISTANCE_HALF_WEIGHT_METRES = 500;
export const AGE_HALF_WEIGHT_MONTHS = 24;

/** Minimum sales needed to give any estimate. */
export const MIN_COMPARABLES = 3;

export const CONFIDENCE_THRESHOLDS = { high: 20, medium: 8 };

/** Minimum half-width of the low–high range for each confidence level. */
export const MIN_RANGE_SPREAD = { high: 0.05, medium: 0.1, low: 0.15 };

export const COMPARABLES_PAGE_SIZE = 20;
