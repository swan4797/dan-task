import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalisePostcode, validateValuationInput } from "./validation.ts";

describe("normalisePostcode", () => {
  it("uppercases and spaces the inward code", () => {
    assert.equal(normalisePostcode(" sw1a1aa "), "SW1A 1AA");
    assert.equal(normalisePostcode("m1  1ae"), "M1 1AE");
  });
});

describe("validateValuationInput", () => {
  it("accepts a valid postcode and property type", () => {
    assert.deepEqual(
      validateValuationInput({ postcode: "sw11 1ad", type: "flat" }),
      { ok: true, input: { postcode: "SW11 1AD", propertyType: "flat" } },
    );
  });

  it("reports missing fields", () => {
    assert.deepEqual(validateValuationInput({}), {
      ok: false,
      errors: {
        postcode: "Enter a postcode",
        propertyType: "Select the type of property",
      },
    });
  });

  it("rejects badly formed postcodes", () => {
    const result = validateValuationInput({ postcode: "hello", type: "flat" });
    assert.equal(result.ok, false);
  });
});
