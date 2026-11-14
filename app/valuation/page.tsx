import type { Metadata } from "next";

import { Suspense } from "react";

import { ValuationForm } from "@/features/valuation/components/ValuationForm";
import { ValuationResult } from "@/features/valuation/components/ValuationResult";
import { validateValuationInput } from "@/features/valuation/lib/validation";

export const metadata: Metadata = {
  title: "Get an instant valuation",
};

type SearchParams = Promise<{
  postcode?: string;
  type?: string;
  page?: string;
  edit?: string;
}>;

interface ValuationPageProps {
  searchParams: SearchParams;
}

async function ValuationContent({ searchParams }: ValuationPageProps) {
  const params = await searchParams;
  const submitted = params.postcode !== undefined || params.type !== undefined;

  if (!submitted || params.edit) {
    return (
      <ValuationForm postcode={params.postcode} propertyType={params.type} />
    );
  }

  const result = validateValuationInput(params);

  if (!result.ok) {
    return (
      <ValuationForm
        postcode={params.postcode}
        propertyType={params.type}
        errors={result.errors}
      />
    );
  }

  const { postcode, propertyType } = result.input;
  const requestedPage = Number.parseInt(params.page ?? "1", 10);

  return (
    <Suspense
      key={`${postcode}-${propertyType}`}
      fallback={
        <p className="loading" aria-live="polite">
          Finding recent sales near {postcode}…
        </p>
      }>
      <ValuationResult input={result.input} requestedPage={requestedPage} />
    </Suspense>
  );
}

export default function ValuationPage({ searchParams }: ValuationPageProps) {
  return (
    <Suspense
      fallback={
        <p className="loading" aria-live="polite">
          Loading…
        </p>
      }>
      <ValuationContent searchParams={searchParams} />
    </Suspense>
  );
}
