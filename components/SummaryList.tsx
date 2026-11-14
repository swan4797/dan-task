import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface SummaryListProps extends HTMLAttributes<HTMLDListElement> {
  noBorder?: boolean;
}

function SummaryListRoot({
  className,
  noBorder,
  children,
  ...rest
}: SummaryListProps) {
  return (
    <dl
      className={cx(
        "summary-list",
        noBorder && "summary-list--no-border",
        className,
      )}
      {...rest}>
      {children}
    </dl>
  );
}

function Row({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("summary-list__row", className)} {...rest}>
      {children}
    </div>
  );
}

function Key({ className, children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <dt className={cx("summary-list__key", className)} {...rest}>
      {children}
    </dt>
  );
}

function Value({ className, children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <dd className={cx("summary-list__value", className)} {...rest}>
      {children}
    </dd>
  );
}

function Actions({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement>) {
  return (
    <dd className={cx("summary-list__actions", className)} {...rest}>
      {children}
    </dd>
  );
}

export const SummaryList = Object.assign(SummaryListRoot, {
  Row,
  Key,
  Value,
  Actions,
});
