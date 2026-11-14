import { cacheLife } from "next/cache";

import {
  NEARBY_POSTCODE_LIMIT,
  POSTCODES_API,
  SEARCH_RADIUS_METRES,
} from "../constants";
import type { NearbyPostcode } from "../types";

/** The nearest postcodes to a point, closest first, including the point's own postcode. */
export async function getNearbyPostcodes(
  latitude: number,
  longitude: number,
): Promise<NearbyPostcode[]> {
  "use cache";
  cacheLife("weeks");

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    radius: String(SEARCH_RADIUS_METRES),
    limit: String(NEARBY_POSTCODE_LIMIT),
  });

  const res = await fetch(`${POSTCODES_API}/postcodes?${params}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Nearby postcode lookup failed with status ${res.status}`);
  }

  const data: {
    result: Array<{ postcode: string; distance: number }> | null;
  } = await res.json();

  return (data.result ?? []).map((p) => ({
    postcode: p.postcode,
    distanceMetres: p.distance,
  }));
}
