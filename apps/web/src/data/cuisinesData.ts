export interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean; // true = Green Icon, false = Red Icon
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  priceRange: string;
  image: string;
  menu: MenuItem[];
}

export interface CuisineData {
  id: string;
  name: string;
  image: string;
  restaurants: Restaurant[];
}

// Example helper function generating 20 varieties per restaurant
const generateMenuItems = (cuisineName: string, restoIndex: number): MenuItem[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `${cuisineName.toLowerCase()}-${restoIndex}-item-${i + 1}`,
    name: `${cuisineName} Special Item #${i + 1}`,
    price: Math.floor(Math.random() * 15) + 8,
    isVeg: i % 2 === 0, // Alternates Green (Veg) and Red (Non-Veg)
    description: `Delicious authentic ${cuisineName.toLowerCase()} preparation with premium spices.`
  }));
};

const CUISINE_NAMES = ['Italian', 'Japanese', 'Mexican', 'American', 'Indian', 'Chinese', 'Peruvian', 'Greek'];

export const CUISINES_DATA: CuisineData[] = CUISINE_NAMES.map((name, cIdx) => ({
  id: `cuisine-${cIdx + 1}`,
  name,
  image: `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80`,
  restaurants: Array.from({ length: 10 }, (_, rIdx) => ({
    id: `resto-${cIdx + 1}-${rIdx + 1}`,
    name: `${name} Bistro ${rIdx + 1}`,
    rating: Number((4.0 + Math.random() * 0.9).toFixed(1)),
    deliveryTime: `${15 + rIdx * 3}-${25 + rIdx * 3} min`,
    priceRange: rIdx % 2 === 0 ? '$$' : '$$$',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    menu: generateMenuItems(name, rIdx + 1)
  }))
}));