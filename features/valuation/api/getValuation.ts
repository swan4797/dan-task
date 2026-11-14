import { cacheLife } from "next/cache";

import { LOOKBACK_MONTHS, SUPPORTED_COUNTRIES } from "../constants";
import { buildComparables, estimateValue } from "../lib/estimate";
import type { PropertyType, Valuation } from "../types";
import { getHousePriceIndex } from "./getHousePriceIndex";
import { getNearbyPostcodes } from "./getNearbyPostcodes";
import { getPostcode } from "./getPostcode";
import { getSales } from "./getSales";

export type ValuationResult =
  | { status: "ok"; valuation: Valuation }
  | { status: "postcode-not-found" }
  | { status: "unsupported-country"; country: string };

export async function getValuation(
  postcode: string,
  propertyType: PropertyType,
): Promise<ValuationResult> {
  "use cache";
  cacheLife("days");

  const location = await getPostcode(postcode);

  if (!location) {
    return { status: "postcode-not-found" };
  }

  if (!SUPPORTED_COUNTRIES.includes(location.country)) {
    return { status: "unsupported-country", country: location.country };
  }

  const now = new Date();
  const since = new Date(now);
  since.setMonth(since.getMonth() - LOOKBACK_MONTHS);
  const sinceDate = since.toISOString().slice(0, 10);

  const nearby = await getNearbyPostcodes(
    location.latitude,
    location.longitude,
  );

  const [sales, index] = await Promise.all([
    getSales(
      nearby.map((p) => p.postcode),
      propertyType,
      sinceDate,
    ),
    getHousePriceIndex(
      location.adminDistrictCode,
      location.country,
      propertyType,
      sinceDate.slice(0, 7),
    ),
  ]);

  if (!index) {
    throw new Error("No house price index available to adjust prices");
  }

  const comparables = buildComparables(sales, nearby, index, now);

  return {
    status: "ok",
    valuation: {
      postcode: location.postcode,
      propertyType,
      searchRadiusMetres: Math.round(
        Math.max(0, ...nearby.map((p) => p.distanceMetres)),
      ),
      indexRegion: index.region,
      indexMonth: index.latestMonth,
      estimate: estimateValue(comparables),
      comparables,
    },
  };
}
