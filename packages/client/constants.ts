
import { WorkerCategory } from '@core/types';

// SVG Path Constants for Icons
export const ICONS = {
  SEARCH: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  STAR: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  LOCATION: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  DASHBOARD: "M9 17v-2a4 4 0 00-4-4H3V9h2a4 4 0 004-4V3h5v2a4 4 0 004 4h2v2h-2a4 4 0 00-4 4v2H9z",
  SIGN_OUT: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  EDIT: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  USER: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  EMAIL: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  PHONE: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
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

  // Online Categories
  [WorkerCategory.DIGITAL_MARKETING]: '📈',
  [WorkerCategory.CONTENT_CREATIVE]: '🎨',
  [WorkerCategory.TECH_DEV]: '👨‍💻',
  [WorkerCategory.BUSINESS_OPS]: '💼',
  [WorkerCategory.KNOWLEDGE_SERVICES]: '🧠',
  [WorkerCategory.PROFESSIONAL_ADVISORY]: '⚖️',
  [WorkerCategory.WELLNESS_ONLINE]: '🧘',
  [WorkerCategory.CREATOR_ECONOMY]: '📱',
  [WorkerCategory.LOCAL_BIZ_DIGITIZATION]: '🏪',

  [WorkerCategory.OTHER]: "🔍",
};

export const CATEGORY_DISPLAY_NAMES: Record<WorkerCategory, string> = {
  [WorkerCategory.PLUMBER]: 'Plumber',
  [WorkerCategory.ELECTRICIAN]: 'Electrician',
  [WorkerCategory.MAID]: 'Maid Service',
  [WorkerCategory.CARPENTER]: 'Carpenter',
  [WorkerCategory.PAINTER]: 'Painter',
  [WorkerCategory.GARDENER]: 'Gardener',
  [WorkerCategory.HOUSE_CLEANING]: 'House Cleaning',
  [WorkerCategory.LAUNDRY_SERVICE]: 'Laundry Service',
  [WorkerCategory.PEST_CONTROL]: 'Pest Control',
  [WorkerCategory.APPLIANCE_REPAIR]: 'Appliance Repair',
  [WorkerCategory.LOCKSMITH]: 'Locksmith',
  [WorkerCategory.PACKERS_AND_MOVERS]: 'Packers & Movers',
  [WorkerCategory.MECHANIC]: 'Mechanic',
  [WorkerCategory.CAR_WASHING]: 'Car Washing',
  [WorkerCategory.DRIVER]: 'Driver',
  [WorkerCategory.BIKE_REPAIR]: 'Bike Repair',
  [WorkerCategory.ROADSIDE_ASSISTANCE]: 'Roadside Assistance',
  [WorkerCategory.TUTOR]: 'Tutor',
  [WorkerCategory.FITNESS_TRAINER]: 'Fitness Trainer',
  [WorkerCategory.DOCTOR_NURSE]: 'Doctor/Nurse',
  [WorkerCategory.TIFFIN_SERVICE]: 'Tiffin Service',
  [WorkerCategory.BEAUTICIAN]: 'Beautician',
  [WorkerCategory.BABYSITTER]: 'Babysitter',
  [WorkerCategory.PET_SITTER]: 'Pet Sitter',
  [WorkerCategory.COOK]: 'Cook',
  [WorkerCategory.ERRAND_RUNNER]: 'Errand Runner',
  [WorkerCategory.DOCUMENTATION_ASSISTANCE]: 'Documentation',
  [WorkerCategory.TECH_SUPPORT]: 'Tech Support',
  [WorkerCategory.PHOTOGRAPHY]: 'Photography',
  [WorkerCategory.VIDEOGRAPHY]: 'Videography',
  [WorkerCategory.SECURITY]: 'Security',
  [WorkerCategory.CATERING]: 'Catering',

  // Online Categories
  [WorkerCategory.DIGITAL_MARKETING]: 'Digital & Growth',
  [WorkerCategory.CONTENT_CREATIVE]: 'Content & Creative',
  [WorkerCategory.TECH_DEV]: 'Tech & Product',
  [WorkerCategory.BUSINESS_OPS]: 'Business & Ops',
  [WorkerCategory.KNOWLEDGE_SERVICES]: 'Knowledge Services',
  [WorkerCategory.PROFESSIONAL_ADVISORY]: 'Professional Advisory',
  [WorkerCategory.WELLNESS_ONLINE]: 'Wellness & Personal',
  [WorkerCategory.CREATOR_ECONOMY]: 'Creator Economy',
  [WorkerCategory.LOCAL_BIZ_DIGITIZATION]: 'Local Biz Digitization',

  [WorkerCategory.OTHER]: 'Other',
};

