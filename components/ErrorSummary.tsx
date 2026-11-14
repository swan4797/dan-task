interface ErrorSummaryProps {
  errors: Array<{ href: string; text: string }>;
}

export default function ErrorSummary({ errors }: ErrorSummaryProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="error-summary" role="alert" tabIndex={-1} autoFocus>
      <h2>There is a problem</h2>
      <ul>
        {errors.map((error) => (
          <li key={error.href}>
            <a href={error.href}>{error.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
