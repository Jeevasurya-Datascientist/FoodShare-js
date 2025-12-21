import { Timestamp } from 'firebase/firestore';

export type UserRole = 'donor' | 'ngo' | 'volunteer';

export type DonationStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  organizationName?: string;
  photoURL?: string;
  bio?: string;
  location?: Location; // Added for NGO/Volunteer location tracking
  ipAddress?: string; // Captured for security
  userAgent?: string; // Captured for security
  stats?: {
    totalDonations: number;
    peopleFed: number;
    karmaPoints: number;
    ratingSum?: number;
    reviewCount?: number;
  };
  accountStatus?: 'active' | 'suspended' | 'banned'; // Added for Admin control
  warningCount?: number; // Added for Admin control
  suspendedUntil?: Timestamp; // Firestore Timestamp for suspension end
  createdAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone?: string; // Kept for backward compatibility or direct user profile phone
  title: string;
  description: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  imageUrls: string[]; // Array of image URLs
  contactPhone: string; // Specific contact for this donation
  countryCode: string;
  location: Location;
  status: DonationStatus;
  acceptedBy?: string;
  acceptedByName?: string;
  acceptedByPhone?: string;
  acceptedByAddress?: string; // Added for multi-stop navigation
  volunteerId?: string; // ID of the volunteer assigned for pickup
  volunteerName?: string;
  volunteerPhone?: string;
  deliveryStatus?: 'available_for_pickup' | 'assigned' | 'picked_up' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  targetUserId: string;
  donationId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface DonationFormData {
  title: string;
  description: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: Location;
  imageUrls: string[];
  contactPhone: string;
  countryCode: string;
}

export interface Chat {
  id: string;
  participants: string[]; // User IDs
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: { [userId: string]: number };
  donationId?: string; // Optional: Link chat to a specific donation
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  readBy: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string; // kg, lbs, items
  expiryDate: Date;
  category: string; // Grains, Vegetables, Dairy, etc.
  lowStockThreshold?: number;
  lastUpdated: Date;
}

export interface Recipe {
  title: string;
  description: string;
  difficulty: string;
  time: string;
  ingredients?: string[];
  instructions?: string[];
  savedAt?: Date; // For bookkeeping
}
