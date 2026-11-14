# Instant property valuation

A Next.js (App Router) application that estimates what a home in England or
Wales is worth from recent sold prices nearby. Styling is a small custom design
system in `styles/globals.scss` (Sass, CSS custom properties for tokens).

## How it works

1. **Input** – a postcode and property type (detached, semi-detached, terraced or flat).
2. **Processing**
   - Look up the postcode and its 100 nearest postcodes (within 2km) using [postcodes.io](https://postcodes.io).
   - Fetch standard sales of the same property type in those postcodes over the last 5 years from
     HM Land Registry Price Paid Data (SPARQL endpoint).
   - Adjust each sale to today's prices with the UK House Price Index
     for the local authority and property type (falling back to the national index).
   - Weight each sale so closer and more recent sales count more (half weight at 500m or 24 months)
     and take the weighted median.
3. **Output** – the estimate, a low–high range (weighted 25th–75th percentile, with a minimum
   spread that widens as confidence drops), a confidence rating based on the number of
   comparables (high ≥ 20, medium ≥ 8, low ≥ 3), and the paginated list of comparables.

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test      # unit tests for the estimation and validation logic
npm run lint
npm run build
```

## Structure

```
app/                       routes (start page, /valuation, error and not-found pages)
components/                shared UI components (Header, Footer, Table, SummaryList, Pagination, Tag…)
features/valuation/
  api/                     postcodes.io and Land Registry SPARQL calls (cached with "use cache")
  components/              ValuationForm, ValuationResult, ComparablesTable, PropertyTypeIcon
  lib/                     pure estimation and validation logic, with tests
  constants.ts, types.ts, format.ts
styles/                    design tokens and component styles
```

## Data attribution

Sold price data is used under the Open Government Licence, which requires the
attribution line in the site footer (`components/Footer.tsx`).
