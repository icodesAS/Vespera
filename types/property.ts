export interface Property {
  id: string;
  title: string;
  city: string;
  location: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  imageUrl: string;
  // Optional fields for backward compatibility
  price?: number;
  rentPrice?: number;
  propertyType?: string;
  furnishing?: string;
  beds?: number;
  baths?: number;
  areaSqft?: number;
  [key: string]: unknown;
}
