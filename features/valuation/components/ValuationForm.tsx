import ErrorSummary from "@/components/ErrorSummary";
import { PropertyTypeIcon } from "@/features/valuation/components/PropertyTypeIcon";
import { PROPERTY_TYPES } from "@/features/valuation/constants";
import type { ValidationErrors } from "@/features/valuation/lib/validation";

interface ValuationFormProps {
  postcode?: string;
  propertyType?: string;
  errors?: ValidationErrors;
}

export function ValuationForm({
  postcode = "",
  propertyType = "",
  errors = {},
}: ValuationFormProps) {
  const summary = [
    errors.postcode && { href: "#postcode", text: errors.postcode },
    errors.propertyType && {
      href: `#type-${PROPERTY_TYPES[0].value}`,
      text: errors.propertyType,
    },
  ].filter((e): e is { href: string; text: string } => Boolean(e));

  return (
    <div className="narrow">
      <ErrorSummary errors={summary} />

      <h1>Value a property</h1>
      <p className="lead">
        Two quick questions and we&apos;ll estimate what it&apos;s worth from
        recent sales of similar homes nearby.
      </p>

      <form action="/valuation" method="get" noValidate className="card">
        <div className={errors.postcode ? "field field--error" : "field"}>
          <label className="field__label" htmlFor="postcode">
            Postcode
          </label>
          <div id="postcode-hint" className="field__hint">
            England and Wales only, for example LS6 2AB
          </div>
          {errors.postcode && (
            <p id="postcode-error" className="field__error">
              <span className="visually-hidden">Error:</span> {errors.postcode}
            </p>
          )}
          <input
            className={errors.postcode ? "input input--error" : "input"}
            id="postcode"
            name="postcode"
            type="text"
            autoComplete="postal-code"
            spellCheck={false}
            defaultValue={postcode}
            aria-invalid={errors.postcode ? true : undefined}
            aria-describedby={
              errors.postcode ? "postcode-hint postcode-error" : "postcode-hint"
            }
          />
        </div>

        <fieldset
          className={errors.propertyType ? "field field--error" : "field"}
          aria-describedby={errors.propertyType ? "type-error" : undefined}>
          <legend className="field__label">What type of property is it?</legend>
          {errors.propertyType && (
            <p id="type-error" className="field__error">
              <span className="visually-hidden">Error:</span>{" "}
              {errors.propertyType}
            </p>
          )}
          <div className="choice-grid">
            {PROPERTY_TYPES.map((type) => (
              <div className="choice" key={type.value}>
                <input
                  id={`type-${type.value}`}
                  name="type"
                  type="radio"
                  value={type.value}
                  defaultChecked={propertyType === type.value}
                />
                <label htmlFor={`type-${type.value}`}>
                  <PropertyTypeIcon type={type.value} />
                  {type.label}
                  {type.hint && (
                    <span className="choice__hint">{type.hint}</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="button button--large">
          Get valuation <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  );
}
