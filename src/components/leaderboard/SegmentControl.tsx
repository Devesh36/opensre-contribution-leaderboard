"use client";

import Link, { useLinkStatus } from "next/link";
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

function SegmentLinkPending() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`segment-link-spinner${pending ? " segment-link-spinner-active" : ""}`}
      aria-hidden="true"
    />
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
      className={
        isActive
          ? "segment-link segment-link-active segment-link-pending-host"
          : "segment-link segment-link-pending-host"
      }
    >
      {children}
      <SegmentLinkPending />
    </Link>
  );
}

export function SegmentCount({ children }: { children: ReactNode }) {
  return <span className="segment-count">{children}</span>;
}
