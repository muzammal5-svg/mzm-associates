"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi }       from "lucide-react";
import { useTranslation }      from "react-i18next";
import { cn }                  from "@/lib/utils";

export function OfflineBanner() {
  const { t }           = useTranslation();
  const [online, setOnline]   = useState(true);
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initialise from browser state
    setOnline(navigator.onLine);
    if (!navigator.onLine) setVisible(true);

    const handleOffline = () => { setOnline(false); setVisible(true); setWasOffline(true); };
    const handleOnline  = () => {
      setOnline(true);
      if (wasOffline) {
        // Show "back online" briefly then hide
        setTimeout(() => setVisible(false), 2500);
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
    };
  }, [wasOffline]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 start-0 end-0 z-[90] flex items-center justify-center gap-2",
        "px-4 py-2 text-sm font-medium transition-colors duration-300",
        "md:top-auto md:bottom-4 md:start-1/2 md:-translate-x-1/2 md:end-auto",
        "md:rounded-xl md:shadow-modal md:px-5 md:py-2.5 md:w-auto",
        online
          ? "bg-success text-white"
          : "bg-navy text-white"
      )}
    >
      {online ? (
        <><Wifi className="w-4 h-4" /> {t("common.backOnline")}</>
      ) : (
        <><WifiOff className="w-4 h-4" /> {t("common.offline")}</>
      )}
    </div>
  );
}
