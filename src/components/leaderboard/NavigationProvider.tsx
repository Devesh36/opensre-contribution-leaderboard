"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationContextValue = {
  isPending: boolean;
  startNavigation: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function buildLocationKey(pathname: string, searchParams: URLSearchParams): string {
  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}

function NavigationIndicator({ isPending }: { isPending: boolean }) {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setShowOverlay(false);
      return;
    }

    const timer = window.setTimeout(() => setShowOverlay(true), 120);
    return () => window.clearTimeout(timer);
  }, [isPending]);

  useEffect(() => {
    document.body.classList.toggle("nav-is-pending", isPending);
    return () => document.body.classList.remove("nav-is-pending");
  }, [isPending]);

  return (
    <>
      <div
        className={`nav-progress-bar${isPending ? " nav-progress-bar-active" : ""}`}
        aria-hidden="true"
      />
      {showOverlay ? (
        <div className="nav-loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="nav-loading-card">
            <span className="nav-loading-spinner" aria-hidden="true" />
            <p className="nav-loading-label">Loading…</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const currentLocation = useMemo(
    () => buildLocationKey(pathname, searchParams),
    [pathname, searchParams],
  );

  const startNavigation = useCallback(() => {
    setIsPending(true);
  }, []);

  useEffect(() => {
    setIsPending(false);
  }, [currentLocation]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || !isInternalHref(href)) {
        return;
      }

      const nextLocation = href.startsWith("/")
        ? href
        : new URL(href, window.location.origin).pathname +
          new URL(href, window.location.origin).search;

      if (nextLocation !== currentLocation) {
        setIsPending(true);
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [currentLocation]);

  const value = useMemo(
    () => ({
      isPending,
      startNavigation,
    }),
    [isPending, startNavigation],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
      <NavigationIndicator isPending={isPending} />
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
