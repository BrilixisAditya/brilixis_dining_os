export const RESTAURANT_TYPES = [
  "Multi-Cuisine",
  "Fine Dining",
  "Casual Dining",
  "Quick Service Restaurant",
  "Fast Food",
  "Cafe",
  "Bakery",
  "Food Court",
  "Cloud Kitchen",
  "Food Truck",
  "Bar & Pub",
  "Sweet Shop",
  "Dhaba",
  "Takeaway",
  "Other",
] as const;

export type RestaurantType = (typeof RESTAURANT_TYPES)[number];
