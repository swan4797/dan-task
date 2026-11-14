import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}

function pageNumbers(page: number, totalPages: number): Array<number | "…"> {
  const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "…"> = [];
  let previous = 0;

  for (const p of pages) {
    if (p - previous > 1) {
      result.push("…");
    }
    result.push(p);
    previous = p;
  }

  return result;
}

export default function Pagination({
  page,
  totalPages,
  hrefForPage,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 && (
        <Link href={hrefForPage(page - 1)} rel="prev">
          ← Previous<span className="visually-hidden"> page</span>
        </Link>
      )}

      <ul>
        {pageNumbers(page, totalPages).map((item, index) =>
          item === "…" ? (
            <li key={`ellipsis-${index}`} className="pagination__ellipsis">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefForPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}>
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < totalPages && (
        <Link href={hrefForPage(page + 1)} rel="next">
          Next<span className="visually-hidden"> page</span> →
        </Link>
      )}
    </nav>
  );
}
