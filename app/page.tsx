"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePropertyStore } from "@/store/usePropertyStore";
import SwipeablePropertyCard from "@/components/SwipeablePropertyCard";
import LikedPropertiesPanel from "@/components/LikedPropertiesPanel";
import PropertyCard from "@/components/PropertyCard";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const {
    properties,
    currentIndex,
    likedIds,
    lastAiPreferenceText,
    likeCurrent,
    skipCurrent,
    reset,
    setLikedIds,
    setLastAiPreferenceText,
    setProperties,
  } = usePropertyStore();

  const [preferenceText, setPreferenceText] = useState(lastAiPreferenceText || "");
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
            if (data.lastAiPreferenceText) {
              setLastAiPreferenceText(data.lastAiPreferenceText);
              setPreferenceText(data.lastAiPreferenceText);
            }
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      };
      loadUserData();
    }
  }, [user, setLikedIds, setLastAiPreferenceText]);

  // Persist liked IDs and preference text to Firestore
  const persistToFirestore = useCallback(
    async (likedIds: string[], preferenceText?: string) => {
      if (!user || !db) return;

      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            likedPropertyIds: likedIds,
            lastAiPreferenceText: preferenceText || null,
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
    if (isEndOfList) return;
    const newPreferenceText = preferenceText.trim() || undefined;
    likeCurrent(newPreferenceText);
    setLastAiPreferenceText(newPreferenceText);
    setAiReason(null);
    setExplainError(null);

    // Persist to Firestore
    const newLikedIds = [...likedIds];
    if (property && !newLikedIds.includes(property.id)) {
      newLikedIds.push(property.id);
    }
    persistToFirestore(newLikedIds, newPreferenceText);
  }, [property, isEndOfList, preferenceText, likeCurrent, likedIds, setLastAiPreferenceText, persistToFirestore]);

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
        cache: "no-store",
        body: JSON.stringify({
          property,
          preferenceText: preferenceText.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        aiReason?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch AI reason");
      }

      setAiReason(payload.aiReason ?? "No explanation returned.");
      
      // Persist preference text if provided
      if (preferenceText.trim() && user) {
        setLastAiPreferenceText(preferenceText.trim());
        persistToFirestore(likedIds, preferenceText.trim());
      }
    } catch (error) {
      console.error(error);
      setExplainError("Could not fetch AI explanation. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  }, [property, preferenceText, isExplaining, user, likedIds, setLastAiPreferenceText, persistToFirestore]);

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
        const response = await fetch("/api/ai/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            query: searchQuery,
            allProperties: properties,
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          properties?: typeof properties;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error || "AI search failed");
        }
        if (!payload.properties?.length) {
          throw new Error("AI search returned no matches");
        }

        setProperties(payload.properties);
        reset();
        setVisibleCount(6);
        setAiReason(null);
        setExplainError(null);
        setPreferenceText(lastAiPreferenceText || "");
      } catch (error) {
        console.error("AI search error:", error);
        setSearchError("AI search could not understand the request.");
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, properties, reset, setProperties, lastAiPreferenceText]
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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-500">
              PropSwipe
            </p>
            <h1 className="text-xl font-bold text-slate-900">Swipe smarter, rent happier</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              type="button"
              onClick={() => setShowLikedPanel(true)}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Liked ({likedIds.length})
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
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
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSearching ? "Searching…" : "AI Search"}
          </button>
        </form>
        {searchError && (
          <p className="text-sm text-red-600">{searchError}</p>
        )}

        {/* Main Swipe Card */}
        <div>
          {isEndOfList ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm max-w-md mx-auto">
              <p className="text-lg font-semibold text-slate-900">
                You&apos;ve viewed all properties ✨
              </p>
              <p className="text-sm text-gray-600 mt-2">
                You&apos;ve reviewed every property. Restart to browse again.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Restart Browsing
              </button>
            </div>
          ) : (
            <SwipeablePropertyCard
              property={property}
              aiReason={aiReason}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              preferenceText={preferenceText}
              onPreferenceChange={setPreferenceText}
              onExplain={handleExplain}
              isExplaining={isExplaining}
              explainError={explainError}
            />
          )}
        </div>

        {/* Infinite Scroll List */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">All Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, visibleCount).map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                disableActions
              />
            ))}
          </div>
          {visibleCount < properties.length && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Scroll for more properties...
            </p>
          )}
        </div>
      </div>

      {/* Liked Properties Panel */}
      {showLikedPanel && (
        <LikedPropertiesPanel
          likedProperties={likedProperties}
          onClose={() => setShowLikedPanel(false)}
        />
      )}
    </main>
  );
}
