import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CampusItem, Claim, CampusStats } from '../types';
import { 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  KeyRound, 
  Check, 
  X, 
  Eye, 
  TrendingUp,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  onSelectItem: (item: CampusItem) => void;
  onNavigate: (tab: string, extraParam?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectItem, onNavigate }) => {
  const { currentUser, switchUser } = useAuth();
  
  const [stats, setStats] = useState<CampusStats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [items, setItems] = useState<CampusItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'claims' or 'items'
  const [adminTab, setAdminTab] = useState<'claims' | 'items'>('claims');
  const [claimFilter, setClaimFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [itemSearch, setItemSearch] = useState('');
  
  // Actions state
  const [actionInProgress, setActionInProgress] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, claimsRes, itemsRes] = await Promise.all([
        api.getStats(),
        api.getClaims(),
        api.getItems()
      ]);
      setStats(statsRes);
      setClaims(claimsRes.claims || []);
      setItems(itemsRes.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [currentUser]);

  const handleClaimDecision = async (claimId: string, status: 'approved' | 'rejected') => {
    try {
      setActionInProgress(true);
      await api.updateClaimStatus(
        claimId,
        status,
        status === 'approved' ? 'Verified by Campus Security' : 'Claim documentation rejected',
        currentUser.name
      );
      if (status === 'approved') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
      loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleItemStatusToggle = async (itemId: string, newStatus: string) => {
    try {
      setActionInProgress(true);
      await api.updateItemStatus(itemId, newStatus);
      loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleItemDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this campus report?')) return;
    try {
      setActionInProgress(true);
      await api.deleteItem(itemId);
      loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResetData = async () => {
    try {
      setActionInProgress(true);
      await api.resetDemoData();
      setResetMessage('Database restored to default demo state successfully!');
      setTimeout(() => setResetMessage(''), 4000);
      loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const filteredClaims = claims.filter(c => {
    if (claimFilter === 'all') return true;
    return c.status === claimFilter;
  });

  const filteredItems = items.filter(i => {
    if (!itemSearch.trim()) return true;
    const q = itemSearch.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.campusLocation.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.reporterName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Role Notice if not Admin */}
      {currentUser.role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              You are currently viewing as <strong>{currentUser.name} (Student)</strong>. For full admin privileges:
            </span>
          </div>
          <button
            onClick={() => switchUser('user-officer-raj')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition"
          >
            Switch to Officer Raj (Admin)
          </button>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-card">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Campus Security &amp; Administration Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Central Recovery Control Deck
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit lost &amp; found reports, resolve ownership claims, manage custody records, and verify returns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetData}
            disabled={actionInProgress}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${actionInProgress ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Campus Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {stats?.totalReports ?? '--'}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">Database total</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-xs text-amber-800 font-semibold">Claims Requiring Action</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {stats?.pendingClaims ?? '--'}
          </p>
          <span className="text-[11px] text-amber-700 block mt-1">Pending verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs text-rose-700 font-semibold">Active Lost Items</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            {stats?.activeLost ?? '--'}
          </p>
          <span className="text-[11px] text-rose-500 block mt-1">Unrecovered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <span className="text-xs text-emerald-700 font-semibold">Found in Custody</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {stats?.foundWaiting ?? '--'}
          </p>
          <span className="text-[11px] text-emerald-500 block mt-1">Awaiting claims</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm col-span-2 md:col-span-1">
          <span className="text-xs text-blue-700 font-semibold">Campus Recovery Rate</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {stats?.recoveryRate ?? '--'}%
          </p>
          <span className="text-[11px] text-blue-500 block mt-1">Successfully resolved</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setAdminTab('claims')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            adminTab === 'claims'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Claims Resolution Center ({claims.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('items')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            adminTab === 'items'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Campus Report Directory ({items.length})</span>
        </button>
      </div>

      {/* Tab 1: Claims Resolution Center */}
      {adminTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setClaimFilter('all')}
                className={`px-3 py-1 rounded-lg ${claimFilter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
              >
                All ({claims.length})
              </button>
              <button
                onClick={() => setClaimFilter('pending')}
                className={`px-3 py-1 rounded-lg ${claimFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setClaimFilter('approved')}
                className={`px-3 py-1 rounded-lg ${claimFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Approved
              </button>
              <button
                onClick={() => setClaimFilter('rejected')}
                className={`px-3 py-1 rounded-lg ${claimFilter === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Rejected
              </button>
            </div>
          </div>

          {filteredClaims.length > 0 ? (
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        claim.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        Claim against: {claim.itemTitle}
                      </h3>
                    </div>

                    <button
                      onClick={() => onNavigate('item-detail', claim.itemId)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Item File
                    </button>
                  </div>

                  {/* Secret clue provided by claimant */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900 block">
                      Submitted Private Ownership Clue:
                    </span>
                    <p className="text-slate-800 italic font-medium leading-relaxed">
                      "{claim.secretProofClue}"
                    </p>
                  </div>

                  {/* Claimant Profile Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Claimant</span>
                      <span className="font-bold text-slate-800">{claim.claimantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Roll No</span>
                      <span className="font-semibold text-slate-800">{claim.claimantRollNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="font-semibold text-slate-800">{claim.claimantEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone</span>
                      <span className="font-semibold text-slate-800">{claim.claimantPhone}</span>
                    </div>
                  </div>

                  {/* Decision Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      Filed on {new Date(claim.createdAt).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {claim.status !== 'rejected' && (
                        <button
                          onClick={() => handleClaimDecision(claim.id, 'rejected')}
                          disabled={actionInProgress}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                        >
                          Reject Claim
                        </button>
                      )}
                      {claim.status !== 'approved' && (
                        <button
                          onClick={() => handleClaimDecision(claim.id, 'approved')}
                          disabled={actionInProgress}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                        >
                          Approve &amp; Verify Handover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No claims currently match this filter.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Campus Report Directory Table */}
      {adminTab === 'items' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search by title, location, category, or reporter..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Reporter</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                      <div className="truncate">{item.title}</div>
                      <span className="text-[10px] text-slate-400 block font-normal">{item.category}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.type === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 truncate max-w-[150px]">
                      {item.campusLocation}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <div>{item.reporterName}</div>
                      <span className="text-[10px] text-slate-400">{item.reporterRollNo}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleItemStatusToggle(item.id, e.target.value)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                          item.status === 'returned'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : item.status === 'claimed'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="claimed">Claim In Review</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                        title="View File"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleItemDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
