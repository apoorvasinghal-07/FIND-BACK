export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface CampusItem {
  id: string;
  type: ItemType; // 'lost' or 'found'
  title: string;
  category: string; // 'Electronics' | 'ID & Cards' | 'Wallets & Bags' | 'Keys' | 'Books & Stationery' | 'Bottles & Flasks' | 'Clothing & Accessories' | 'Other'
  description: string;
  brand?: string;
  primaryColor?: string;
  campusLocation: string; // e.g. "Central Library 2nd Floor", "Canteen", "CSE Lab 3", "Auditorium", etc.
  date: string; // YYYY-MM-DD
  time?: string; // approximate time e.g. "14:30"
  imageUrl?: string;
  status: ItemStatus;
  
  // Sensitive/Private fields (Hidden from public listings)
  privateSecretClue?: string; // Lost: private identifier (e.g. "Lockscreen is anime, blue sticker on back")
  custodyLocation?: string;   // Found: where finder left it (e.g. "With Security Officer at Main Gate")
  
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  reporterRollNo: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string; // The found item being claimed
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantRollNo: string;
  secretProofClue: string; // The claimant's answer proving ownership
  proofImageUrl?: string;
  status: ClaimStatus;
  adminNote?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScoreResult {
  score: number; // 0 to 100 percentage
  eligible: boolean;
  matchedReasons: string[];
  lostItem: CampusItem;
  foundItem: CampusItem;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  rollNo?: string;
  avatar: string;
}
