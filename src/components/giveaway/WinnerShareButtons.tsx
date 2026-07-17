"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { GiveawayCycle, GiveawayWinner } from "@/lib/giveaway/content";
import {
  buildWinnerLinkedInShareUrl,
  buildWinnerXShareUrl,
  getGiveawaySiteOrigin,
  type WinnerSharePlace,
} from "@/lib/giveaway/share";

type WinnerShareButtonsProps = {
  winner: GiveawayWinner;
  placeLabel: WinnerSharePlace;
  cycle: GiveawayCycle;
};

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

function ShareIconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ShareIconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.062 2.062 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function WinnerShareButtons({
  winner,
  placeLabel,
  cycle,
}: WinnerShareButtonsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const resolveShareOrigin = () =>
    typeof window !== "undefined"
      ? window.location.origin
      : getGiveawaySiteOrigin();

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const shareOnX = () => {
    openShareWindow(
      buildWinnerXShareUrl({
        winner,
        placeLabel,
        cycle,
        origin: resolveShareOrigin(),
      }),
    );
    setMenuOpen(false);
  };

  const shareOnLinkedIn = () => {
    openShareWindow(
      buildWinnerLinkedInShareUrl({
        winner,
        placeLabel,
        cycle,
        origin: resolveShareOrigin(),
      }),
    );
    setMenuOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="giveaway-winner-share"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="giveaway-winner-share-button"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label="Share achievement"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <ShareIcon />
      </button>

      {menuOpen ? (
        <div id={menuId} className="giveaway-winner-share-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="giveaway-winner-share-menu-item"
            onClick={shareOnX}
          >
            <ShareIconX />
            <span>Share on X</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="giveaway-winner-share-menu-item"
            onClick={shareOnLinkedIn}
          >
            <ShareIconLinkedIn />
            <span>Share on LinkedIn</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
