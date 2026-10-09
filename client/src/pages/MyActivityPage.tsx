import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CampusItem, Claim } from '../types';
import { 
  FileText, 
  Sparkles, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Calendar,
  ArrowRight,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

interface MyActivityPageProps {
  onSelectItem: (item: CampusItem) => void;
  onNavigate: (tab: string, extraParam?: string) => void;
}

export const MyActivityPage: React.FC<MyActivityPageProps> = ({ onSelectItem, onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'claims'>('lost');
  
  const [myItems, setMyItems] = useState<CampusItem[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const [itemsRes, claimsRes] = await Promise.all([
        api.getItems({ reporterEmail: currentUser.email }),
        api.getClaims({ claimantEmail: currentUser.email })
      ]);
      setMyItems(itemsRes.items || []);
      setMyClaims(claimsRes.claims || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [currentUser]);

  const lostItems = myItems.filter(i => i.type === 'lost');
  const foundItems = myItems.filter(i => i.type === 'found');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* User Header Profile */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {currentUser.name}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                currentUser.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-700'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll No: <strong>{currentUser.rollNo || 'N/A'}</strong> • {currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('report', 'lost')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
          >
            Report Lost
          </button>
          <button
            onClick={() => onNavigate('report', 'found')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm"
          >
            Report Found
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lost'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Items I Lost</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
            {lostItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'found'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Items I Found</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700">
            {foundItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'claims'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Submitted Claims</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
            {myClaims.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading your campus records...</div>
      ) : activeTab === 'lost' ? (
        /* Lost items tab */
        lostItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-brand-300 shadow-sm hover:shadow-card transition cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'returned'
                      ? 'bg-blue-100 text-blue-800'
                      : item.status === 'claimed'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.status === 'returned' ? 'Returned' : item.status === 'claimed' ? 'Claim In Progress' : 'Active Lost'}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                </div>

                <div className="flex gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.campusLocation}
                  </span>
                  <span className="font-bold text-brand-600 flex items-center gap-1">
                    Details &amp; Matches <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-600">You haven't reported any lost items yet.</p>
            <button
              onClick={() => onNavigate('report', 'lost')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
            >
              Report a Lost Belonging
            </button>
          </div>
        )
      ) : activeTab === 'found' ? (
        /* Found items tab */
        foundItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foundItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-card transition cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'returned'
                      ? 'bg-blue-100 text-blue-800'
                      : item.status === 'claimed'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                </div>

                <div className="flex gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.campusLocation}
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    Manage Claims <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-600">You haven't reported finding any belongings yet.</p>
            <button
              onClick={() => onNavigate('report', 'found')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white"
            >
              Report a Found Item
            </button>
          </div>
        )
      ) : (
        /* Claims tab */
        myClaims.length > 0 ? (
          <div className="space-y-4">
            {myClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {claim.itemTitle || 'Claimed Item'}
                    </span>
                    <span className="text-xs text-slate-400">({claim.itemLocation})</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    claim.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : claim.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {claim.status}
                  </span>
                </div>

                {/* Submitted clue */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Your Private Ownership Proof:</span>
                  <p className="text-slate-600 italic">"{claim.secretProofClue}"</p>
                </div>

                {claim.adminNote && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <span className="font-bold block">Reviewer Decision Note:</span>
                    <p>{claim.adminNote}</p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Filed on {new Date(claim.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => onNavigate('item-detail', claim.itemId)}
                    className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    View Item File <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-600">You haven't submitted any ownership claims yet.</p>
            <button
              onClick={() => onNavigate('browse', 'found')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white"
            >
              Browse Found Items
            </button>
          </div>
        )
      )}
    </div>
  );
};
