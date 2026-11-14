import Link from "next/link";

export default function NotFound() {
  return (
    <div className="narrow">
      <h1>Page not found</h1>
      <p className="lead">If you typed the web address, check it is correct.</p>
      <p>
        <Link href="/valuation">Value a property</Link>
      </p>
    </div>
  );
}
