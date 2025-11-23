
import { WorkerCategory, WorkerProfile } from './types';

// SVG Path Constants for Icons
export const ICONS = {
  SEARCH: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  STAR: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  LOCATION: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  VERIFIED: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  FILTER: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
  CHEVRON_LEFT: "M15.75 19.5L8.25 12l7.5-7.5",
};

export const CATEGORY_ICONS: Record<WorkerCategory, string> = {
  [WorkerCategory.PLUMBER]: "🔧",
  [WorkerCategory.ELECTRICIAN]: "⚡",
  [WorkerCategory.MAID]: "🧹",
  [WorkerCategory.MECHANIC]: "🚗",
  [WorkerCategory.CARPENTER]: "🔨",
  [WorkerCategory.PAINTER]: "🎨",
  [WorkerCategory.AC_REPAIR]: "❄️",
  [WorkerCategory.GARDENER]: "🌱",
  [WorkerCategory.TEACHER]: "📚",
  [WorkerCategory.TRAINER]: "💪",
  [WorkerCategory.DRIVER]: "🚖",
  [WorkerCategory.OTHER]: "🔍",
};

// Helper to generate random coordinates near a base location (approx 10km radius)
const randomNear = (lat: number, lng: number) => {
  const r = 0.1; // ~10km
  return {
    lat: lat + (Math.random() - 0.5) * r,
    lng: lng + (Math.random() - 0.5) * r
  };
};

// Default start location (San Francisco for demo purposes if geo fails)
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

