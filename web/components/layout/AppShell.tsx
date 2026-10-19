"use client";

import { type ReactNode }  from "react";
import { Sidebar }         from "./Sidebar";
import { BottomNav }       from "./BottomNav";
import { MobileHeader }    from "./MobileHeader";
import { DesktopTopBar }   from "./DesktopTopBar";
import { cn }              from "@/lib/utils";

interface AppShellProps {
  children:      ReactNode;
  /** Page title shown in mobile header + desktop top bar */
  pageTitle?:    string;
  pageSubtitle?: string;
  showBack?:     boolean;
  /** Extra buttons shown in top-right (desktop) or header-right (mobile) */
  headerActions?: ReactNode;
  className?:    string;
  /** Hide the desktop top bar (e.g. home page has its own greeting) */
  hideTopBar?:   boolean;
}

/**
 * ONE navigation pattern per breakpoint:
 * - Mobile  (<md): MobileHeader (top) + BottomNav (bottom)
 * - Desktop (md+): fixed Sidebar (left) + DesktopTopBar inside content
 */
export function AppShell({
  children,
  pageTitle,
  pageSubtitle,
  showBack,
  headerActions,
  className,
  hideTopBar = false,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-offwhite">
      {/* ── Desktop sidebar (fixed, left) ── */}
      <Sidebar />

      {/* ── Mobile header (sticky, top) ── */}
      <MobileHeader
        title={showBack ? pageTitle : undefined}
        showBack={showBack}
        actions={headerActions}
      />

      {/* ── Main content ── */}
      <main
        className={cn(
          "md:ms-64 min-h-dvh",
          // Mobile: pad bottom for nav bar + safe area
          "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8">
          {/* Desktop page header */}
          {!hideTopBar && (
            <DesktopTopBar
              title={pageTitle}
              subtitle={pageSubtitle}
              actions={headerActions}
            />
          )}
          <div className="animate-slide-down">
            {children}
          </div>
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <BottomNav />
    </div>
  );
}
