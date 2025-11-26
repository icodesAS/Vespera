"use client";

import type { Property } from "@/types/property";
import { motion } from "framer-motion";

interface LikedPropertiesPanelProps {
  likedProperties: Property[];
  onClose: () => void;
  onPropertyClick?: (property: Property) => void;
  onRemoveFromLiked?: (propertyId: string) => void;
}

export default function LikedPropertiesPanel({
  likedProperties,
  onClose,
  onPropertyClick,
  onRemoveFromLiked,
}: LikedPropertiesPanelProps) {
  if (likedProperties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">❤️ Liked Properties</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 text-base">
            No properties liked yet. Start swiping to add favorites! 🏠
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900">
            ❤️ Liked Properties ({likedProperties.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {likedProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onPropertyClick?.(property);
                  onClose();
                }}
                className="group cursor-pointer border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white hover:bg-blue-50"
              >
                {/* Property Image */}
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-200">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Property Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-1">{property.location}</p>

                  {/* Price and Details */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(property.rent ?? property.rentPrice ?? 0).toLocaleString("en-IN")}
                    </p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                      {property.city}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-2 text-xs text-gray-700 pt-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                      🛏️ {property.bedrooms ?? property.beds}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                      🚿 {property.bathrooms ?? property.baths}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                      {(property.areaSqFt ?? property.areaSqft ?? 0).toLocaleString()} sq.ft
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromLiked?.(property.id);
                    }}
                    className="mt-3 w-full rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-2 transition-all duration-200"
                  >
                    ✕ Remove from Liked
                  </button>
                
                </div>

                {/* Click Indicator */}
                <div className="mt-3 text-center text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                  Click to view ↗️
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}