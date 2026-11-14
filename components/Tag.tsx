import type { HTMLAttributes } from "react";

interface TagProps extends HTMLAttributes<HTMLElement> {
  tone: "high" | "medium" | "low";
}

export default function Tag({ tone, className, children, ...rest }: TagProps) {
  return (
    <strong
      className={["tag", `tag--${tone}`, className].filter(Boolean).join(" ")}
      {...rest}>
      {children}
    </strong>
  );
}
