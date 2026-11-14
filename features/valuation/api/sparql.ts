import { LAND_REGISTRY_SPARQL } from "../constants";

interface SparqlBinding {
  [variable: string]: { type: string; value: string } | undefined;
}

export type SparqlRow = Record<string, string | undefined>;

export async function querySparql(query: string): Promise<SparqlRow[]> {
  const res = await fetch(LAND_REGISTRY_SPARQL, {
    method: "POST",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ query }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Land Registry query failed with status ${res.status}`);
  }

  const data: { results: { bindings: SparqlBinding[] } } = await res.json();

  return data.results.bindings.map((binding) =>
    Object.fromEntries(
      Object.entries(binding).map(([key, cell]) => [key, cell?.value]),
    ),
  );
}
