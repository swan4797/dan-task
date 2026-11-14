"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="narrow">
      <h1>Something went wrong</h1>
      <p className="lead">
        We could not get sold price data just now. Please try again in a moment.
      </p>
      <button type="button" className="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
