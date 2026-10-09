export type UserRole = "admin" | "pharmacist_reviewer" | "customer";

/** The branch a user is responsible for, as returned on User/AuthUser. */
export interface UserBranch {
  id: string;
  branchName: string;
  slug: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  /** Null for customers, and for a pharmacist not yet assigned to a branch. */
  locationId: string | null;
  location: UserBranch | null;
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
  tags: string[];
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

export interface Testimonial {
  id: string;
  customerName: string;
  customerCategory: string | null;
  testimonialText: string;
  photoUrl: string | null;
  starRating: number;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
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
  slug: string;
  branchName: string;
  address: string;
  telephone: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: WeeklyOpeningHours | null;
  availableServices: string[];
  isActive: boolean;
  description: string | null;
  photoUrl: string | null;
}

export interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  credentials: string | null;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  locationId: string | null;
  location?: Pick<PharmacyLocation, "id" | "branchName"> | null;
}

export type ContactInquiryStatus = "new" | "in_progress" | "resolved";
export type ContactInquiryType = "general" | "health" | "product" | "service";

export interface ContactInquiry {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  subject: string | null;
  inquiryType: ContactInquiryType | null;
  message: string;
  preferredContactMethod: string | null;
  preferredBranch: string | null;
  /** Which branch this enquiry was directed at. Null on rows written before
   *  the branch relation existed — those keep only preferredBranch. */
  locationId: string | null;
  status: ContactInquiryStatus;
  createdAt: string;
  userId: string | null;
}

export type RefillRequestStatus = "submitted" | "under_review" | "approved" | "rejected" | "completed";

export interface RefillRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  preferredBranch: string | null;
  prescriptionReference: string | null;
  medicationName: string | null;
  additionalNotes: string | null;
  preferredPickupMethod: string | null;
  /** Which branch this refill was requested from. Null on rows written before
   *  the branch relation existed — those keep only preferredBranch. */
  locationId: string | null;
  status: RefillRequestStatus;
  createdAt: string;
  userId: string | null;
}

export interface SiteSetting {
  id: string;
  pharmacyName: string | null;
  aboutUs: string | null;
  mission: string | null;
  vision: string | null;
  companyHistory: string | null;
  coreValues: string[];
  whyChooseUs: string | null;
  heroHeadline: string | null;
  heroSubheading: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  whatsappUrl: string | null;
  youtubeUrl: string | null;
  announcementMessage: string | null;
  announcementActive: boolean;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
  actor: User | null;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  locationId: string | null;
  location: UserBranch | null;
}
