import { cacheLife } from "next/cache";

import { HPI_PROPERTY_TYPE } from "../constants";
import type { HousePriceIndex, PropertyType } from "../types";
import { querySparql } from "./sparql";

const STATISTICAL_GEOGRAPHY =
  "http://statistics.data.gov.uk/id/statistical-geography/";
const REGION = "http://landregistry.data.gov.uk/id/region/";

async function queryIndex(
  regionPattern: string,
  propertyType: PropertyType,
  sinceMonth: string,
): Promise<HousePriceIndex | null> {
  const rows = await querySparql(`
    PREFIX ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?label ?month ?all ?typed WHERE {
      ${regionPattern}
      ?region rdfs:label ?label .
      FILTER(lang(?label) = "" || langMatches(lang(?label), "en"))
      ?obs ukhpi:refRegion ?region ;
           ukhpi:refMonth ?month ;
           ukhpi:housePriceIndex ?all .
      OPTIONAL { ?obs ukhpi:${HPI_PROPERTY_TYPE[propertyType]} ?typed }
      FILTER(?month >= "${sinceMonth}"^^xsd:gYearMonth)
    }
  `);

  if (rows.length === 0) {
    return null;
  }

  // Prefer the index for this property type, if the region publishes one for every month.
  const useTyped = rows.every((row) => row.typed);
  const values: Record<string, number> = {};

  for (const row of rows) {
    const value = Number(useTyped ? row.typed : row.all);
    if (row.month && Number.isFinite(value)) {
      values[row.month] = value;
    }
  }

  const months = Object.keys(values).sort();

  return {
    region: rows[0].label ?? "Unknown",
    latestMonth: months[months.length - 1],
    values,
  };
}

/**
 * House Price Index for the local authority, falling back to the whole
 * country when the authority has no published index (for example after a
 * boundary change).
 */
export async function getHousePriceIndex(
  localAuthorityCode: string | null,
  country: string,
  propertyType: PropertyType,
  sinceMonth: string,
): Promise<HousePriceIndex | null> {
  "use cache";
  cacheLife("days");

  if (localAuthorityCode && /^[EW]\d{8}$/.test(localAuthorityCode)) {
    const local = await queryIndex(
      `?region owl:sameAs <${STATISTICAL_GEOGRAPHY}${localAuthorityCode}> .`,
      propertyType,
      sinceMonth,
    );
    if (local) {
      return local;
    }
  }

  const countrySlug = country === "Wales" ? "wales" : "england";

  return queryIndex(
    `BIND(<${REGION}${countrySlug}> AS ?region)`,
    propertyType,
    sinceMonth,
  );
}
