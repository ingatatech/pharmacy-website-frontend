export type UserRole = "admin" | "pharmacist_reviewer";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type CategoryType = "service" | "product";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string | null;
  imageUrl: string | null;
  keyBenefit: string | null;
  intendedCustomers: string | null;
  requirements: string | null;
  process: string | null;
  limitations: string | null;
  category: Category | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductAvailabilityStatus = "in_stock" | "out_of_stock" | "unknown";

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandName: string | null;
  category: Category | null;
  generalDescription: string | null;
  generalUse: string | null;
  precautions: string | null;
  storageInformation: string | null;
  activeIngredient: string | null;
  formStrength: string | null;
  manufacturer: string | null;
  dosageInformation: string | null;
  requiresPrescription: boolean;
  availabilityStatus: ProductAvailabilityStatus;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ArticleStatus = "draft" | "pending_review" | "approved" | "published";

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImageUrl: string | null;
  category: string | null;
  tags: string[] | null;
  author: User;
  reviewer: User | null;
  status: ArticleStatus;
  publishedAt: string | null;
  lastReviewedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface WeeklyOpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface PharmacyLocation {
  id: string;
  branchName: string;
  address: string;
  telephone: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: WeeklyOpeningHours | null;
  availableServices: string[] | null;
  isActive: boolean;
}
