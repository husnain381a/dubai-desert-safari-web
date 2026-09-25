/**
 * Static catalog used to price booking requests.
 *
 * Packages live in the `packages` table and are priced from the database, but the
 * marketing services (home + services pages) are hard-coded in the routes. This
 * map lets the booking invoice price those services too, and provides the
 * optional add-ons the guest can tick before requesting a booking.
 */

/** "AED per person" prices of the hard-coded services, keyed by their exact title. */
export const SERVICE_PRICES: Record<string, number> = {
  "Evening Desert Safari": 45,
  "Morning Desert Safari": 35,
  "Overnight Safari": 120,
  "Overnight Desert Safari": 120,
  "VIP Premium Safari": 250,
  "Dubai City Tour": 60,
  "Abu Dhabi City Tour": 90,
  "Dune Buggy Adventure": 180,
  "Quad Bike Ride": 50,
};

export type AddOn = {
  id: string;
  label: string;
  /** Price in AED. */
  price: number;
  /** `person` multiplies by the number of guests, `booking` is charged once. */
  per: "person" | "booking";
};

export const ADD_ONS: AddOn[] = [
  { id: "quad-bike", label: "Quad bike ride", price: 50, per: "person" },
  { id: "dune-buggy", label: "Dune buggy session", price: 180, per: "person" },
  { id: "camel-ride", label: "Extra camel ride", price: 30, per: "person" },
  { id: "bbq-upgrade", label: "Premium BBQ & lounge upgrade", price: 55, per: "person" },
  { id: "private-transfer", label: "Private hotel transfer (one way)", price: 40, per: "booking" },
  { id: "vip-transfer", label: "VIP private 4x4 upgrade", price: 120, per: "booking" },
  { id: "photography", label: "Professional photography package", price: 60, per: "booking" },
  { id: "villa-camp", label: "Private villa camp upgrade", price: 150, per: "booking" },
];

export const PICKUP_SLOTS = [
  "07:00 – 08:00",
  "10:00 – 11:00",
  "14:00 – 15:00",
  "16:00 – 17:00",
  "18:00 – 19:00",
];

/** Case-insensitive price lookup for the hard-coded services. */
export function lookupServicePrice(title: string): number | null {
  const key = title.trim().toLowerCase();
  if (!key) return null;
  const match = Object.keys(SERVICE_PRICES).find((t) => t.toLowerCase() === key);
  return match ? SERVICE_PRICES[match] : null;
}
