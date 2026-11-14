import { PROPERTY_TYPES } from "../constants.ts";
import type { PropertyType } from "../types.ts";

const POSTCODE_PATTERN = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/;

export interface ValuationInput {
  postcode: string;
  propertyType: PropertyType;
}

export interface ValidationErrors {
  postcode?: string;
  propertyType?: string;
}

/** Uppercase and put a single space before the inward code, e.g. "sw1a1aa" → "SW1A 1AA". */
export function normalisePostcode(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return compact.length > 3
    ? `${compact.slice(0, -3)} ${compact.slice(-3)}`
    : compact;
}

export function isPostcode(value: string): boolean {
  return POSTCODE_PATTERN.test(value);
}

export function isPropertyType(value: string): value is PropertyType {
  return PROPERTY_TYPES.some((type) => type.value === value);
}

export function validateValuationInput(params: {
  postcode?: string;
  type?: string;
}):
  | { ok: true; input: ValuationInput }
  | { ok: false; errors: ValidationErrors } {
  const errors: ValidationErrors = {};
  const postcode = normalisePostcode(params.postcode ?? "");
  const type = params.type ?? "";

  if (!postcode) {
    errors.postcode = "Enter a postcode";
  } else if (!isPostcode(postcode)) {
    errors.postcode = "Enter a real postcode, like LS6 2AB";
  }

  if (!isPropertyType(type)) {
    errors.propertyType = "Select the type of property";
  }

  if (errors.postcode || errors.propertyType || !isPropertyType(type)) {
    return { ok: false, errors };
  }

  return { ok: true, input: { postcode, propertyType: type } };
}
