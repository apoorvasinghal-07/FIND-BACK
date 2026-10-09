export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface CampusItem {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  brand?: string;
  primaryColor?: string;
  campusLocation: string;
  date: string;
  time?: string;
  imageUrl?: string;
  status: ItemStatus;
  
  privateSecretClue?: string;
  custodyLocation?: string;
  
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  reporterRollNo: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantRollNo: string;
  secretProofClue: string;
  proofImageUrl?: string;
  status: ClaimStatus;
  adminNote?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Enriched fields from API
  itemTitle?: string;
  itemCategory?: string;
  itemLocation?: string;
  itemImageUrl?: string;
}

export interface MatchScoreResult {
  score: number;
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

export interface CampusStats {
  totalReports: number;
  activeLost: number;
  foundWaiting: number;
  recovered: number;
  pendingClaims: number;
  claimedInProcess: number;
  recoveryRate: number;
}
