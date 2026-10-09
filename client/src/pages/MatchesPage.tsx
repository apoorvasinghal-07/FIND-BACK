import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CampusItem, MatchScoreResult } from '../types';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface MatchesPageProps {
  onSelectItem: (item: CampusItem) => void;
  onNavigate: (tab: string, extraParam?: string) => void;
}

export const MatchesPage: React.FC<MatchesPageProps> = ({ onSelectItem, onNavigate }) => {
  const [matches, setMatches] = useState<MatchScoreResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'high' | 'medium'>('all');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.getAllMatches();
      setMatches(res.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(m => {
    if (filterConfidence === 'high') return m.score >= 75;
    if (filterConfidence === 'medium') return m.score >= 50 && m.score < 75;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Deterministic Campus Matching Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Possible Campus Matches Matrix
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Our backend compares Lost and Found reports using verified item metadata: category taxonomy, description keyword tokens, brand equality, colour codes, campus zone proximity, and timestamp windows.
          </p>
        </div>
      </div>

      {/* Filter and Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span>Displaying <strong>{filteredMatches.length}</strong> possible match pair(s)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterConfidence('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterConfidence === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Matches ({matches.length})
            </button>
            <button
              onClick={() => setFilterConfidence('high')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterConfidence === 'high' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Confidence (≥75%)
            </button>
            <button
              onClick={() => setFilterConfidence('medium')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterConfidence === 'medium' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Moderate (50-74%)
            </button>
          </div>

          <button
            onClick={fetchMatches}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh match calculations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Match Cards List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white border border-slate-200 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="space-y-6">
          {filteredMatches.map((m, index) => {
            const isVeryHigh = m.score >= 85;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-float transition-all overflow-hidden"
              >
                {/* Match Header Bar */}
                <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isVeryHigh ? 'bg-emerald-600 text-white' : 'bg-brand-600 text-white'
                    }`}>
                      {m.score}% Algorithmic Match
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {isVeryHigh ? 'Strong Candidate for Handover' : 'Possible Match Correlation'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectItem(m.foundItem)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 group"
                  >
                    <span>Inspect Found Item File</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* 3-Column Match Comparison Layout */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Lost Item (5 cols) */}
                  <div 
                    onClick={() => onSelectItem(m.lostItem)}
                    className="lg:col-span-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-100 hover:border-rose-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                        Lost Item
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {m.lostItem.date}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      {m.lostItem.imageUrl && (
                        <img
                          src={m.lostItem.imageUrl}
                          alt={m.lostItem.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {m.lostItem.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {m.lostItem.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-rose-100/60 text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{m.lostItem.campusLocation}</span>
                    </div>
                  </div>

                  {/* Middle Column: Match Reasons Breakdown (4 cols) */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-center lg:text-left">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Why These Items Matched:
                    </span>
                    <div className="space-y-1.5">
                      {m.matchedReasons.map((reason, rIdx) => (
                        <div
                          key={rIdx}
                          className="text-xs text-slate-700 font-medium flex items-start gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-left">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Found Item (4 cols) */}
                  <div 
                    onClick={() => onSelectItem(m.foundItem)}
                    className="lg:col-span-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 hover:border-emerald-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white">
                        Found Item
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {m.foundItem.date}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      {m.foundItem.imageUrl && (
                        <img
                          src={m.foundItem.imageUrl}
                          alt={m.foundItem.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {m.foundItem.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {m.foundItem.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-100/60 text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{m.foundItem.campusLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <Sparkles className="w-12 h-12 text-brand-500 mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-slate-900">
            No matches found in this filter range
          </h3>
          <p className="text-xs text-slate-500">
            Switch filter to "All Matches" or file a new report to trigger the matching algorithm.
          </p>
          <button
            onClick={() => setFilterConfidence('all')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
          >
            Show All Matches
          </button>
        </div>
      )}
    </div>
  );
};
