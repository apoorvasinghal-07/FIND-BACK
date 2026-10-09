import React, { useState, useEffect } from 'react';
import { CampusItem, CampusStats } from '../types';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  PlusCircle, 
  CheckCircle2, 
  HelpCircle,
  Laptop,
  CreditCard,
  Key,
  FolderLock,
  BookOpen,
  Coffee,
  Glasses,
  MapPin,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string, extraParam?: string) => void;
  onSelectItem: (item: CampusItem) => void;
  onStartTour: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectItem, onStartTour }) => {
  const [stats, setStats] = useState<CampusStats | null>(null);
  const [recentItems, setRecentItems] = useState<CampusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, itemsData] = await Promise.all([
        api.getStats(),
        api.getItems()
      ]);
      setStats(statsData);
      setRecentItems(itemsData.items.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = [
    { name: 'Electronics', icon: Laptop, count: 'Laptops, Earbuds, Chargers' },
    { name: 'ID & Cards', icon: CreditCard, count: 'Student IDs, Library passes' },
    { name: 'Wallets & Bags', icon: FolderLock, count: 'Wallets, Backpacks, Pouches' },
    { name: 'Keys', icon: Key, count: 'Dorm keys, Bike keys' },
    { name: 'Bottles & Flasks', icon: Coffee, count: 'HydroFlask, Milton, Flasks' },
    { name: 'Books & Stationery', icon: BookOpen, count: 'Textbooks, Calculators' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('browse', searchQuery.trim());
    } else {
      onNavigate('browse');
    }
  };

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 bg-gradient-to-b from-brand-50/60 via-white to-slate-50 border-b border-slate-200/60">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Campus Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200/80 shadow-sm text-xs font-semibold text-brand-800">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <span>Official University Lost &amp; Found Portal</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Safe • Centralized • Verified</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Lost it on campus? <br />
              <span className="bg-gradient-to-r from-brand-800 via-brand-600 to-indigo-600 bg-clip-text text-transparent">
                Find your way back to it.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              No more chaotic WhatsApp groups or lost notice boards. Report lost items, register found belongings, get algorithmic smart match alerts, and safely claim your property.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
              <div className="relative flex items-center shadow-lg shadow-brand-900/5 rounded-2xl bg-white border-2 border-brand-100 focus-within:border-brand-500 transition-all p-1.5">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lost charger, wallet, bottle, ID card, keys..."
                  className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all hover:scale-105 shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('report', 'lost')}
                className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>I Lost Something</span>
              </button>

              <button
                onClick={() => onNavigate('report', 'found')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>I Found Something</span>
              </button>

              <button
                onClick={() => onNavigate('matches')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-brand-700 font-bold text-sm border border-brand-200 shadow-sm transition-all hover:border-brand-300 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>View Smart Matches</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Campus Analytics Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                <span>Live Campus Recovery Metrics</span>
              </h2>
              <p className="text-xs text-slate-500">Real-time statistics across all university departments and hostels</p>
            </div>
            <button
              onClick={loadData}
              title="Refresh stats"
              className="self-start sm:self-center text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Update Data</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs font-medium text-slate-500">Total Reports</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {stats?.totalReports ?? '--'}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Campus-wide filings</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-xs font-semibold text-rose-700">Active Lost Items</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-1">
                {stats?.activeLost ?? '--'}
              </p>
              <span className="text-[11px] text-rose-600/80 mt-1 block">Looking for matches</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700">Found &amp; Waiting</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
                {stats?.foundWaiting ?? '--'}
              </p>
              <span className="text-[11px] text-emerald-600/80 mt-1 block">Safe custody custody</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span className="text-xs font-semibold text-blue-700">Recovered to Owners</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">
                {stats?.recovered ?? '--'}
              </p>
              <span className="text-[11px] text-blue-600/80 mt-1 block">Safely handed back</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 col-span-2 md:col-span-1">
              <span className="text-xs font-semibold text-indigo-700">Recovery Rate</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-1">
                {stats?.recoveryRate ?? '--'}%
              </p>
              <div className="w-full bg-indigo-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.recoveryRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Campus Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Browse by Campus Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Find items organized by item type frequently lost on campus grounds
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => onNavigate('browse', cat.name)}
                className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {cat.count}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How Find Back Works (4-Step Campus Recovery Pipeline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-brand-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-float">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
              Safe Recovery Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              How Find Back Works on Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Designed specifically to resolve false claims, preserve student privacy, and ensure verified handovers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h3 className="font-bold text-base text-white">Report with Secret Clue</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When reporting lost items, students specify a private identifier (lockscreen wallpaper, sticker, engraving) hidden from public view.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h3 className="font-bold text-base text-white">Deterministic Smart Match</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our algorithm scores category, keywords, color, campus zone, and timestamps, producing an exact percentage confidence score.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h3 className="font-bold text-base text-white">Secure Claim Proof</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Claimants must provide the private clue to the finder and campus security. No one can claim an item by just seeing its photo.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                4
              </div>
              <h3 className="font-bold text-base text-white">Verified Safe Handover</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Once approved, verified contact details unlock for a safe exchange at campus security checkpoints. The loop is closed with 100% audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recent Campus Reports Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Recently Reported Belongings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Latest items registered across campus departments, labs, and cafeteria
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('browse', 'lost')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
            >
              Browse Lost
            </button>
            <button
              onClick={() => onNavigate('browse', 'found')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
            >
              Browse Found
            </button>
          </div>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={onSelectItem}
                onClaim={() => onSelectItem(item)}
                onFindMatches={() => onNavigate('matches')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No items reported yet. Be the first to report!</p>
          </div>
        )}
      </section>

      {/* 6. Hackathon Demo Tour Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-50 via-indigo-50 to-sky-50 rounded-3xl p-6 sm:p-8 border border-brand-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>For Hackathon Evaluators &amp; Judges</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Want to see the end-to-end recovery journey?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Launch our guided 5-step scenario to experience how Aarav lost his charger, Priya found it, the algorithm detected the match, and security verified the secret clue!
            </p>
          </div>

          <button
            onClick={onStartTour}
            className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all hover:scale-105 shrink-0 flex items-center gap-2"
          >
            <span>Launch Interactive Tour</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
