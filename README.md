# Instant Valuation

Estimate what a home in England or Wales is worth from recent sold prices nearby.

Enter a postcode and a property type (detached, semi-detached, terraced or flat).
The app finds recent sales of similar homes around that postcode, adjusts them to
today's prices, and returns:

- an **estimated value** with a **low–high range**
- a **confidence rating** based on how many comparable sales were found
- the **list of comparable sales**, so you can see exactly where the number came from

Built with Next.js 16 (App Router), React 19 and TypeScript, with a small custom
design system in Sass. No database and no API keys are needed: all data comes from
free public services.

---

## Quick start

### Requirements

- **Node.js 22.18 or newer** (the app itself runs on Node 20.9+, but the test
  runner uses Node's built-in TypeScript support)
- npm (comes with Node.js)
- An internet connection: data is fetched live from postcodes.io and HM Land Registry

### Run it locally

```bash
git clone https://github.com/swan4797/dan-task.git
cd dan-task
cp .env.example .env.local   # optional: the defaults work without it
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Get my valuation**.
Try `LS6 2AB` with **Semi-detached**.

You can also go straight to a result by URL:
[http://localhost:3000/valuation?postcode=LS6+2AB&type=semi-detached](http://localhost:3000/valuation?postcode=LS6+2AB&type=semi-detached)

### Scripts

| Command         | What it does                                                    |
| --------------- | --------------------------------------------------------------- |
| `npm run dev`   | Start the development server with live reload on port 3000      |
| `npm run build` | Build an optimised production version                           |
| `npm start`     | Run the production build (run `npm run build` first)            |
| `npm test`      | Run the unit tests for the estimation and validation logic      |
| `npm run lint`  | Check the code with ESLint                                      |

To run the production build on a different port: `PORT=3100 npm start`.

### Configuration

Both settings are optional. Copy `.env.example` to `.env.local` to change them.

| Variable                   | Default                                                 | Purpose                         |
| -------------------------- | ------------------------------------------------------- | ------------------------------- |
| `POSTCODES_API_URL`        | `https://api.postcodes.io`                              | Postcode lookup service         |
| `LAND_REGISTRY_SPARQL_URL` | `https://landregistry.data.gov.uk/landregistry/query`   | Sold prices and price index     |

---

## How the valuation works

```
postcode + type
      │
      ▼
1. Locate     postcodes.io → latitude/longitude, country, local authority
2. Neighbours postcodes.io → the 100 nearest postcodes within 2 km
3. Sales      Land Registry Price Paid → standard sales of the same type
              in those postcodes over the last 5 years (up to 200, newest first)
4. Adjust     UK House Price Index for the local authority and property type
              → each sale inflated to today's prices
5. Weigh      closer and more recent sales count more
6. Estimate   weighted median, weighted 25th–75th percentile range, confidence
```

### 1–2. Finding the area

The postcode is tidied (`ls62ab` → `LS6 2AB`), checked against a UK postcode
pattern, and looked up on [postcodes.io](https://postcodes.io). Postcodes in
Scotland or Northern Ireland get a clear message, because Land Registry data only
covers England and Wales. The 100 nearest postcodes (capped at 2 km) define the
neighbourhood. In a city that is a few hundred metres; in the countryside it
reaches further.

### 3. Comparable sales

One SPARQL query to the Land Registry fetches sales in those postcodes that:

- are the **same property type**
- are **standard** (category A) transactions, which leaves out repossessions,
  buy-to-let bulk sales and similar non-market prices
- happened in the **last 60 months**

### 4. Adjusting to today's prices

A house sold for £200,000 three years ago is not worth £200,000 today. Each sale
is adjusted with the UK House Price Index:

```
today's price = price paid × index(latest month) ÷ index(month of sale)
```

The index is the one for the **local authority** and **property type** (flats
and detached houses move differently). If a council has no published index (for
example, after a boundary merger), the app falls back to the index for England
or Wales. Sales newer than the latest published index month are left as they are.

### 5. Weighting

Each sale gets a weight that halves every 500 m of distance and every 24 months
of age:

```
weight = 0.5^(distance ÷ 500 m) × 0.5^(age ÷ 24 months)
```

| Sale                         | Distance | Age       | Weight |
| ---------------------------- | -------- | --------- | ------ |
| Next door, this month        | 0 m      | 0 months  | 1.00   |
| 500 m away, this month       | 500 m    | 0 months  | 0.50   |
| Next door, two years ago     | 0 m      | 24 months | 0.50   |
| 500 m away, two years ago    | 500 m    | 24 months | 0.25   |

### 6. Estimate, range and confidence

- **Estimate**: the *weighted median* of the adjusted prices. A median ignores
  the odd mansion or bargain far better than an average would.
- **Range**: the weighted 25th to 75th percentile, widened to at least ±5% / ±10%
  / ±15% for high / medium / low confidence, so a small sample never looks
  falsely precise.
- **Confidence**: **high** with 20+ comparables, **medium** with 8–19, **low** with
  3–7. Fewer than 3 gives no estimate at all.
- Prices are rounded to the nearest £1,000 (£10,000 above £1m).

All of these numbers live in
[`features/valuation/constants.ts`](features/valuation/constants.ts) and can be
tuned in one place.

---

## Project structure

```
app/                              Routes (Next.js App Router: folder = URL)
  layout.tsx                      Page frame: font, header, footer, metadata
  page.tsx                        Home page ( / )
  valuation/page.tsx              Form, validation errors and results ( /valuation )
  valuation/loading.tsx           Loading state while the route prepares
  error.tsx                       "Something went wrong" page for runtime errors
  not-found.tsx                   404 page
  icon.svg                        Browser tab icon

components/                       Reusable UI building blocks
  Header.tsx, Footer.tsx          Site header and footer (data attribution in footer)
  ErrorSummary.tsx                "There is a problem" box linking to each bad field
  Table.tsx, SummaryList.tsx      Table and label/value list primitives
  Pagination.tsx                  Page links with ellipses (1 … 4 5 6 … 10)
  Tag.tsx                         Coloured confidence pill

features/valuation/               Everything specific to valuations
  api/                            Code that talks to other services
    sparql.ts                     Sends a SPARQL query to the Land Registry, returns flat rows
    getPostcode.ts                Postcode → location, country, local authority
    getNearbyPostcodes.ts         Location → nearest 100 postcodes with distances
    getSales.ts                   Price Paid sales for those postcodes and type
    getHousePriceIndex.ts         House Price Index for the area (with national fallback)
    getValuation.ts               Orchestrates the steps above and returns the result
  lib/                            Pure logic, no network access
    estimate.ts                   Price adjustment, weights, weighted percentiles, confidence
    validation.ts                 Postcode tidying and form validation
    *.test.ts                     Unit tests
  components/                     Valuation screens
    ValuationForm.tsx             Postcode input and property-type cards
    ValuationResult.tsx           Estimate card, range bar, method summary
    ComparablesTable.tsx          Paginated table of the sales used
    PropertyTypeIcon.tsx          Line drawings for the four property types
  constants.ts                    All tunable numbers and lookup tables
  types.ts                        TypeScript shapes for the data
  format.ts                       Price, date and distance formatting

styles/globals.scss               Design tokens (colours, radii, shadows) and all component styles
```

### Request flow

1. The form submits with `GET`, so answers land in the URL
   (`/valuation?postcode=LS6+2AB&type=flat`). This works without JavaScript, and
   results can be bookmarked or shared.
2. `app/valuation/page.tsx` reads the search parameters and either shows the empty
   form, shows the form with errors (`lib/validation.ts`), or renders
   `ValuationResult` inside a React `<Suspense>` boundary with a loading message.
3. `ValuationResult` awaits `getValuation`, which calls the `api/` functions (sales
   and price index in parallel) and then `lib/estimate.ts`.
4. The result is rendered on the server and streamed to the browser.

### Caching

The project uses Next.js Cache Components (`cacheComponents: true`). The data
functions use the `"use cache"` directive, so repeat lookups are served from
memory: postcode lookups are cached for weeks, and sales, index and valuation
results for days.

### Security

User input is never placed in a query as typed. Postcodes are normalised and must
match a strict UK postcode pattern before they are inserted into a SPARQL query.
Dates and local-authority codes are checked against fixed formats too. This
prevents query injection.

---

## Testing

```bash
npm test
```

The tests use Node's built-in test runner (`node:test`), so there's no extra test
framework. They cover the pure logic in `features/valuation/lib/`:

- weighted percentile and median behaviour, including edge cases
- House Price Index adjustment, including missing and future months
- distance and age weighting, confidence levels
- a far-away outlier being outweighed by close sales
- postcode normalisation and form validation messages

The `api/` modules call live services, so they're not covered by unit tests.

---

## Limitations

- **England and Wales only**: that's the coverage of the Land Registry data.
- **No property details**: the estimate knows the type and location, not the
  size, condition, garden or number of bedrooms. It is a guide, not a formal
  valuation.
- **Postcode-level distance**: distances are between postcode centres, not
  individual houses.
- **Up to 200 comparables**: in busy areas only the 200 most recent sales are used.
- **Live data**: if postcodes.io or the Land Registry is unavailable, the app shows
  an error page with a retry button.

## Data sources and licence

- Sold prices and House Price Index: HM Land Registry, used under the
  [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
  The licence requires the attribution shown in the site footer
  (`components/Footer.tsx`).
- Postcode locations: [postcodes.io](https://postcodes.io), built on Office for
  National Statistics and Ordnance Survey open data.
