import { cacheLife } from "next/cache";

import { POSTCODES_API } from "../constants";
import type { PostcodeLocation } from "../types";

interface PostcodeResult {
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  country: string;
  admin_district: string | null;
  codes?: { admin_district?: string };
}

export async function getPostcode(
  postcode: string,
): Promise<PostcodeLocation | null> {
  "use cache";
  cacheLife("weeks");

  const res = await fetch(
    `${POSTCODES_API}/postcodes/${encodeURIComponent(postcode)}`,
    { signal: AbortSignal.timeout(10_000) },
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Postcode lookup failed with status ${res.status}`);
  }

  const { result }: { result: PostcodeResult } = await res.json();

  if (result.latitude === null || result.longitude === null) {
    return null;
  }

  return {
    postcode: result.postcode,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    adminDistrict: result.admin_district,
    adminDistrictCode: result.codes?.admin_district ?? null,
  };
}
