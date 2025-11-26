import { create } from "zustand";
import type { Property } from "@/types/property";
import { properties as seedProperties } from "@/data/properties";

interface PropertyStore {
  properties: Property[];
  currentIndex: number;
  likedIds: string[];
  skippedIds: string[];

  // Actions
  likeCurrent: () => void;
  skipCurrent: () => void;
  reset: () => void;
  setProperties: (properties: Property[]) => void;
  setLikedIds: (ids: string[]) => void;
  movePropertyToTop: (propertyId: string) => void;
  removeFromLiked: (propertyId: string) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  properties: seedProperties,
  currentIndex: 0,
  likedIds: [],
  skippedIds: [],

  likeCurrent: () =>
    set((state) => {
      const currentProperty = state.properties[state.currentIndex];
      if (!currentProperty) return state;

      const newLikedIds = state.likedIds.includes(currentProperty.id)
        ? state.likedIds
        : [...state.likedIds, currentProperty.id];

      return {
        likedIds: newLikedIds,
        currentIndex: state.currentIndex + 1,
      };
    }),

  skipCurrent: () =>
    set((state) => {
      const currentProperty = state.properties[state.currentIndex];
      if (!currentProperty) return state;

      const newSkippedIds = state.skippedIds.includes(currentProperty.id)
        ? state.skippedIds
        : [...state.skippedIds, currentProperty.id];

      return {
        skippedIds: newSkippedIds,
        currentIndex: state.currentIndex + 1,
      };
    }),

  reset: () =>
    set({
      currentIndex: 0,
      skippedIds: [],
      likedIds: [],
    }),

  setProperties: (properties) => set({ properties }),
  setLikedIds: (ids) => set({ likedIds: ids }),

  movePropertyToTop: (propertyId: string) =>
    set((state) => {
      const propertyIndex = state.properties.findIndex((p) => p.id === propertyId);
      if (propertyIndex === -1) return state;

      const updatedProperties = state.properties.filter((p) => p.id !== propertyId);
      const reorderedProperties = [state.properties[propertyIndex], ...updatedProperties];

      return {
        properties: reorderedProperties,
        currentIndex: 0,
        skippedIds: [],
      };
    }),

  removeFromLiked: (propertyId: string) =>
    set((state) => {
      return {
        likedIds: state.likedIds.filter((id) => id !== propertyId),
      };
    }),
}));