export const LOWERCASE_TO_WORKER_CATEGORY = Object.fromEntries(
  Object.values(WorkerCategory).map(v => [v.toLowerCase(), v])
) as Record<string, WorkerCategory>;

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

export const ONLINE_SERVICE_GROUPS: Record<string, ServiceGroup> = {
  "Digital & Growth": {
    name: "Digital & Growth",
    icon: "📈",
    color: "blue",
    helperText: "Social media, SEO, marketing automation, and growth strategies.",
    categories: [WorkerCategory.DIGITAL_MARKETING]
  },
  "Content & Creative": {
    name: "Content & Creative",
    icon: "🎨",
    color: "pink",
    helperText: "Writing, design, video editing, and creative production.",
    categories: [WorkerCategory.CONTENT_CREATIVE]
  },
  "Tech & Product": {
    name: "Tech & Product",
    icon: "💻",
    color: "indigo",
    helperText: "Development, UI/UX, QA, AI automation, and data analysis.",
    categories: [WorkerCategory.TECH_DEV]
  },
  "Business & Operations": {
    name: "Business & Operations",
    icon: "💼",
    color: "slate",
    helperText: "Virtual assistants, project management, finance, and HR.",
    categories: [WorkerCategory.BUSINESS_OPS]
  },
  "Knowledge & Advisory": {
    name: "Knowledge & Advisory",
    icon: "🧠",
    color: "teal",
    helperText: "Tutoring, coaching, legal, financial, and business advice.",
    categories: [WorkerCategory.KNOWLEDGE_SERVICES, WorkerCategory.PROFESSIONAL_ADVISORY]
  },
  "Wellness & Personal": {
    name: "Wellness & Personal",
    icon: "🧘",
    color: "emerald",
    helperText: "Mental health, life coaching, nutrition, and fitness plans.",
    categories: [WorkerCategory.WELLNESS_ONLINE]
  },
  "Creator Economy": {
    name: "Creator Economy",
    icon: "📱",
    color: "purple",
    helperText: "UGC, personal branding, and influencer services.",
    categories: [WorkerCategory.CREATOR_ECONOMY]
  },
  "Local Biz Digitization": {
    name: "Local Biz Digitization",
    icon: "🏪",
    color: "orange",
    helperText: "Get your local business online with Google, catalogs, and more.",
    categories: [WorkerCategory.LOCAL_BIZ_DIGITIZATION]
  }
};

export const ONLINE_CATEGORIES = new Set(
  Object.values(ONLINE_SERVICE_GROUPS).flatMap(g => g.categories)
);

// Service type definitions for each category
export interface ServiceType {
  id: string;
  name: string;
  icon: string;
  description: string;
  priceRange: string;
  category: WorkerCategory;
}

