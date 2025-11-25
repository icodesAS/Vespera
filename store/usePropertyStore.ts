import { create } from "zustand";
import type { Property } from "@/types/property";
import { properties as seedProperties } from "@/data/properties";

interface PropertyStore {
  properties: Property[];
  currentIndex: number;
  likedIds: string[];
  skippedIds: string[];
  lastAiPreferenceText?: string;

  // Actions
  likeCurrent: (preferenceText?: string) => void;
  skipCurrent: () => void;
  reset: () => void;
  setProperties: (properties: Property[]) => void;
  setLikedIds: (ids: string[]) => void;
  setLastAiPreferenceText: (text?: string) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  properties: seedProperties,
  currentIndex: 0,
  likedIds: [],
  skippedIds: [],
  lastAiPreferenceText: undefined,

  likeCurrent: (preferenceText) =>
    set((state) => {
      const currentProperty = state.properties[state.currentIndex];
      if (!currentProperty) return state;

      const newLikedIds = state.likedIds.includes(currentProperty.id)
        ? state.likedIds
        : [...state.likedIds, currentProperty.id];

      return {
        likedIds: newLikedIds,
        currentIndex: state.currentIndex + 1,
        lastAiPreferenceText: preferenceText ?? state.lastAiPreferenceText,
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
      likedIds: [],
      skippedIds: [],
      // Keep properties and lastAiPreferenceText intact
    }),

  setProperties: (properties) => set({ properties }),
  setLikedIds: (ids) => set({ likedIds: ids }),
  setLastAiPreferenceText: (text) => set({ lastAiPreferenceText: text }),
}));

