
import { WorkerCategory } from './types';

// SVG Path Constants for Icons
export const ICONS = {
  SEARCH: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  STAR: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  LOCATION: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  DASHBOARD: "M9 17v-2a4 4 0 00-4-4H3V9h2a4 4 0 004-4V3h5v2a4 4 0 004 4h2v2h-2a4 4 0 00-4 4v2H9z",
  SIGN_OUT: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
};

// Merged and complete icon list for all categories
export const CATEGORY_ICONS: Record<WorkerCategory, string> = {
  // Original Home Services
  [WorkerCategory.PLUMBER]: "🔧",
  [WorkerCategory.ELECTRICIAN]: "⚡",
  [WorkerCategory.MAID]: "🧹",
  [WorkerCategory.CARPENTER]: "🔨",
  [WorkerCategory.PAINTER]: "🎨",
  [WorkerCategory.GARDENER]: "🌱",
  [WorkerCategory.HOUSE_CLEANING]: '🏠',
  [WorkerCategory.LAUNDRY_SERVICE]: '🧺',
  [WorkerCategory.PEST_CONTROL]: '🦟',
  [WorkerCategory.APPLIANCE_REPAIR]: '🛠️',
  [WorkerCategory.LOCKSMITH]: '🔑',
  [WorkerCategory.PACKERS_AND_MOVERS]: '📦',

  // Original Auto & Transportation
  [WorkerCategory.MECHANIC]: "🚗",
  [WorkerCategory.CAR_WASHING]: '🧼',
  [WorkerCategory.DRIVER]: "🚖",
  [WorkerCategory.BIKE_REPAIR]: '🚲',
  [WorkerCategory.ROADSIDE_ASSISTANCE]: '🆘',

  // Original Personal & Family
  [WorkerCategory.TUTOR]: "📚",
  [WorkerCategory.FITNESS_TRAINER]: "💪",
  [WorkerCategory.DOCTOR_NURSE]: '🧑‍⚕️',
  [WorkerCategory.TIFFIN_SERVICE]: '🍱',
  [WorkerCategory.BEAUTICIAN]: '💅',
  [WorkerCategory.BABYSITTER]: '👶',
  [WorkerCategory.PET_SITTER]: '🐾',
  [WorkerCategory.COOK]: '👩‍🍳',

  // Original Other Essentials
  [WorkerCategory.ERRAND_RUNNER]: '🏃‍♂️',
  [WorkerCategory.DOCUMENTATION_ASSISTANCE]: '📄',

  // Newly Added Categories
  [WorkerCategory.TECH_SUPPORT]: '💻',
  [WorkerCategory.PHOTOGRAPHY]: '📷',
  [WorkerCategory.VIDEOGRAPHY]: '🎥',
  [WorkerCategory.SECURITY]: '🛡️',
  [WorkerCategory.CATERING]: '🍲',
  
  [WorkerCategory.OTHER]: "🔍",
};

type ServiceGroup = {
    name: string;
    color: string;
    icon: string;
    categories: WorkerCategory[];
    helperText: string;
}

// Reorganized service groups to logically contain all categories
export const SERVICE_GROUPS: Record<string, ServiceGroup> = {
  "Home Care & Repair": {
    name: "Home Care & Repair",
    icon: "🏠",
    color: "blue",
    helperText: "Fix, maintain, and improve your home with trusted professionals.",
    categories: [
      WorkerCategory.PLUMBER, 
      WorkerCategory.ELECTRICIAN, 
      WorkerCategory.CARPENTER, 
      WorkerCategory.PAINTER, 
      WorkerCategory.APPLIANCE_REPAIR, 
      WorkerCategory.LOCKSMITH, 
      WorkerCategory.PEST_CONTROL,
      WorkerCategory.GARDENER,
    ]
  },
  "Cleaning & Logistics": {
      name: "Cleaning & Logistics",
      icon: "📦",
      color: "orange",
      helperText: "Keep your space spotless and manage moves with ease.",
      categories: [
        WorkerCategory.MAID,
        WorkerCategory.HOUSE_CLEANING,
        WorkerCategory.LAUNDRY_SERVICE,
        WorkerCategory.PACKERS_AND_MOVERS, 
        WorkerCategory.CAR_WASHING,
      ]
  },
  "Auto & Transportation": {
    name: "Auto & Transportation",
    icon: "🚗",
    color: "green",
    helperText: "Keep your vehicles running smoothly and get where you need to go.",
    categories: [
      WorkerCategory.MECHANIC, 
      WorkerCategory.DRIVER, 
      WorkerCategory.BIKE_REPAIR, 
      WorkerCategory.ROADSIDE_ASSISTANCE,
    ]
  },
  "Personal & Family Care": {
    name: "Personal & Family Care",
    icon: "🤝",
    color: "purple",
    helperText: "Care for your loved ones and yourself with our dedicated experts.",
    categories: [
      WorkerCategory.TUTOR, 
      WorkerCategory.FITNESS_TRAINER, 
      WorkerCategory.DOCTOR_NURSE, 
      WorkerCategory.BEAUTICIAN, 
      WorkerCategory.BABYSITTER, 
      WorkerCategory.PET_SITTER,
    ]
  },
  "Food & Errands": {
      name: "Food & Errands",
      icon: "🍱",
      color: "red",
      helperText: "Delicious meals and convenient help for your daily tasks.",
      categories: [
        WorkerCategory.COOK, 
        WorkerCategory.TIFFIN_SERVICE,
        WorkerCategory.CATERING,
        WorkerCategory.ERRAND_RUNNER,
      ]
  },
  "Professional & Creative": {
    name: "Professional & Creative",
    icon: "💼",
    color: "yellow",
    helperText: "Specialized services for your business, events, and technical needs.",
    categories: [
      WorkerCategory.TECH_SUPPORT,
      WorkerCategory.PHOTOGRAPHY,
      WorkerCategory.VIDEOGRAPHY,
      WorkerCategory.DOCUMENTATION_ASSISTANCE,
      WorkerCategory.SECURITY,
      WorkerCategory.OTHER
    ]
  }
}

// Default start location (if geo fails)
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
