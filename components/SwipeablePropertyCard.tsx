"use client";

import { motion, type PanInfo } from "framer-motion";
import PropertyCard from "./PropertyCard";
import type { Property } from "@/types/property";
import { useState } from "react";

interface SwipeablePropertyCardProps {
  property: Property;
  aiReason?: string | null;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onExplain?: () => void;
  isExplaining?: boolean;
  explainError?: string | null;
}

export default function SwipeablePropertyCard({
  property,
  aiReason,
  onSwipeRight,
  onSwipeLeft,
  onExplain,
  isExplaining = false,
  explainError,
}: SwipeablePropertyCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      setSwipeDirection("right");
      setTimeout(() => {
        onSwipeRight();
        setSwipeDirection(null);
      }, 300);
    } else if (info.offset.x < -threshold) {
      setSwipeDirection("left");
      setTimeout(() => {
        onSwipeLeft();
        setSwipeDirection(null);
      }, 300);
    } else {
      setSwipeDirection(null);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Property Card */}
        <div className="lg:col-span-1">
          <motion.div
            key={property.id}
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ scale: 1, opacity: 1, x: 0 }}
            animate={{
              scale: swipeDirection ? 0.95 : 1,
              opacity: swipeDirection ? 0.7 : 1,
              x: swipeDirection === "right" ? 100 : swipeDirection === "left" ? -100 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
          >
            <PropertyCard property={property} aiReason={aiReason} disableActions />

            {/* Swipe Indicator Overlays */}
            {swipeDirection === "right" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-green-500/10 rounded-3xl flex items-center justify-center pointer-events-none"
              >
                <span className="text-4xl font-bold text-green-500">✓ LIKE</span>
              </motion.div>
            )}
            {swipeDirection === "left" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-500/10 rounded-3xl flex items-center justify-center pointer-events-none"
              >
                <span className="text-4xl font-bold text-red-500">✕ SKIP</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right: AI Explanation & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Explanation Button */}
          <button
            type="button"
            onClick={onExplain}
            disabled={isExplaining}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isExplaining ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                Analyzing property...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🤖</span>
                Explain with AI
              </span>
            )}
          </button>

          {explainError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              ⚠️ {explainError}
            </div>
          )}

          {/* AI Explanation Display */}
          {aiReason && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 px-6 py-4 shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🤖</span>
                <div>
                  <h3 className="font-bold text-purple-900 mb-2">AI Assessment</h3>
                  <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-wrap">
                    {aiReason}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Swipe Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onSwipeLeft}
              className="flex-1 rounded-2xl border-2 border-red-300 bg-white hover:bg-red-50 py-4 text-sm font-bold text-red-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
            >
              ✕ Skip
            </button>
            <button
              type="button"
              onClick={onSwipeRight}
              className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-4 text-sm font-bold text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105"
            >
              ✓ Like
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}