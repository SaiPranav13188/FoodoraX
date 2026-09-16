// types/user.ts

export interface SavedAddress {
  id: string;
  label: string; // e.g., "Home", "Work"
  street: string;
  city: string;
  zipCode: string;
  isDefault?: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  cardBrand: string; // e.g., "Visa", "Mastercard"
  last4: string;
  expiry: string;
  isDefault?: boolean;
}

export interface HistoricalOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName?: string;
  isVeg?: boolean;
}

export interface HistoricalOrder {
  id: string;
  date: string; // ISO date string
  restaurantName?: string; // Added to fix component type errors
  items: HistoricalOrderItem[];
  totalAmount: number;
  status: 'Delivered' | 'In Progress' | 'Cancelled';
  deliveryAddress: string;
  paymentMethod: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  addresses: SavedAddress[];
  paymentMethods: SavedPaymentMethod[];
}