import fs from 'fs';
import path from 'path';
import { CampusItem, Claim, ItemStatus } from './types';
import { INITIAL_ITEMS, INITIAL_CLAIMS } from './seed';

interface DatabaseSchema {
  items: CampusItem[];
  claims: Claim[];
}

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      items: INITIAL_ITEMS,
      claims: INITIAL_CLAIMS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      items: parsed.items || [],
      claims: parsed.claims || []
    };
  } catch (error) {
    console.error('Error reading db.json, falling back to seed:', error);
    const initialData: DatabaseSchema = {
      items: INITIAL_ITEMS,
      claims: INITIAL_CLAIMS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDatabase(data: DatabaseSchema): void {
  ensureDataDirectory();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  // Items
  getItems(filter?: {
    type?: string;
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    reporterEmail?: string;
  }): CampusItem[] {
    const { items } = loadDatabase();
    return items.filter(item => {
      if (filter?.type && filter.type !== 'all' && item.type !== filter.type) return false;
      if (filter?.category && filter.category !== 'all' && item.category !== filter.category) return false;
      if (filter?.location && filter.location !== 'all' && !item.campusLocation.toLowerCase().includes(filter.location.toLowerCase())) return false;
      if (filter?.status && filter.status !== 'all' && item.status !== filter.status) return false;
      if (filter?.reporterEmail && item.reporterEmail.toLowerCase() !== filter.reporterEmail.toLowerCase()) return false;
      if (filter?.search) {
        const query = filter.search.toLowerCase();
        const searchable = `${item.title} ${item.description} ${item.category} ${item.brand || ''} ${item.campusLocation} ${item.primaryColor || ''}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getItemById(id: string): CampusItem | undefined {
    const { items } = loadDatabase();
    return items.find(item => item.id === id);
  },

  createItem(item: CampusItem): CampusItem {
    const data = loadDatabase();
    data.items.unshift(item);
    saveDatabase(data);
    return item;
  },

  updateItem(id: string, updates: Partial<CampusItem>): CampusItem | null {
    const data = loadDatabase();
    const index = data.items.findIndex(item => item.id === id);
    if (index === -1) return null;

    data.items[index] = {
      ...data.items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(data);
    return data.items[index];
  },

  deleteItem(id: string): boolean {
    const data = loadDatabase();
    const prevLength = data.items.length;
    data.items = data.items.filter(item => item.id !== id);
    // Also remove associated claims
    data.claims = data.claims.filter(claim => claim.itemId !== id);
    saveDatabase(data);
    return data.items.length < prevLength;
  },

  // Claims
  getClaims(filter?: { itemId?: string; claimantEmail?: string; status?: string }): Claim[] {
    const { claims } = loadDatabase();
    return claims.filter(c => {
      if (filter?.itemId && c.itemId !== filter.itemId) return false;
      if (filter?.claimantEmail && c.claimantEmail.toLowerCase() !== filter.claimantEmail.toLowerCase()) return false;
      if (filter?.status && filter.status !== 'all' && c.status !== filter.status) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getClaimById(id: string): Claim | undefined {
    const { claims } = loadDatabase();
    return claims.find(c => c.id === id);
  },

  createClaim(claim: Claim): Claim {
    const data = loadDatabase();
    data.claims.unshift(claim);
    saveDatabase(data);
    return claim;
  },

  updateClaim(id: string, updates: Partial<Claim>): Claim | null {
    const data = loadDatabase();
    const index = data.claims.findIndex(c => c.id === id);
    if (index === -1) return null;

    data.claims[index] = {
      ...data.claims[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(data);
    return data.claims[index];
  },

  // Reset database to initial seed data
  resetDatabase(): void {
    const initialData: DatabaseSchema = {
      items: JSON.parse(JSON.stringify(INITIAL_ITEMS)),
      claims: JSON.parse(JSON.stringify(INITIAL_CLAIMS))
    };
    saveDatabase(initialData);
  },

  // Campus stats computation
  getStats() {
    const { items, claims } = loadDatabase();
    const totalReports = items.length;
    const activeLost = items.filter(i => i.type === 'lost' && i.status === 'open').length;
    const foundWaiting = items.filter(i => i.type === 'found' && i.status === 'open').length;
    const recovered = items.filter(i => i.status === 'returned').length;
    const pendingClaims = claims.filter(c => c.status === 'pending').length;
    const claimedInProcess = items.filter(i => i.status === 'claimed').length;
    
    // Recovery rate percentage
    const resolvedCount = recovered + claimedInProcess;
    const recoveryRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

    return {
      totalReports,
      activeLost,
      foundWaiting,
      recovered,
      pendingClaims,
      claimedInProcess,
      recoveryRate
    };
  }
};
