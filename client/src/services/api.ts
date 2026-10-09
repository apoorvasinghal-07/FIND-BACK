import { CampusItem, Claim, CampusStats, MatchScoreResult } from '../types';

const getHeaders = (isFormData = false): HeadersInit => {
  const savedUser = localStorage.getItem('findback_current_user');
  let email = 'aarav.sharma@campus.edu';
  let role = 'student';

  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      email = user.email || email;
      role = user.role || role;
    } catch {}
  }

  const headers: Record<string, string> = {
    'x-user-email': email,
    'x-user-role': role,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export const api = {
  // Items
  async getItems(params?: {
    type?: string;
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    reporterEmail?: string;
  }): Promise<{ items: CampusItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'all') query.append(key, val);
      });
    }
    const res = await fetch(`/api/items?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  async getItem(id: string): Promise<{ item: CampusItem; isAuthorized: boolean }> {
    const res = await fetch(`/api/items/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch item details');
    return res.json();
  },

  async createItem(formData: FormData): Promise<{ item: CampusItem; message: string }> {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit item report');
    }
    return res.json();
  },

  async updateItemStatus(id: string, status: string): Promise<{ item: CampusItem }> {
    const res = await fetch(`/api/items/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async deleteItem(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
  },

  // Smart Matching
  async getMatchesForItem(itemId: string): Promise<{ baseItem: CampusItem; matches: MatchScoreResult[]; totalMatches: number }> {
    const res = await fetch(`/api/matches/${itemId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch matches for item');
    return res.json();
  },

  async getAllMatches(): Promise<{ matches: MatchScoreResult[]; total: number }> {
    const res = await fetch('/api/matches', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch campus matches');
    return res.json();
  },

  // Claims
  async submitClaim(formData: FormData): Promise<{ claim: Claim; message: string }> {
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit ownership claim');
    }
    return res.json();
  },

  async getClaims(params?: {
    itemId?: string;
    claimantEmail?: string;
    status?: string;
  }): Promise<{ claims: Claim[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'all') query.append(key, val);
      });
    }
    const res = await fetch(`/api/claims?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
  },

  async updateClaimStatus(
    claimId: string,
    status: 'approved' | 'rejected' | 'pending',
    adminNote?: string,
    reviewedBy?: string
  ): Promise<{ claim: Claim; message: string }> {
    const res = await fetch(`/api/claims/${claimId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNote, reviewedBy }),
    });
    if (!res.ok) throw new Error('Failed to update claim');
    return res.json();
  },

  async markItemReturned(itemId: string): Promise<{ item: CampusItem; message: string }> {
    const res = await fetch(`/api/items/${itemId}/return`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark item as returned');
    return res.json();
  },

  // Stats & Demo Reset
  async getStats(): Promise<CampusStats> {
    const res = await fetch('/api/stats', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch campus stats');
    return res.json();
  },

  async resetDemoData(): Promise<{ message: string }> {
    const res = await fetch('/api/demo/reset', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },
};
