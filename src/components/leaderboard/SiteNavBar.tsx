import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type SiteNavBarProps = {
  homeHref?: string;
  children?: ReactNode;
};

export function SiteNavBar({ homeHref = "/", children }: SiteNavBarProps) {
  return (
    <div className="doc-nav-bar anim-slide-down sticky top-0 z-20 border-b border-[#262626] bg-[rgba(6,6,6,0.92)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link href={homeHref} className="site-brand-link shrink-0">
          <Image
            src="/opensre-logo-white.svg"
            alt="OpenSRE"
            width={120}
            height={24}
            priority
            className="h-[22px] w-auto sm:h-6"
          />
        </Link>
        {children ? (
          <nav className="doc-nav-actions flex min-w-0 items-center gap-2 text-sm">
            {children}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
