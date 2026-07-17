"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AppNavLinks } from "@/components/leaderboard/AppNavLinks";

type SiteNavBarProps = {
  homeHref?: string;
  showLeaderboard?: boolean;
};

export function SiteNavBar({ homeHref = "/", showLeaderboard = false }: SiteNavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="doc-nav-bar anim-slide-down sticky top-0 z-20 border-b border-[#262626] bg-[rgba(6,6,6,0.92)] backdrop-blur-md">
      <div className="doc-nav-bar-inner mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-4">
        <Link href={homeHref} className="site-brand-link shrink-0">
          <Image
            src="/opensre-logo-white.svg"
            alt="OpenSRE"
            width={948}
            height={187}
            priority
            className="site-brand-logo"
          />
        </Link>

        <nav
          className="doc-nav-actions doc-nav-actions-desktop"
          aria-label="Site"
        >
          <AppNavLinks showLeaderboard={showLeaderboard} />
        </nav>

        <button
          type="button"
          className="doc-nav-menu-button doc-nav-menu-button-mobile"
          aria-expanded={menuOpen}
          aria-controls={panelId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className={`doc-nav-menu-icon${menuOpen ? " doc-nav-menu-icon-open" : ""}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="doc-nav-mobile-backdrop doc-nav-mobile-only"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id={panelId}
            className="doc-nav-mobile-panel doc-nav-mobile-only"
            aria-label="Site menu"
          >
            <div className="doc-nav-mobile-panel-inner">
              <AppNavLinks
                showLeaderboard={showLeaderboard}
                layout="stacked"
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
