import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CampusItem, Claim, MatchScoreResult } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Sparkles, 
  Phone, 
  Mail, 
  User, 
  Share2, 
  Eye, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItemDetailPageProps {
  itemId: string;
  onBack: () => void;
  onSelectOtherItem: (item: CampusItem) => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({ itemId, onBack, onSelectOtherItem }) => {
  const { currentUser } = useAuth();
  const [item, setItem] = useState<CampusItem | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [matches, setMatches] = useState<MatchScoreResult[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimName, setClaimName] = useState(currentUser.name);
  const [claimEmail, setClaimEmail] = useState(currentUser.email);
  const [claimPhone, setClaimPhone] = useState('+91 98765 43210');
  const [claimRollNo, setClaimRollNo] = useState(currentUser.rollNo || '');
  const [secretProofClue, setSecretProofClue] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState('');
  const [claimErrorMessage, setClaimErrorMessage] = useState('');

  // Photo zoom modal
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const [itemRes, matchRes, claimRes] = await Promise.all([
        api.getItem(itemId),
        api.getMatchesForItem(itemId).catch(() => ({ matches: [] })),
        api.getClaims({ itemId }).catch(() => ({ claims: [] }))
      ]);

      setItem(itemRes.item);
      setIsAuthorized(itemRes.isAuthorized);
      setMatches(matchRes.matches || []);
      setClaims(claimRes.claims || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [itemId, currentUser]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretProofClue.trim()) {
      setClaimErrorMessage('Please provide your private ownership clue');
      return;
    }

    try {
      setClaimSubmitting(true);
      setClaimErrorMessage('');
      const formData = new FormData();
      formData.append('itemId', itemId);
      formData.append('claimantName', claimName.trim());
      formData.append('claimantEmail', claimEmail.trim());
      formData.append('claimantPhone', claimPhone.trim());
      formData.append('claimantRollNo', claimRollNo.trim());
      formData.append('secretProofClue', secretProofClue.trim());

      const res = await api.submitClaim(formData);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setClaimSuccessMessage(res.message);
      setTimeout(() => {
        setClaimModalOpen(false);
        setClaimSuccessMessage('');
        fetchItemDetails();
      }, 2000);
    } catch (err: any) {
      setClaimErrorMessage(err.message || 'Failed to submit claim');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleClaimDecision = async (claimId: string, decision: 'approved' | 'rejected') => {
    try {
      setUpdatingStatus(true);
      await api.updateClaimStatus(
        claimId,
        decision,
        decision === 'approved' ? 'Verified in person/by secret clue matching' : 'Insufficient ownership proof provided',
        currentUser.name
      );
      if (decision === 'approved') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      fetchItemDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkReturned = async () => {
    try {
      setUpdatingStatus(true);
      await api.markItemReturned(itemId);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      fetchItemDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading item verification file...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Item Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested item report may have been deleted or moved.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const isLost = item.type === 'lost';
  const hasApprovedClaim = claims.some(c => c.status === 'approved');
  const isFinderOrAdmin = currentUser.role === 'admin' || (currentUser.email && item.reporterEmail.toLowerCase() === currentUser.email.toLowerCase());

  // Determine stage in recovery timeline (1 to 5)
  let currentStage = 1; // Reported
  if (matches.length > 0) currentStage = 2; // Match found
  if (claims.length > 0 || item.status === 'claimed') currentStage = 3; // Claim submitted
  if (hasApprovedClaim) currentStage = 4; // Claim approved
  if (item.status === 'returned') currentStage = 5; // Safely returned

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </button>
      </div>

      {/* Main Item Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        {/* Top Status Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isLost ? 'Lost Item File' : 'Found Item File'}
            </span>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Ref: {item.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {item.status === 'returned' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Safely Returned to Owner
              </span>
            ) : item.status === 'claimed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                <AlertCircle className="w-3.5 h-3.5" />
                Under Claim Verification
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                <Sparkles className="w-3.5 h-3.5" />
                Active / Open
              </span>
            )}
          </div>
        </div>

        {/* 5-Step Progress Timeline */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Campus Recovery Lifecycle Tracker
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { stage: 1, label: '1. Reported' },
              { stage: 2, label: '2. Smart Match' },
              { stage: 3, label: '3. Claim Filed' },
              { stage: 4, label: '4. Verified' },
              { stage: 5, label: '5. Returned' }
            ].map(step => {
              const completed = currentStage >= step.stage;
              const isCurrent = currentStage === step.stage;
              return (
                <div key={step.stage} className="space-y-1">
                  <div className={`h-2 rounded-full transition-all ${
                    completed ? (step.stage === 5 ? 'bg-blue-600' : 'bg-emerald-500') : 'bg-slate-200'
                  }`} />
                  <span className={`text-[10px] sm:text-xs block truncate ${
                    isCurrent ? 'font-bold text-slate-900' : completed ? 'font-semibold text-slate-700' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Details Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image & Media (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div 
              onClick={() => item.imageUrl && setZoomModalOpen(true)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group shadow-sm"
            >
              {item.imageUrl ? (
                <>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5" /> Click to Zoom
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Tag className="w-12 h-12 mb-2 opacity-40" />
                  <p className="text-xs font-semibold text-slate-500">No photo provided</p>
                  <p className="text-[11px] text-slate-400 mt-1">Verification relies on location &amp; secret clue</p>
                </div>
              )}
            </div>

            {/* Quick Specs Pill Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 text-[11px] block font-medium">Category</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{item.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 text-[11px] block font-medium">Brand</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{item.brand || 'Unspecified'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 text-[11px] block font-medium">Primary Colour</span>
                <span className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  {item.primaryColor && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block"
                      style={{ backgroundColor: item.primaryColor.toLowerCase() }}
                    />
                  )}
                  {item.primaryColor || 'Not specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 text-[11px] block font-medium">Date Filed</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{item.date}</span>
              </div>
            </div>

            {/* Action buttons on found item */}
            {!isLost && item.status !== 'returned' && (
              <div className="pt-2">
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>This is Mine — Claim Item</span>
                </button>
              </div>
            )}

            {/* Mark as Returned button for admin or finder */}
            {isFinderOrAdmin && item.status !== 'returned' && (
              <div className="pt-1">
                <button
                  onClick={handleMarkReturned}
                  disabled={updatingStatus}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Handover &amp; Mark as Returned</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Descriptions, Privacy & Match Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {item.campusLocation}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  {item.date} {item.time && `@ ${item.time}`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Report Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Custody location if found */}
            {!isLost && item.custodyLocation && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Current Custody &amp; Safe Storage Location
                </span>
                <p className="text-emerald-800 leading-relaxed font-medium">
                  {item.custodyLocation}
                </p>
              </div>
            )}

            {/* Private Secret Clue Box */}
            {isLost && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Private Ownership Secret Clue
                  </span>
                  {isAuthorized ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Authorized View
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Protected
                    </span>
                  )}
                </div>
                <p className="text-amber-800 leading-relaxed font-medium font-mono text-[11px]">
                  {item.privateSecretClue || '🔒 Hidden for verification integrity'}
                </p>
              </div>
            )}

            {/* Reporter Contact Info with Privacy Shield */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Campus Identity &amp; Contact Shield</span>
                </h3>
                {isAuthorized ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private Mode
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Reporter Name</span>
                  <span className="font-semibold text-slate-800">{item.reporterName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Campus Roll / Staff ID</span>
                  <span className="font-semibold text-slate-800">{item.reporterRollNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-semibold text-slate-800">{item.reporterEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="font-semibold text-slate-800">{item.reporterPhone}</span>
                </div>
              </div>

              {!isAuthorized && (
                <p className="text-[11px] text-slate-400 border-t border-slate-200/60 pt-2">
                  🔒 Full contact info is protected by university policy and only unlocked when an authorized claim is verified.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claims Management Section (Visible for Finder or Admin) */}
      {isFinderOrAdmin && claims.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Submitted Ownership Claims ({claims.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Compare claimant's secret proof against item details to approve or reject
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <div 
                key={claim.id}
                className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{claim.claimantName}</span>
                    <span className="text-xs text-slate-500 ml-2">({claim.claimantRollNo})</span>
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

                {/* Secret Proof Clue */}
                <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">Claimant's Secret Proof Clue:</span>
                  <p className="text-slate-800 italic font-medium leading-relaxed">
                    "{claim.secretProofClue}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-amber-100">
                  <div className="space-x-3">
                    <span>Phone: {claim.claimantPhone}</span>
                    <span>Email: {claim.claimantEmail}</span>
                  </div>

                  {claim.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleClaimDecision(claim.id, 'rejected')}
                        disabled={updatingStatus}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleClaimDecision(claim.id, 'approved')}
                        disabled={updatingStatus}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
                      >
                        Approve &amp; Unlock Contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Matches Section right on the item details page */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Smart Algorithmic Matches for this Item ({matches.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated mathematically using category, keywords, color, campus zone, and timestamps
            </p>
          </div>
        </div>

        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((m, idx) => {
              const matchedItem = isLost ? m.foundItem : m.lostItem;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-600 text-white">
                        {m.score}% Match Score
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        matchedItem.type === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {matchedItem.type.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {matchedItem.title}
                      </h4>
                    </div>

                    {/* Breakdown Reasons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.matchedReasons.map((reason, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[11px] font-medium"
                        >
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => onSelectOtherItem(matchedItem)}
                      className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition"
                    >
                      Inspect Match
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No high-confidence opposite reports detected on campus yet. We will notify you when a match is filed!
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setClaimModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <span>Submit Ownership Claim</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                To prevent fraud, provide proof that only the legitimate owner would know
              </p>
            </div>

            <form onSubmit={handleClaimSubmit} className="p-6 space-y-4">
              {claimErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {claimErrorMessage}
                </div>
              )}
              {claimSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  {claimSuccessMessage}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Private Ownership Clue / Secret Identifier *
                </label>
                <textarea
                  rows={3}
                  value={secretProofClue}
                  onChange={(e) => setSecretProofClue(e.target.value)}
                  placeholder="e.g. Describe lockscreen image, what stickers/markings are on it, what is inside the wallet/bag, serial number, etc."
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 leading-relaxed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  This will only be revealed to the finder &amp; verified security desk.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Roll / ID No</label>
                  <input
                    type="text"
                    value={claimRollNo}
                    onChange={(e) => setClaimRollNo(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Email</label>
                  <input
                    type="email"
                    value={claimEmail}
                    onChange={(e) => setClaimEmail(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                >
                  {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {zoomModalOpen && item.imageUrl && (
        <div 
          onClick={() => setZoomModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setZoomModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
