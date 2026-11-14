import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function TableRoot({
  className,
  children,
  ...rest
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cx("table", className)} {...rest}>
      {children}
    </table>
  );
}

interface CaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  visuallyHidden?: boolean;
  size?: "s" | "m" | "l" | "xl";
}

function Caption({
  className,
  visuallyHidden,
  size,
  children,
  ...rest
}: CaptionProps) {
  return (
    <caption
      className={cx(
        "table__caption",
        size && `table__caption--${size}`,
        visuallyHidden && "visually-hidden",
        className,
      )}
      {...rest}>
      {children}
    </caption>
  );
}

function Head({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cx("table__head", className)} {...rest}>
      {children}
    </thead>
  );
}

function Body({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cx("table__body", className)} {...rest}>
      {children}
    </tbody>
  );
}

function Row({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cx("table__row", className)} {...rest}>
      {children}
    </tr>
  );
}

interface HeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

function Header({
  className,
  numeric,
  scope = "col",
  children,
  ...rest
}: HeaderProps) {
  return (
    <th
      scope={scope}
      className={cx(
        "table__header",
        numeric && "table__header--numeric",
        className,
      )}
      {...rest}>
      {children}
    </th>
  );
}

interface CellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

function Cell({ className, numeric, children, ...rest }: CellProps) {
  return (
    <td
      className={cx(
        "table__cell",
        numeric && "table__cell--numeric",
        className,
      )}
      {...rest}>
      {children}
    </td>
  );
}

export const Table = Object.assign(TableRoot, {
  Caption,
  Head,
  Body,
  Row,
  Header,
  Cell,
});
