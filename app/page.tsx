import Link from "next/link";

export default function StartPage() {
  return (
    <div className="hero">
      <div>
        <span className="eyebrow">Free · No sign-up · England &amp; Wales</span>
        <h1>What&apos;s your home worth today?</h1>
        <p className="lead">
          Get an instant estimate based on what similar properties nearby have
          actually sold for — with a likely range, a confidence rating and every
          sale we used, so you can see why.
        </p>
        <Link href="/valuation" className="button button--large">
          Get my valuation <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="card">
        <h2>How it works</h2>
        <ol className="steps">
          <li>
            <strong>Tell us the postcode and property type</strong>
            <span className="muted">
              Detached, semi-detached, terraced or flat.
            </span>
          </li>
          <li>
            <strong>We find recent sales nearby</strong>
            <span className="muted">
              Official sold prices for the same type of property, adjusted to
              today&apos;s market using the House Price Index.
            </span>
          </li>
          <li>
            <strong>You get an estimate you can check</strong>
            <span className="muted">
              Closer and more recent sales count more. We show you all of them.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
