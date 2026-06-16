/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'ua' | 'en' | 'ru';

export type AppTheme = 'light' | 'dark';

export type RoutePath = 
  | 'home'
  | 'how-it-works'
  | 'security'
  | 'solutions'
  | 'pricing'
  | 'payments'
  | 'faq'
  | 'contact'
  | 'login'
  | 'register'
  | 'reset-password'
  | 'dashboard'
  | 'create-deal'
  | 'transactions'
  | 'profile'
  | 'notifications'
  | 'settings'
  | 'about'
  | 'business-info'
  | 'verification'
  | 'terms'
  | 'privacy'
  | 'disputes'
  | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  companyName?: string;
  country: string;
  verified: boolean;
  emailVerified?: boolean;
  avatarUrl?: string;
  joinedAt: string;
  balance: number; // Simulated escrow balance or wallet
  role?: 'admin' | 'user';
  kyc_status?: 'Not Started' | 'Pending Review' | 'Verified' | 'Rejected';
  kyc_notes?: string;
}

export type DealRole = 'buyer' | 'seller';

export type DealStatus = 
  | 'created'       // Created but not funded
  | 'funded'        // Buyer paid, funds are in escrow
  | 'delivered'     // Seller delivered, awaiting buyer approval
  | 'released'      // Buyer approved, funds released to Seller
  | 'disputed'      // Under dispute
  | 'cancelled';    // Cancelled before funding

export interface EscrowDeal {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'UAH';
  role: DealRole; // User's role in this particular deal
  partnerEmail: string;
  partnerName: string;
  status: DealStatus;
  createdAt: string;
  deliveryDays: number;
  category: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'partner' | 'system';
    text: string;
    timestamp: string;
  }>;
}

export interface SystemNotification {
  id: string;
  title: {
    ua: string;
    en: string;
    ru: string;
  };
  description: {
    ua: string;
    en: string;
    ru: string;
  };
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}
