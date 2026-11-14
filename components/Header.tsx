import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11 12 3.5 21 11v9.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          </span>
          Instant Valuation
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href="/valuation">Value a property</Link>
        </nav>
      </div>
    </header>
  );
}
