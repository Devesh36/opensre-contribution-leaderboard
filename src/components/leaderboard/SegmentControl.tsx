import Link from "next/link";
import type { ReactNode } from "react";

type SegmentControlProps = {
  "aria-label": string;
  children: ReactNode;
  fullWidth?: boolean;
};

export function SegmentControl({
  "aria-label": ariaLabel,
  children,
  fullWidth = false,
}: SegmentControlProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={fullWidth ? "segment-control segment-control-full" : "segment-control"}
    >
      {children}
    </div>
  );
}

type SegmentLinkProps = {
  href: string;
  isActive: boolean;
  children: ReactNode;
};

export function SegmentLink({ href, isActive, children }: SegmentLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={isActive ? "segment-link segment-link-active" : "segment-link"}
    >
      {children}
    </Link>
  );
}

export function SegmentCount({ children }: { children: ReactNode }) {
  return <span className="segment-count">{children}</span>;
}
