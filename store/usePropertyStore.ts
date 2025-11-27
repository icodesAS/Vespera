import { create } from "zustand";
import type { Property } from "@/types/property";
import { properties as seedProperties } from "@/data/properties";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PropertyStore {
  properties: Property[];
  currentIndex: number;
  likedIds: string[];
  skippedIds: string[];
  isLoadingProperties: boolean;

  // Actions
  likeCurrent: () => void;
  skipCurrent: () => void;
  reset: () => void;
  setProperties: (properties: Property[]) => void;
  setLikedIds: (ids: string[]) => void;
  movePropertyToTop: (propertyId: string) => void;
  removeFromLiked: (propertyId: string) => void;
  loadPropertiesFromFirestore: () => Promise<void>;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  properties: seedProperties,
  currentIndex: 0,
  likedIds: [],
  skippedIds: [],
  isLoadingProperties: false,

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
      likedIds: [],
      skippedIds: [],
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
        likedIds: state.likedIds,
      };
    }),

  removeFromLiked: (propertyId: string) =>
    set((state) => {
      return {
        likedIds: state.likedIds.filter((id) => id !== propertyId),
      };
    }),

  loadPropertiesFromFirestore: async () => {
    set({ isLoadingProperties: true });
    try {
      const q = query(collection(db, "properties"));
      const querySnapshot = await getDocs(q);
      const firestoreProperties: Property[] = [];
      
      querySnapshot.forEach((doc) => {
        firestoreProperties.push(doc.data() as Property);
      });

      // Combine static properties with Firestore properties
      const combinedProperties = [...seedProperties, ...firestoreProperties];
      
      // Remove duplicates by ID
      const uniqueProperties = Array.from(
        new Map(combinedProperties.map((prop) => [prop.id, prop])).values()
      );

      set({ 
        properties: uniqueProperties,
        isLoadingProperties: false,
      });
    } catch (error) {
      console.error("Failed to load properties from Firestore:", error);
      set({ isLoadingProperties: false });
    }
  },
}));