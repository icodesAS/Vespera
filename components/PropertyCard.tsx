"use client";

import React from "react";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
  aiReason?: string | null;
  onSelect?: () => void;
  onSkip?: () => void;
  onUndo?: () => void;
  disableActions?: boolean;
};

function PropertyCard({
  property,
  aiReason,
  onSelect,
  onSkip,
  onUndo,
  disableActions,
}: PropertyCardProps) {
  const displayPrice =
    property.rent ?? property.rentPrice ?? property.price ?? 0;

  return (
    <article className="w-full max-w-md mx-auto rounded-3xl shadow-xl overflow-hidden bg-white border border-gray-200">
      <div className="h-60 w-full overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {property.title}
            </h2>
            <span className="text-xs uppercase tracking-wide text-gray-500">
              {property.city}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{property.location}</p>
        </div>

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-emerald-600 font-semibold text-2xl">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-gray-500">per month</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
          <span className="px-3 py-1 rounded-full bg-gray-100">
            {property.bedrooms ?? property.beds} Beds
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100">
            {property.bathrooms ?? property.baths} Baths
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100">
            {property.areaSqFt ?? property.areaSqft} sq.ft
          </span>
        </div>

        {aiReason && (
          <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-800">
            <span className="mr-2">🤖</span>
            {aiReason}
          </div>
        )}

        {(onSkip || onSelect) && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSkip}
              disabled={!onSkip || disableActions}
              className="w-full rounded-full border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Skip
            </button>
            <button 
              type="button"
              onClick={onSelect}
              disabled={!onSelect || disableActions}
              className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Select
            </button>
          </div>
        )}

        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={disableActions}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Undo last swipe
          </button>
        )}
      </div>
    </article>
  );
}

export default PropertyCard;
