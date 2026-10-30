"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldCheck,
  Pause,
  Play,
  MapPin,
  Building2,
} from "lucide-react";
import { REVIEWS, type Review } from "@/lib/reviews";
import { cn } from "@/lib/utils";

interface ReviewSliderProps {
  reviews?: Review[];
  className?: string;
}

export function ReviewSlider({
  reviews = REVIEWS,
  className,
}: ReviewSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive cards-per-view calculation
  useEffect(() => {
    function handleResize() {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1024) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 640) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalReviews = reviews.length;
  const maxIndex = Math.max(0, totalReviews - cardsPerView);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay timer (5 seconds)
  useEffect(() => {
    if (!isAutoPlayEnabled || isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlayEnabled, isPaused, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Ensure currentIndex stays within bounds when resizing
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [cardsPerView, maxIndex, currentIndex]);

  return (
    <div
      className={cn("relative w-full select-none", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verified Advocate Testimonials</span>
          </div>
          <span className="text-xs text-white/50">
            Showing {currentIndex + 1} to{" "}
            {Math.min(currentIndex + cardsPerView, totalReviews)} of{" "}
            {totalReviews}
          </span>
        </div>

        {/* Buttons & Indicators */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoPlayEnabled((v) => !v)}
            aria-label={isAutoPlayEnabled ? "Pause autoplay" : "Start autoplay"}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
            title={isAutoPlayEnabled ? "Pause autoplay" : "Start autoplay"}
          >
            {isAutoPlayEnabled ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous review"
            className="p-2.5 rounded-lg bg-[#1a1f2e] hover:bg-gold/20 text-white hover:text-gold border border-white/10 hover:border-gold/40 transition-all active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next review"
            className="p-2.5 rounded-lg bg-[#1a1f2e] hover:bg-gold/20 text-white hover:text-gold border border-white/10 hover:border-gold/40 transition-all active:scale-95 shadow-sm"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div className="overflow-hidden rounded-2xl py-2">
        <div
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{
            transform: `translateX(-${
              currentIndex * (100 / cardsPerView)
            }%)`,
          }}
        >
          {reviews.map((review, idx) => {
            const isFeatured = idx === currentIndex;
            return (
              <div
                key={idx}
                className="flex-shrink-0"
                style={{
                  width: `calc(${100 / cardsPerView}% - ${
                    ((cardsPerView - 1) * 24) / cardsPerView
                  }px)`,
                }}
              >
                <div
                  className={cn(
                    "h-full flex flex-col justify-between bg-gradient-to-b from-[#141A28] to-[#0E131E] border rounded-2xl p-6 sm:p-7 transition-all duration-300 relative group overflow-hidden shadow-xl",
                    isFeatured
                      ? "border-gold/50 shadow-gold/10"
                      : "border-white/10 hover:border-gold/30 hover:shadow-lg"
                  )}
                >
                  {/* Subtle decorative background glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold/10 transition-colors" />

                  {/* Top Bar: Stars + Tag & Quote Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.stars }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-gold fill-gold drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]"
                          />
                        ))}
                      </div>

                      {/* Tag pill */}
                      {review.tag && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gold/10 text-gold-300 border border-gold/25 whitespace-nowrap">
                          {review.tag}
                        </span>
                      )}
                    </div>

                    {/* Quotation text */}
                    <div className="relative mb-6">
                      <Quote className="w-6 h-6 text-gold/25 absolute -top-1 -start-1 -z-0 pointer-events-none" />
                      <p className="text-white/90 text-sm sm:text-[15px] leading-relaxed relative z-10 italic">
                        &ldquo;{review.quote}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Author & Chamber details */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar Initials */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 via-navy-700 to-navy-900 border border-gold/40 flex items-center justify-center text-xs font-bold text-gold-200 flex-shrink-0 shadow-inner">
                        {review.initials}
                      </div>

                      {/* Name & Title */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-semibold text-sm truncate">
                            {review.name}
                          </p>
                          <span title="Verified Advocate" className="inline-flex">
                            <ShieldCheck
                              className="w-3.5 h-3.5 text-gold flex-shrink-0"
                              aria-label="Verified Advocate"
                            />
                          </span>
                        </div>
                        <p className="text-white/60 text-xs truncate">
                          {review.role} &bull; {review.firm}
                        </p>
                      </div>
                    </div>

                    {/* Location Badge */}
                    {(review.location || review.court) && (
                      <div className="hidden xl:flex items-center gap-1 text-[11px] text-white/50 bg-white/5 px-2 py-1 rounded-md border border-white/5 shrink-0">
                        <MapPin className="w-3 h-3 text-gold/70" />
                        <span>{review.location || review.court}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              currentIndex === idx
                ? "w-8 bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                : "w-2 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
