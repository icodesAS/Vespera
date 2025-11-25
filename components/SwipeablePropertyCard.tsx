"use client";

import { motion, type PanInfo } from "framer-motion";
import PropertyCard from "./PropertyCard";
import type { Property } from "@/types/property";

interface SwipeablePropertyCardProps {
  property: Property;
  aiReason?: string | null;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  preferenceText?: string;
  onPreferenceChange?: (text: string) => void;
  onExplain?: () => void;
  isExplaining?: boolean;
  explainError?: string | null;
}

export default function SwipeablePropertyCard({
  property,
  aiReason,
  onSwipeRight,
  onSwipeLeft,
  preferenceText = "",
  onPreferenceChange,
  onExplain,
  isExplaining = false,
  explainError,
}: SwipeablePropertyCardProps) {
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <PropertyCard property={property} aiReason={aiReason} disableActions />

      {/* Preference Text Input & AI Explanation */}
      <div className="mt-4 space-y-3">
        <div>
          <label
            htmlFor="preference-text"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your preferences (optional)
          </label>
          <textarea
            id="preference-text"
            value={preferenceText}
            onChange={(e) => onPreferenceChange?.(e.target.value)}
            placeholder="e.g., I care about balconies and good WiFi"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
            rows={2}
          />
        </div>

        <button
          type="button"
          onClick={onExplain}
          disabled={isExplaining}
          className="w-full rounded-full border border-emerald-200 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExplaining ? "Thinking..." : "Explain with AI"}
        </button>

        {explainError && (
          <p className="text-xs text-red-600">{explainError}</p>
        )}
      </div>

      {/* Swipe Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onSwipeLeft}
          className="flex-1 rounded-full border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onSwipeRight}
          className="flex-1 rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Like
        </button>
      </div>
    </motion.div>
  );
}

