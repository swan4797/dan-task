import type { PropertyType } from "@/features/valuation/types";

const PATHS: Record<PropertyType, string> = {
  detached: "M8 20 20 10l12 10v13H8z M17 33v-7h6v7",
  "semi-detached":
    "M3 21 12 13l8 7 8-7 9 8v12H3z M20 20v13 M9 33v-6h5v6 M26 33v-6h5v6",
  terraced:
    "M2 20 8 14l6 6 6-6 6 6 6-6 6 6v13H2z M14 20v13 M26 20v13 M6 33v-5h4v5 M18 33v-5h4v5 M30 33v-5h4v5",
  flat: "M10 6h20v27H10z M14 11h4v4h-4z M22 11h4v4h-4z M14 19h4v4h-4z M22 19h4v4h-4z M18 33v-5h4v5",
};

export function PropertyTypeIcon({ type }: { type: PropertyType }) {
  return (
    <svg
      width="40"
      height="36"
      viewBox="0 0 40 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d={PATHS[type]} />
    </svg>
  );
}
