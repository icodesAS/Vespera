"use client";

import { useState } from "react";
import { collection, addDoc, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import type { Property } from "@/types/property";

export default function AdminPanel() {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: "",
    price: 0,
    rent: 0,
    city: "",
    location: "",
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1000,
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showProperties, setShowProperties] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "rent", "bedrooms", "bathrooms", "areaSqFt"].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!formData.title || !formData.city || !formData.imageUrl) {
        throw new Error("Please fill in all required fields (Title, City, Image URL)");
      }

      const propertyData = {
        id: `prop-${Date.now()}`,
        title: formData.title,
        price: formData.price || 0,
        rent: formData.rent || 0,
        city: formData.city,
        location: formData.location || "",
        bedrooms: formData.bedrooms || 2,
        bathrooms: formData.bathrooms || 2,
        areaSqFt: formData.areaSqFt || 1000,
        imageUrl: formData.imageUrl,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "properties"), propertyData);
      
      setSuccess(`✅ Property added successfully! (ID: ${docRef.id})`);
      setFormData({
        title: "",
        price: 0,
        rent: 0,
        city: "",
        location: "",
        bedrooms: 2,
        bathrooms: 2,
        areaSqFt: 1000,
        imageUrl: "",
      });

      await loadProperties();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add property";
      setError(`❌ ${errorMessage}`);
      console.error("Error adding property:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "properties"));
      const querySnapshot = await getDocs(q);
      const props: Property[] = [];
      querySnapshot.forEach((doc) => {
        props.push(doc.data() as Property);
      });
      setProperties(props);
      setSuccess(`📋 Loaded ${props.length} properties from Firestore`);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Admin Panel</h1>
          <p className="text-gray-600">Add and manage properties in Firestore</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Add New Property</h2>

            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Property Title *"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />

                <textarea
                  name="location"
                  placeholder="Location/Address"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="md:col-span-2 rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  rows={2}
                />

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g., 14500000"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total property value</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    name="rent"
                    placeholder="e.g., 32000"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rental price per month</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    placeholder="e.g., 2"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of bedrooms</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    placeholder="e.g., 2"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of bathrooms</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    name="areaSqFt"
                    placeholder="e.g., 1180"
                    value={formData.areaSqFt}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total property area in square feet</p>
                </div>

                <input
                  type="text"
                  name="imageUrl"
                  placeholder="Image URL *"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="md:col-span-2 rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </div>

              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl bg-green-50 border-2 border-green-200 px-4 py-3 text-sm font-medium text-green-700"
                >
                  {success}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-white font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? "Adding..." : "✨ Add Property"}
              </button>
            </form>
          </motion.div>

          {/* Properties List Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 h-fit"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Properties in Firestore</h2>

            <button
              onClick={() => {
                if (!showProperties) {
                  loadProperties();
                }
                setShowProperties(!showProperties);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-2 text-white font-bold mb-4 transition-all"
            >
              {showProperties ? "🔒 Hide List" : "👁️ View Properties"}
            </button>

            {showProperties && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {properties.length === 0 ? (
                  <p className="text-gray-600 text-sm">No properties found</p>
                ) : (
                  properties.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                    >
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2">{prop.title}</p>
                      <p className="text-xs text-gray-600">📍 {prop.city}</p>
                      <p className="text-xs font-bold text-blue-600">₹{prop.rent}/month</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}