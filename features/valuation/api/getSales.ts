import { cacheLife } from "next/cache";

import { LAND_REGISTRY_PROPERTY_TYPE, MAX_COMPARABLES } from "../constants";
import { isPostcode } from "../lib/validation";
import type { PropertyType, Sale } from "../types";
import { querySparql } from "./sparql";

function formatAddress(row: Record<string, string | undefined>): string {
  const firstLine = [row.saon, row.paon, row.street].filter(Boolean).join(" ");

  return [firstLine, row.town, row.postcode]
    .filter(Boolean)
    .map((part) => titleCase(part as string))
    .join(", ")
    .replace(/[a-z]{1,2}\d[a-z\d]? \d[a-z]{2}$/i, (pc) => pc.toUpperCase());
}

function titleCase(value: string): string {
  return value.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/**
 * Standard (category A) Price Paid sales of one property type in the given
 * postcodes since a date, most recent first.
 */
export async function getSales(
  postcodes: string[],
  propertyType: PropertyType,
  since: string,
): Promise<Sale[]> {
  "use cache";
  cacheLife("days");

  // Postcodes are interpolated into the query, so only allow well-formed ones.
  const values = postcodes
    .filter(isPostcode)
    .map((pc) => `"${pc}"`)
    .join(" ");

  if (!values || !/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    return [];
  }

  const rows = await querySparql(`
    PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
    PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?tx ?postcode ?paon ?saon ?street ?town ?amount ?date WHERE {
      VALUES ?postcode { ${values} }
      ?addr lrcommon:postcode ?postcode .
      ?tx lrppi:propertyAddress ?addr ;
          lrppi:propertyType lrcommon:${LAND_REGISTRY_PROPERTY_TYPE[propertyType]} ;
          lrppi:transactionCategory lrppi:standardPricePaidTransaction ;
          lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date .
      OPTIONAL { ?addr lrcommon:paon ?paon }
      OPTIONAL { ?addr lrcommon:saon ?saon }
      OPTIONAL { ?addr lrcommon:street ?street }
      OPTIONAL { ?addr lrcommon:town ?town }
      FILTER(?date >= "${since}"^^xsd:date)
    }
    ORDER BY DESC(?date)
    LIMIT ${MAX_COMPARABLES}
  `);

  return rows.flatMap((row) => {
    const price = Number(row.amount);

    if (!row.tx || !row.postcode || !row.date || !Number.isFinite(price)) {
      return [];
    }

    return [
      {
        id: row.tx,
        postcode: row.postcode,
        address: formatAddress(row),
        price,
        date: row.date,
      },
    ];
  });
}
