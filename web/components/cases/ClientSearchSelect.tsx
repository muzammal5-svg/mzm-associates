"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link         from "next/link";
import { Search, X, UserPlus, ChevronDown } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { cn, isUrdu, textDir } from "@/lib/utils";
import type { Client } from "@/types/supabase";
import { useTranslation } from "react-i18next";

interface ClientSearchSelectProps {
  value?:     Client | null;
  onChange:   (client: Client | null) => void;
  error?:     string;
  disabled?:  boolean;
  className?: string;
  newClientHref?: string;
}

export function ClientSearchSelect({
  value, onChange, error, disabled, className, newClientHref = "/clients/new",
}: ClientSearchSelectProps) {
  const { t } = useTranslation();
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data, isError, refetch } = useClients({ search, isActive: true, pageSize: 8 });

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function select(client: Client) {
    onChange(client);
    setOpen(false);
    setSearch("");
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setSearch("");
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "input flex items-center justify-between gap-2 cursor-pointer text-start",
          error && "border-danger",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {value ? (
          <span
            className="flex-1 truncate text-navy font-medium text-sm"
            dir={textDir(value.full_name)}
            lang={isUrdu(value.full_name) ? "ur" : undefined}
          >
            {value.full_name}
            {value.phone && (
              <span className="text-navy-400 font-normal ms-2 text-xs">{value.phone}</span>
            )}
          </span>
        ) : (
          <span className="flex-1 text-navy-400 text-sm">{t("common.searchClient")}</span>
        )}
        <span className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span onClick={clear}
              className="text-navy-400 hover:text-danger p-0.5 rounded"
              aria-label={t("common.clear")}>
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn("w-4 h-4 text-navy-400 transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {error && <p className="text-danger text-xs mt-1">{error}</p>}

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 start-0 end-0 top-full mt-1 bg-white rounded-xl border border-border shadow-modal overflow-hidden animate-slide-down"
        >
          {/* Search box */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("common.nameCnicPhone")}
                className="input ps-8 py-1.5 text-xs h-8"
              />
            </div>
            {isError && <div className="p-3"><QueryErrorState onRetry={() => void refetch()} /></div>}
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto">
            {data?.clients.map(c => (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => select(c)}
                className="w-full px-3 py-2.5 text-start hover:bg-navy-50 flex items-center gap-2 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gold">
                    {c.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate"
                    dir={textDir(c.full_name)} lang={isUrdu(c.full_name) ? "ur" : undefined}>
                    {c.full_name}
                  </p>
                  {c.phone && <p className="text-xs text-navy-400">{c.phone}</p>}
                </div>
              </button>
            ))}
            {data?.clients.length === 0 && (
              <p className="px-3 py-3 text-xs text-navy-400 text-center">{t("common.noClientsFound")}</p>
            )}
          </div>

          {/* + New client shortcut */}
          <div className="border-t border-border p-2">
            <Link
              href={newClientHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gold-600 hover:bg-gold-50 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> {t("common.addNewClient")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
