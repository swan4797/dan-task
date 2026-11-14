import Link from "next/link";

import { SummaryList } from "@/components/SummaryList";
import Tag from "@/components/Tag";
import { getValuation } from "@/features/valuation/api/getValuation";
import { ComparablesTable } from "@/features/valuation/components/ComparablesTable";
import {
  AGE_HALF_WEIGHT_MONTHS,
  CONFIDENCE_THRESHOLDS,
  DISTANCE_HALF_WEIGHT_METRES,
  LOOKBACK_MONTHS,
  MIN_COMPARABLES,
} from "@/features/valuation/constants";
import {
  formatDistance,
  formatMonth,
  formatPrice,
  propertyTypeLabel,
  propertyTypeNoun,
} from "@/features/valuation/format";
import type { ValuationInput } from "@/features/valuation/lib/validation";
import type { Confidence, Estimate } from "@/features/valuation/types";

const CONFIDENCE: Record<Confidence, { label: string; description: string }> = {
  high: {
    label: "High confidence",
    description: `Based on ${CONFIDENCE_THRESHOLDS.high} or more similar sales nearby.`,
  },
  medium: {
    label: "Medium confidence",
    description: `Based on ${CONFIDENCE_THRESHOLDS.medium} to ${CONFIDENCE_THRESHOLDS.high - 1} similar sales nearby.`,
  },
  low: {
    label: "Low confidence",
    description: `Based on fewer than ${CONFIDENCE_THRESHOLDS.medium} similar sales nearby, so treat this as a rough guide.`,
  },
};

function formHref({ postcode, propertyType }: ValuationInput) {
  return `/valuation?${new URLSearchParams({ edit: "1", postcode, type: propertyType })}`;
}

function RangeBar({ estimate }: { estimate: Estimate }) {
  const position =
    ((estimate.value - estimate.low) / (estimate.high - estimate.low)) * 100;

  return (
    <div className="range">
      <div className="range__track" aria-hidden="true">
        <span className="range__marker" style={{ left: `${position}%` }} />
      </div>
      <div className="range__labels">
        <span>
          <small>Low</small>
          {formatPrice(estimate.low)}
        </span>
        <span>
          <small>High</small>
          {formatPrice(estimate.high)}
        </span>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 11v6M12 7.5v.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

interface ValuationResultProps {
  input: ValuationInput;
  requestedPage: number;
}

export async function ValuationResult({
  input,
  requestedPage,
}: ValuationResultProps) {
  const result = await getValuation(input.postcode, input.propertyType);

  if (result.status !== "ok") {
    return (
      <div className="narrow">
        <h1>
          {result.status === "postcode-not-found"
            ? "We couldn't find that postcode"
            : "We can't value properties in this area yet"}
        </h1>
        <p className="lead">
          {result.status === "postcode-not-found"
            ? `${input.postcode} is not a current postcode. Check it is correct and try again.`
            : `Sold price data is only available for England and Wales, and ${input.postcode} is in ${result.country}.`}
        </p>
        <Link href={formHref(input)} className="button">
          Try a different postcode
        </Link>
      </div>
    );
  }

  const { valuation } = result;
  const { estimate, comparables } = valuation;
  const typeLabel = propertyTypeLabel(valuation.propertyType).toLowerCase();
  const typeNoun = propertyTypeNoun(valuation.propertyType);
  const salesText = `${comparables.length} ${typeLabel} ${comparables.length === 1 ? "sale" : "sales"}`;

  const hrefForPage = (page: number) => {
    const params = new URLSearchParams({
      postcode: valuation.postcode,
      type: valuation.propertyType,
    });
    if (page > 1) params.set("page", String(page));
    return `/valuation?${params}#comparables`;
  };

  return (
    <>
      <Link href={formHref(input)} className="back-link">
        ← Change property details
      </Link>

      <div className="result-grid">
        <section className="card estimate" aria-labelledby="estimate-heading">
          {estimate ? (
            <>
              <div>
                <p className="estimate__label" id="estimate-heading">
                  Estimated value of a {typeNoun} in {valuation.postcode}
                </p>
                <h1 className="estimate__value">
                  {formatPrice(estimate.value)}
                </h1>
              </div>

              <RangeBar estimate={estimate} />

              <div>
                <Tag tone={estimate.confidence}>
                  {CONFIDENCE[estimate.confidence].label}
                </Tag>
                <p className="small muted" style={{ margin: "0.5rem 0 0" }}>
                  {CONFIDENCE[estimate.confidence].description}
                </p>
              </div>
            </>
          ) : (
            <div>
              <h1 id="estimate-heading">We couldn&apos;t estimate a value</h1>
              <p>
                We found{" "}
                {comparables.length === 0 ? "no" : `only ${comparables.length}`}{" "}
                {typeLabel} {comparables.length === 1 ? "sale" : "sales"} near{" "}
                {valuation.postcode} in the last {LOOKBACK_MONTHS / 12} years.
                We need at least {MIN_COMPARABLES} to give an estimate.
              </p>
              <Link href={formHref(input)} className="button">
                Try a different property type
              </Link>
            </div>
          )}

          <div className="notice">
            <InfoIcon />
            <span>
              This is an automated estimate, not a formal valuation. It
              doesn&apos;t know the size, condition or features of the property.
            </span>
          </div>
        </section>

        <section className="card" aria-labelledby="method-heading">
          <h2 id="method-heading">How we worked this out</h2>
          <SummaryList>
            <SummaryList.Row>
              <SummaryList.Key>Property</SummaryList.Key>
              <SummaryList.Value>
                {propertyTypeLabel(valuation.propertyType)} in{" "}
                {valuation.postcode}
              </SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>Similar sales</SummaryList.Key>
              <SummaryList.Value>
                {salesText} within{" "}
                {formatDistance(valuation.searchRadiusMetres)} in the last{" "}
                {LOOKBACK_MONTHS / 12} years
              </SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>Prices adjusted</SummaryList.Key>
              <SummaryList.Value>
                House Price Index for {valuation.indexRegion}, to{" "}
                {formatMonth(valuation.indexMonth)}
              </SummaryList.Value>
            </SummaryList.Row>
          </SummaryList>

          <details className="details">
            <summary>More about the method</summary>
            <div>
              <p>
                We look up sales of {typeLabel} properties in the 100 postcodes
                closest to yours from Land Registry Price Paid Data, and adjust
                each price to today&apos;s market using the House Price Index
                for the local area.
              </p>
              <p style={{ marginBottom: 0 }}>
                The estimate is a weighted median of those prices. A sale{" "}
                {DISTANCE_HALF_WEIGHT_METRES}m away, or {AGE_HALF_WEIGHT_MONTHS}{" "}
                months old, counts half as much as one next door today. The
                range covers the middle half of the weighted prices, and is
                wider when there are fewer sales.
              </p>
            </div>
          </details>
        </section>
      </div>

      {comparables.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <ComparablesTable
            comparables={comparables}
            requestedPage={requestedPage}
            hrefForPage={hrefForPage}
          />
        </div>
      )}
    </>
  );
}
