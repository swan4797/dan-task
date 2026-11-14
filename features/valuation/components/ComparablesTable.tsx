import Pagination from "@/components/Pagination";
import { Table } from "@/components/Table";
import { COMPARABLES_PAGE_SIZE } from "@/features/valuation/constants";
import {
  formatDate,
  formatDistance,
  formatPrice,
} from "@/features/valuation/format";
import type { Comparable } from "@/features/valuation/types";

interface ComparablesTableProps {
  comparables: Comparable[];
  requestedPage: number;
  hrefForPage: (page: number) => string;
}

export function ComparablesTable({
  comparables,
  requestedPage,
  hrefForPage,
}: ComparablesTableProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(comparables.length / COMPARABLES_PAGE_SIZE),
  );
  const page = Math.min(Math.max(1, requestedPage || 1), totalPages);
  const start = (page - 1) * COMPARABLES_PAGE_SIZE;
  const rows = comparables.slice(start, start + COMPARABLES_PAGE_SIZE);
  const totalWeight = comparables.reduce((sum, c) => sum + c.weight, 0);
  const maxShare = comparables[0].weight / totalWeight;

  return (
    <section className="card" id="comparables">
      <div className="table-wrap">
        <Table>
          <Table.Caption>
            <strong>Sales used in this estimate</strong>
            <span>
              Most influential first. Older prices are adjusted to today using
              the House Price Index.
            </span>
          </Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.Header>Address</Table.Header>
              <Table.Header>Sold</Table.Header>
              <Table.Header numeric>Price paid</Table.Header>
              <Table.Header numeric>Today&apos;s price</Table.Header>
              <Table.Header numeric>Distance</Table.Header>
              <Table.Header numeric>Influence</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rows.map((c) => {
              const share = c.weight / totalWeight;

              return (
                <Table.Row key={c.id}>
                  <Table.Cell>{c.address}</Table.Cell>
                  <Table.Cell>{formatDate(c.date)}</Table.Cell>
                  <Table.Cell numeric>{formatPrice(c.price)}</Table.Cell>
                  <Table.Cell numeric>
                    {formatPrice(Math.round(c.adjustedPrice / 100) * 100)}
                  </Table.Cell>
                  <Table.Cell numeric>
                    {formatDistance(c.distanceMetres)}
                  </Table.Cell>
                  <Table.Cell numeric>
                    <span className="influence">
                      <span className="influence__bar" aria-hidden="true">
                        <span
                          style={{ width: `${(share / maxShare) * 100}%` }}
                        />
                      </span>
                      {(share * 100).toFixed(1)}%
                    </span>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>

      <p className="small muted" style={{ marginTop: "1rem" }}>
        Showing {start + 1} to {start + rows.length} of {comparables.length}{" "}
        sales
      </p>

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={hrefForPage}
      />
    </section>
  );
}
