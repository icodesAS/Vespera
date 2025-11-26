"use client";

import React, { useState } from "react";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
  aiReason?: string | null;
  onSelect?: () => void;
  onSkip?: () => void;
  onUndo?: () => void;
  disableActions?: boolean;
  onCardClick?: (propertyId: string) => void;
};

function PropertyCard({
  property,
  aiReason,
  onSelect,
  onSkip,
  onUndo,
  disableActions,
  onCardClick,
}: PropertyCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const displayPrice =
    property.rent ?? property.rentPrice ?? property.price ?? 0;

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLightboxOpen(true);
  };

  const handleCardClick = () => {
    onCardClick?.(property.id || "");
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group w-full max-w-md mx-auto animate-fade-in cursor-pointer"
      >
        <div className="rounded-3xl shadow-lg overflow-hidden bg-white border border-gray-100 transition-all duration-300 ease-out group-hover:shadow-2xl group-hover:scale-105">
          {/* Image Container */}
          <div
            onClick={handleImageClick}
            className="relative h-60 w-full overflow-hidden bg-gray-200 cursor-pointer"
          >
            <img
              src={property.imageUrl}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Expand
              </span>
            </div>
          </div>

          {/* Content Container */}
          <div className="p-6 space-y-4">
            {/* Header: Title and City */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors duration-200">
                  {property.title}
                </h2>
                <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                  {property.city}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <span className="text-slate-600 flex-shrink-0">📍</span>
                <p className="text-sm truncate">{property.location}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 rounded-2xl">
              <span className="text-3xl font-bold text-slate-900">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-gray-600">per month</span>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-700 mb-1">
                  <span>🛏️</span>
                  <span className="text-sm font-bold">
                    {property.bedrooms ?? property.beds}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Beds</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-700 mb-1">
                  <span>🚿</span>
                  <span className="text-sm font-bold">
                    {property.bathrooms ?? property.baths}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Baths</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 mb-1">
                  {(property.areaSqFt ?? property.areaSqft ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 font-medium">sq.ft</p>
              </div>
            </div>

            {/* AI Reason */}
            {aiReason && (
              <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 text-sm text-purple-900 shadow-sm hidden">
                <span className="mr-2 text-lg">🤖</span>
                <span className="font-medium">{aiReason}</span>
              </div>
            )}

            {/* Action Buttons */}
            {(onSkip || onSelect) && (
              <div className="flex flex-col gap-2 sm:flex-row pt-2">
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={!onSkip || disableActions}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-md"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={onSelect}
                  disabled={!onSelect || disableActions}
                  className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-slate-800 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-lg hover:scale-105"
                >
                  Select
                </button>
              </div>
            )}

            {/* Undo Button */}
            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                disabled={disableActions}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↶ Undo last swipe
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10 text-2xl"
              aria-label="Close lightbox"
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative w-full h-auto rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={property.imageUrl}
                alt={property.title}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Image Info */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{property.title}</h3>
              <p className="text-gray-300 text-sm mt-2">{property.location}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyCard;