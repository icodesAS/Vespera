"use client";

import type { Property } from "@/types/property";

interface LikedPropertiesPanelProps {
  likedProperties: Property[];
  onClose: () => void;
}

export default function LikedPropertiesPanel({
  likedProperties,
  onClose,
}: LikedPropertiesPanelProps) {
  if (likedProperties.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Liked Properties</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 text-sm">No properties liked yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Liked Properties ({likedProperties.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {likedProperties.map((property) => (
            <div
              key={property.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">{property.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{property.location}</p>
              <p className="text-emerald-600 font-semibold mt-2">
                ₹{(property.rent ?? property.rentPrice ?? 0).toLocaleString("en-IN")}/month
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

