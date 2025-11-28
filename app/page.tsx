"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePropertyStore } from "@/store/usePropertyStore";
import SwipeablePropertyCard from "@/components/SwipeablePropertyCard";
import LikedPropertiesPanel from "@/components/LikedPropertiesPanel";
import PropertyCard from "@/components/PropertyCard";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Property } from "@/types/property";

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const {
    properties,
    currentIndex,
    likedIds,
    likeCurrent,
    skipCurrent,
    reset,
    setLikedIds,
    setProperties,
    movePropertyToTop,
    removeFromLiked,
    loadPropertiesFromFirestore,
  } = usePropertyStore();

  const [aiReason, setAiReason] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [showLikedPanel, setShowLikedPanel] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const property = properties[currentIndex];
  const isEndOfList = currentIndex >= properties.length;
  const likedProperties = properties.filter((p) => likedIds.includes(p.id));

  // Load properties from Firestore on mount
  useEffect(() => {
    loadPropertiesFromFirestore();
  }, [loadPropertiesFromFirestore]);

  // Load user data from Firestore on mount
  useEffect(() => {
    if (user && db) {
      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.likedPropertyIds) {
              setLikedIds(data.likedPropertyIds);
            }
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      };
      loadUserData();
    }
  }, [user, setLikedIds]);

  // Persist liked IDs to Firestore
  const persistToFirestore = useCallback(
    async (likedIds: string[]) => {
      if (!user || !db) return;

      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            likedPropertyIds: likedIds,
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Failed to persist to Firestore:", error);
      }
    },
    [user]
  );

  // Handle swipe right (like)
  const handleSwipeRight = useCallback(() => {
    if (isEndOfList || !property) return;
    
    const newLikedIds = likedIds.includes(property.id) 
      ? likedIds 
      : [...likedIds, property.id];
    
    setLikedIds(newLikedIds);
    likeCurrent();
    setAiReason(null);
    setExplainError(null);

    persistToFirestore(newLikedIds);
  }, [property, isEndOfList, likeCurrent, likedIds, setLikedIds, persistToFirestore]);

  // Handle swipe left (skip)
  const handleSwipeLeft = useCallback(() => {
    if (isEndOfList) return;
    skipCurrent();
    setAiReason(null);
    setExplainError(null);
  }, [isEndOfList, skipCurrent]);

  // Handle AI explanation
  const handleExplain = useCallback(async () => {
    if (!property || isExplaining) return;
    setIsExplaining(true);
    setExplainError(null);

    try {
      const response = await fetch("/api/ai/explain-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const payload = await response.json();
      setAiReason(payload.aiReason ?? "No explanation returned.");
    } catch (error) {
      console.error("AI explanation error:", error);
      setExplainError("Could not fetch AI explanation. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  }, [property, isExplaining]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleSwipeLeft();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleSwipeRight();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSwipeLeft, handleSwipeRight]);

  // AI Search handler
  const handleSearch = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      setSearchError(null);

      try {
        console.log("🔍 Starting search with query:", searchQuery);
        
        const response = await fetch("/api/ai/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            allProperties: properties,
          }),
        });
        
        console.log("📡 Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "AI search failed");
        }

        const payload = await response.json();
        console.log("✅ Search successful, found properties:", payload.properties?.length);
        
        if (!payload.properties || !Array.isArray(payload.properties)) {
          throw new Error("Invalid response format from AI search");
        }

        if (payload.properties.length === 0) {
          setSearchError("No properties matched your search. Try a different query.");
          setIsSearching(false);
          return;
        }

        setProperties(payload.properties);
        reset();
        setVisibleCount(6);
        setAiReason(null);
        setExplainError(null);
      } catch (error) {
        console.error("❌ AI search error:", error);
        setSearchError(
          error instanceof Error 
            ? error.message 
            : "AI search could not understand the request."
        );
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, properties, reset, setProperties]
  );

  // Handle property click from list or liked panel
  const handlePropertyClick = useCallback(
    (clickedProperty: Property) => {
      movePropertyToTop(clickedProperty.id);
      setAiReason(null);
      setExplainError(null);
    },
    [movePropertyToTop]
  );

  // Handle remove from liked
  const handleRemoveFromLiked = useCallback(
    (propertyId: string) => {
      const newLikedIds = likedIds.filter((id) => id !== propertyId);
      setLikedIds(newLikedIds);
      removeFromLiked(propertyId);
      persistToFirestore(newLikedIds);
    },
    [likedIds, setLikedIds, removeFromLiked, persistToFirestore]
  );

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200
      ) {
        setVisibleCount((prev) => Math.min(prev + 6, properties.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [properties.length]);

  // Redirect to login when user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-600 font-bold">
              🏠 PropSwipe
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Swipe smarter, rent happier</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              type="button"
              onClick={() => setShowLikedPanel(true)}
              className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md"
            >
              ❤️ Liked ({likedIds.length})
            </button>
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              🛠 Admin
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-gray-300 hover:bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* AI Search */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Describe what you want: 'quiet 2BHK under 30k in Pune near metro'…"
            className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:border-slate-900 focus:outline-none transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
          >
            {isSearching ? "🔍 Searching…" : "🔍 AI Search"}
          </button>
        </form>
        {searchError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">⚠️ {searchError}</p>
        )}

        {/* Main Swipe Card */}
        <div>
          {isEndOfList ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white p-10 text-center shadow-lg max-w-2xl mx-auto">
              <p className="text-2xl font-bold text-slate-900">
                You&apos;ve viewed all properties ✨
              </p>
              <p className="text-gray-600 mt-2 text-lg">
                You&apos;ve reviewed every property. Restart to browse again.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                🔄 Restart Browsing
              </button>
            </div>
          ) : (
            <SwipeablePropertyCard
              property={property}
              aiReason={aiReason}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onExplain={handleExplain}
              isExplaining={isExplaining}
              explainError={explainError}
            />
          )}
        </div>

        {/* Infinite Scroll List */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📋 All Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, visibleCount).map((prop) => (
              <div
                key={prop.id}
                onClick={() => handlePropertyClick(prop)}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
              >
                <PropertyCard
                  property={prop}
                  disableActions
                  onCardClick={() => handlePropertyClick(prop)}
                />
              </div>
            ))}
          </div>
          {visibleCount < properties.length && (
            <p className="text-center text-sm text-gray-500 mt-8">
              ⬇️ Scroll for more properties...
            </p>
          )}
        </div>
      </div>

      {/* Liked Properties Panel */}
      {showLikedPanel && (
        <LikedPropertiesPanel
          likedProperties={likedProperties}
          onClose={() => setShowLikedPanel(false)}
          onPropertyClick={handlePropertyClick}
          onRemoveFromLiked={handleRemoveFromLiked}
        /> 
      )}
    </main>
  );
}