export const MOCK_WORKERS: WorkerProfile[] = [
  {
    id: '1',
    name: "Mario Rossi",
    category: WorkerCategory.PLUMBER,
    rating: 4.9,
    reviewCount: 128,
    price: 80,
    priceUnit: 'visit',
    experienceYears: 12,
    expertise: ["Leak Fix", "Pipe Installation", "Water Heater"],
    description: "Master plumber with over a decade of experience. Quick response time for emergencies.",
    imageUrl: "https://picsum.photos/200/200?random=1",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'AVAILABLE'
  },
  {
    id: '2',
    name: "Sarah Jenkins",
    category: WorkerCategory.MAID,
    rating: 4.7,
    reviewCount: 84,
    price: 35,
    priceUnit: 'hr',
    experienceYears: 5,
    expertise: ["Deep Cleaning", "Organization", "Laundry"],
    description: "Detailed oriented cleaner who leaves your house sparkling. Eco-friendly products used.",
    imageUrl: "https://picsum.photos/200/200?random=2",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'BUSY'
  },
  {
    id: '3',
    name: "Mike's Auto Fix",
    category: WorkerCategory.MECHANIC,
    rating: 4.5,
    reviewCount: 340,
    price: 120,
    priceUnit: 'service',
    experienceYears: 20,
    expertise: ["Engine Diagnostics", "Brake Repair", "Oil Change"],
    description: "Full service auto repair shop coming to your driveway. We fix it all.",
    imageUrl: "https://picsum.photos/200/200?random=3",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'AVAILABLE'
  },
  {
    id: '4',
    name: "Elena Spark",
    category: WorkerCategory.ELECTRICIAN,
    rating: 4.9,
    reviewCount: 56,
    price: 95,
    priceUnit: 'hr',
    experienceYears: 8,
    expertise: ["Wiring", "Lighting Installation", "Circuit Breakers"],
    description: "Certified electrician specializing in smart home setups and safety inspections.",
    imageUrl: "https://picsum.photos/200/200?random=4",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'OFFLINE'
  },
  {
    id: '5',
    name: "Green Thumb Gardens",
    category: WorkerCategory.GARDENER,
    rating: 4.6,
    reviewCount: 92,
    price: 50,
    priceUnit: 'hr',
    experienceYears: 15,
    expertise: ["Landscaping", "Lawn Mowing", "Tree Pruning"],
    description: "Transforming backyards into paradises. Weekly maintenance available.",
    imageUrl: "https://picsum.photos/200/200?random=5",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: false,
    status: 'AVAILABLE'
  },
  {
    id: '6',
    name: "Cool Breeze AC",
    category: WorkerCategory.AC_REPAIR,
    rating: 4.8,
    reviewCount: 210,
    price: 70,
    priceUnit: 'visit',
    experienceYears: 10,
    expertise: ["AC Installation", "Filter Cleaning", "Gas Refill"],
    description: "Don't sweat it! We fix AC units same-day in most cases.",
    imageUrl: "https://picsum.photos/200/200?random=6",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'BUSY'
  },
  {
    id: '7',
    name: "FixIt Felix",
    category: WorkerCategory.CARPENTER,
    rating: 4.4,
    reviewCount: 30,
    price: 60,
    priceUnit: 'hr',
    experienceYears: 4,
    expertise: ["Furniture Assembly", "Door Repair", "Custom Shelving"],
    description: "Reliable carpentry and general handyman services.",
    imageUrl: "https://picsum.photos/200/200?random=7",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: false,
    status: 'OFFLINE'
  },
  {
    id: '8',
    name: "Color Splash",
    category: WorkerCategory.PAINTER,
    rating: 4.7,
    reviewCount: 45,
    price: 200,
    priceUnit: 'service',
    experienceYears: 7,
    expertise: ["Interior Painting", "Exterior Painting", "Wall Texturing"],
    description: "Professional painting services with a focus on clean lines and vibrant colors.",
    imageUrl: "https://picsum.photos/200/200?random=8",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'AVAILABLE'
  },
   {
    id: '9',
    name: "Joe The Plumber",
    category: WorkerCategory.PLUMBER,
    rating: 3.8,
    reviewCount: 15,
    price: 50,
    priceUnit: 'visit',
    experienceYears: 2,
    expertise: ["Clogs", "Faucet Repair"],
    description: "Affordable plumbing for small jobs.",
    imageUrl: "https://picsum.photos/200/200?random=9",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: false,
    status: 'AVAILABLE'
  },
  {
    id: '10',
    name: "TechWiz Mechanics",
    category: WorkerCategory.MECHANIC,
    rating: 5.0,
    reviewCount: 12,
    price: 150,
    priceUnit: 'visit',
    experienceYears: 15,
    expertise: ["Luxury Cars", "Bike Repair", "Diagnostics"],
    description: "Specialized in high-end vehicle maintenance.",
    imageUrl: "https://picsum.photos/200/200?random=10",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'AVAILABLE'
  },
  {
    id: '11',
    name: "Mrs. Robinson",
    category: WorkerCategory.TEACHER,
    rating: 5.0,
    reviewCount: 28,
    price: 45,
    priceUnit: 'hr',
    experienceYears: 15,
    expertise: ["Math", "Physics", "SAT Prep"],
    description: "Experienced high school teacher offering private tutoring sessions.",
    imageUrl: "https://picsum.photos/200/200?random=11",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'BUSY'
  },
  {
    id: '12',
    name: "Fit Pro Alex",
    category: WorkerCategory.TRAINER,
    rating: 4.8,
    reviewCount: 64,
    price: 80,
    priceUnit: 'hr',
    experienceYears: 6,
    expertise: ["Weight Loss", "Muscle Gain", "Yoga"],
    description: "Certified personal trainer who brings the gym to you.",
    imageUrl: "https://picsum.photos/200/200?random=12",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'AVAILABLE'
  },
  {
    id: '13',
    name: "SafeRide Services",
    category: WorkerCategory.DRIVER,
    rating: 4.9,
    reviewCount: 112,
    price: 30,
    priceUnit: 'hr',
    experienceYears: 10,
    expertise: ["Airport Runs", "Chauffeur", "Deliveries"],
    description: "Professional driver with a luxury sedan. Punctual and safe.",
    imageUrl: "https://picsum.photos/200/200?random=13",
    location: randomNear(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    isVerified: true,
    status: 'AVAILABLE'
  }
];