// Service types mapped by category
export const SERVICE_TYPES_BY_CATEGORY: Record<WorkerCategory, ServiceType[]> = {
  [WorkerCategory.PLUMBER]: [
    { id: 'leak-repair', name: 'Leak Repair', icon: '💧', description: 'Fix leaking pipes, taps, or tanks', priceRange: '₹500-1500', category: WorkerCategory.PLUMBER },
    { id: 'installation', name: 'Installation', icon: '🔧', description: 'Install new taps, pipes, or fixtures', priceRange: '₹300-1000', category: WorkerCategory.PLUMBER },
    { id: 'blockage', name: 'Blockage Clearing', icon: '🚿', description: 'Clear blocked drains or toilets', priceRange: '₹400-1200', category: WorkerCategory.PLUMBER },
    { id: 'maintenance', name: 'Maintenance', icon: '🛠️', description: 'Regular plumbing checkup', priceRange: '₹300-800', category: WorkerCategory.PLUMBER },
  ],
  [WorkerCategory.ELECTRICIAN]: [
    { id: 'wiring', name: 'Wiring', icon: '⚡', description: 'New wiring or rewiring', priceRange: '₹800-2500', category: WorkerCategory.ELECTRICIAN },
    { id: 'fan-install', name: 'Fan Installation', icon: '🌀', description: 'Install ceiling or wall fans', priceRange: '₹400-900', category: WorkerCategory.ELECTRICIAN },
    { id: 'switch-repair', name: 'Switch/Socket Repair', icon: '🔌', description: 'Fix or replace switches and sockets', priceRange: '₹200-600', category: WorkerCategory.ELECTRICIAN },
    { id: 'appliance-install', name: 'Appliance Setup', icon: '💡', description: 'Install lights, geysers, etc.', priceRange: '₹300-1000', category: WorkerCategory.ELECTRICIAN },
  ],
  [WorkerCategory.CARPENTER]: [
    { id: 'furniture-repair', name: 'Furniture Repair', icon: '🪑', description: 'Fix broken furniture', priceRange: '₹400-1500', category: WorkerCategory.CARPENTER },
    { id: 'custom-furniture', name: 'Custom Furniture', icon: '🛋️', description: 'Build custom cabinets, tables', priceRange: '₹2000-10000', category: WorkerCategory.CARPENTER },
    { id: 'door-window', name: 'Door/Window Work', icon: '🚪', description: 'Install or repair doors and windows', priceRange: '₹600-2000', category: WorkerCategory.CARPENTER },
    { id: 'polish', name: 'Polishing', icon: '✨', description: 'Polish and refinish wood', priceRange: '₹500-2000', category: WorkerCategory.CARPENTER },
  ],
  [WorkerCategory.PAINTER]: [
    { id: 'interior', name: 'Interior Painting', icon: '🏠', description: 'Paint walls, ceilings inside', priceRange: '₹15-30/sqft', category: WorkerCategory.PAINTER },
    { id: 'exterior', name: 'Exterior Painting', icon: '🏡', description: 'Paint outside walls', priceRange: '₹20-40/sqft', category: WorkerCategory.PAINTER },
    { id: 'texture', name: 'Texture Painting', icon: '🎨', description: 'Decorative texture work', priceRange: '₹25-50/sqft', category: WorkerCategory.PAINTER },
    { id: 'touch-up', name: 'Touch-up', icon: '🖌️', description: 'Small repairs and touch-ups', priceRange: '₹300-1000', category: WorkerCategory.PAINTER },
  ],
  [WorkerCategory.MAID]: [
    { id: 'daily', name: 'Daily Cleaning', icon: '🧹', description: 'Regular daily house cleaning', priceRange: '₹3000-8000/month', category: WorkerCategory.MAID },
    { id: 'part-time', name: 'Part-time Help', icon: '⏰', description: 'Few hours per day', priceRange: '₹2000-5000/month', category: WorkerCategory.MAID },
    { id: 'full-time', name: 'Full-time Help', icon: '🏠', description: '8-10 hours daily', priceRange: '₹8000-15000/month', category: WorkerCategory.MAID },
    { id: 'cooking', name: 'Cooking + Cleaning', icon: '👩‍🍳', description: 'Meal prep and cleaning', priceRange: '₹5000-12000/month', category: WorkerCategory.MAID },
  ],
  [WorkerCategory.HOUSE_CLEANING]: [
    { id: 'deep-clean', name: 'Deep Cleaning', icon: '✨', description: 'Thorough one-time cleaning', priceRange: '₹2000-8000', category: WorkerCategory.HOUSE_CLEANING },
    { id: 'move-in-out', name: 'Move-in/out Cleaning', icon: '📦', description: 'Cleaning for moving', priceRange: '₹3000-10000', category: WorkerCategory.HOUSE_CLEANING },
    { id: 'sofa-carpet', name: 'Sofa/Carpet Cleaning', icon: '🛋️', description: 'Professional upholstery cleaning', priceRange: '₹500-3000', category: WorkerCategory.HOUSE_CLEANING },
    { id: 'kitchen-bathroom', name: 'Kitchen/Bathroom', icon: '🚿', description: 'Specialized cleaning', priceRange: '₹800-2500', category: WorkerCategory.HOUSE_CLEANING },
  ],
  [WorkerCategory.MECHANIC]: [
    { id: 'general-service', name: 'General Service', icon: '🔧', description: 'Regular car servicing', priceRange: '₹1500-5000', category: WorkerCategory.MECHANIC },
    { id: 'repair', name: 'Repair Work', icon: '🛠️', description: 'Fix specific issues', priceRange: '₹800-10000', category: WorkerCategory.MECHANIC },
    { id: 'oil-change', name: 'Oil Change', icon: '🛢️', description: 'Engine oil replacement', priceRange: '₹500-2000', category: WorkerCategory.MECHANIC },
    { id: 'inspection', name: 'Pre-purchase Inspection', icon: '🔍', description: 'Check used car condition', priceRange: '₹1000-3000', category: WorkerCategory.MECHANIC },
  ],
  [WorkerCategory.TUTOR]: [
    { id: 'school', name: 'School Tuition', icon: '📚', description: 'K-12 subject tutoring', priceRange: '₹300-1000/hr', category: WorkerCategory.TUTOR },
    { id: 'competitive', name: 'Competitive Exams', icon: '🎯', description: 'JEE, NEET, etc.', priceRange: '₹500-2000/hr', category: WorkerCategory.TUTOR },
    { id: 'language', name: 'Language Classes', icon: '🗣️', description: 'English, Hindi, etc.', priceRange: '₹300-800/hr', category: WorkerCategory.TUTOR },
    { id: 'music-art', name: 'Music/Art', icon: '🎵', description: 'Creative skills training', priceRange: '₹400-1500/hr', category: WorkerCategory.TUTOR },
  ],
  // Add default empty arrays for other categories
  [WorkerCategory.APPLIANCE_REPAIR]: [],
  [WorkerCategory.LOCKSMITH]: [],
  [WorkerCategory.PEST_CONTROL]: [],
  [WorkerCategory.GARDENER]: [],
  [WorkerCategory.LAUNDRY_SERVICE]: [],
  [WorkerCategory.PACKERS_AND_MOVERS]: [],
  [WorkerCategory.CAR_WASHING]: [],
  [WorkerCategory.DRIVER]: [],
  [WorkerCategory.BIKE_REPAIR]: [],
  [WorkerCategory.ROADSIDE_ASSISTANCE]: [],
  [WorkerCategory.FITNESS_TRAINER]: [],
  [WorkerCategory.DOCTOR_NURSE]: [],
  [WorkerCategory.TIFFIN_SERVICE]: [],
  [WorkerCategory.BEAUTICIAN]: [],
  [WorkerCategory.BABYSITTER]: [],
  [WorkerCategory.PET_SITTER]: [],
  [WorkerCategory.COOK]: [],
  [WorkerCategory.ERRAND_RUNNER]: [],
  [WorkerCategory.DOCUMENTATION_ASSISTANCE]: [],
  [WorkerCategory.TECH_SUPPORT]: [],
  [WorkerCategory.PHOTOGRAPHY]: [],
  [WorkerCategory.VIDEOGRAPHY]: [],
  [WorkerCategory.SECURITY]: [],
  [WorkerCategory.CATERING]: [],
  [WorkerCategory.OTHER]: [],

  // Online Categories
  [WorkerCategory.DIGITAL_MARKETING]: [
    { id: 'seo', name: 'SEO Optimization', icon: '🔍', description: 'Improve search rankings', priceRange: '₹5000-20000', category: WorkerCategory.DIGITAL_MARKETING },
    { id: 'social-media', name: 'Social Media Mgmt', icon: '📱', description: 'Manage social accounts', priceRange: '₹8000-30000/mo', category: WorkerCategory.DIGITAL_MARKETING },
    { id: 'ads', name: 'Ad Campaigns', icon: '📢', description: 'Google/FB Ads setup', priceRange: '₹5000-15000', category: WorkerCategory.DIGITAL_MARKETING },
  ],
  [WorkerCategory.CONTENT_CREATIVE]: [
    { id: 'blog-writing', name: 'Blog Writing', icon: '✍️', description: 'SEO-friendly articles', priceRange: '₹1000-5000', category: WorkerCategory.CONTENT_CREATIVE },
    { id: 'graphic-design', name: 'Graphic Design', icon: '🎨', description: 'Logos, banners, posts', priceRange: '₹500-5000', category: WorkerCategory.CONTENT_CREATIVE },
    { id: 'video-editing', name: 'Video Editing', icon: '🎬', description: 'Reels, YouTube edits', priceRange: '₹1000-10000', category: WorkerCategory.CONTENT_CREATIVE },
  ],
  [WorkerCategory.TECH_DEV]: [
    { id: 'web-dev', name: 'Website Development', icon: '💻', description: 'Business websites', priceRange: '₹10000-50000', category: WorkerCategory.TECH_DEV },
    { id: 'app-dev', name: 'App Development', icon: '📱', description: 'Mobile apps', priceRange: '₹50000+', category: WorkerCategory.TECH_DEV },
    { id: 'automation', name: 'Automation', icon: '🤖', description: 'Workflow automation', priceRange: '₹5000-20000', category: WorkerCategory.TECH_DEV },
  ],
  [WorkerCategory.BUSINESS_OPS]: [
    { id: 'virtual-assistant', name: 'Virtual Assistant', icon: '👩‍💼', description: 'Admin tasks', priceRange: '₹500-1500/hr', category: WorkerCategory.BUSINESS_OPS },
    { id: 'data-entry', name: 'Data Entry', icon: '⌨️', description: 'Excel/CRM work', priceRange: '₹300-800/hr', category: WorkerCategory.BUSINESS_OPS },
  ],
  [WorkerCategory.KNOWLEDGE_SERVICES]: [
    { id: 'online-tutor', name: 'Online Tutoring', icon: '📚', description: 'Academic/Skill tutoring', priceRange: '₹500-2000/hr', category: WorkerCategory.KNOWLEDGE_SERVICES },
    { id: 'career-coach', name: 'Career Coaching', icon: '🎯', description: 'Resume/Interview prep', priceRange: '₹1000-5000', category: WorkerCategory.KNOWLEDGE_SERVICES },
  ],
  [WorkerCategory.PROFESSIONAL_ADVISORY]: [
    { id: 'legal-consult', name: 'Legal Consultation', icon: '⚖️', description: 'Legal advice', priceRange: '₹2000-10000', category: WorkerCategory.PROFESSIONAL_ADVISORY },
    { id: 'finance-consult', name: 'Financial Advice', icon: '💰', description: 'Investment/Tax planning', priceRange: '₹1500-8000', category: WorkerCategory.PROFESSIONAL_ADVISORY },
  ],
  [WorkerCategory.WELLNESS_ONLINE]: [
    { id: 'therapy', name: 'Online Therapy', icon: '🧠', description: 'Mental health support', priceRange: '₹1000-3000', category: WorkerCategory.WELLNESS_ONLINE },
    { id: 'diet-plan', name: 'Diet/Nutrition Plan', icon: '🥗', description: 'Customized meal plans', priceRange: '₹1500-5000', category: WorkerCategory.WELLNESS_ONLINE },
  ],
  [WorkerCategory.CREATOR_ECONOMY]: [
    { id: 'ugc', name: 'UGC Creation', icon: '🤳', description: 'User-generated content', priceRange: '₹2000-10000', category: WorkerCategory.CREATOR_ECONOMY },
    { id: 'influencer', name: 'Influencer Collab', icon: '🤝', description: 'Brand promotion', priceRange: '₹5000+', category: WorkerCategory.CREATOR_ECONOMY },
  ],
  [WorkerCategory.LOCAL_BIZ_DIGITIZATION]: [
    { id: 'gmb', name: 'Google My Business', icon: '📍', description: 'Setup & Optimization', priceRange: '₹2000-5000', category: WorkerCategory.LOCAL_BIZ_DIGITIZATION },
    { id: 'catalog', name: 'Digital Catalog', icon: '📋', description: 'Menu/Product list', priceRange: '₹1000-4000', category: WorkerCategory.LOCAL_BIZ_DIGITIZATION },
  ],
};

// Default start location (if geo fails)
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

