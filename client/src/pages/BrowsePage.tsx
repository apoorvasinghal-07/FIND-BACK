import React, { useState, useEffect } from 'react';
import { CampusItem } from '../types';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  PlusCircle, 
  MapPin, 
  Tag, 
  CheckCircle,
  HelpCircle,
  SlidersHorizontal
} from 'lucide-react';

interface BrowsePageProps {
  initialFilter?: string;
  onSelectItem: (item: CampusItem) => void;
  onNavigate: (tab: string, extraParam?: string) => void;
}

export const BrowsePage: React.FC<BrowsePageProps> = ({ initialFilter, onSelectItem, onNavigate }) => {
  const [items, setItems] = useState<CampusItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [location, setLocation] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Handle initial filter prop (e.g. from Home search or category click)
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter === 'lost' || initialFilter === 'found') {
        setType(initialFilter);
      } else if ([
        'Electronics', 
        'ID & Cards', 
        'Wallets & Bags', 
        'Keys', 
        'Bottles & Flasks', 
        'Books & Stationery'
      ].includes(initialFilter)) {
        setCategory(initialFilter);
      } else {
        setSearch(initialFilter);
      }
    }
  }, [initialFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.getItems({
        type: type !== 'all' ? type : undefined,
        category: category !== 'all' ? category : undefined,
        location: location !== 'all' ? location : undefined,
        status: status !== 'all' ? status : undefined,
        search: search.trim() || undefined
      });

      let sorted = [...res.items];
      if (sortBy === 'oldest') {
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else {
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      setItems(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, category, location, status, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setLocation('all');
    setStatus('all');
    setSortBy('newest');
  };

  const hasActiveFilters = search || type !== 'all' || category !== 'all' || location !== 'all' || status !== 'all';

  const categoryOptions = [
    'All Categories',
    'Electronics',
    'ID & Cards',
    'Wallets & Bags',
    'Keys',
    'Bottles & Flasks',
    'Books & Stationery',
    'Clothing & Accessories',
    'Other'
  ];

  const locationOptions = [
    'All Locations',
    'Central Library',
    'Central Canteen',
    'CSE Department Lab 3',
    'Sports Complex Gym',
    'Main Auditorium',
    'Student Parking Lot B',
    'Exam Hall B, Science Block',
    'Hostels'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse All Campus Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and track verified lost belongings and found property across campus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('report', 'lost')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shadow-sm"
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

      {/* Main Filter & Search Control Panel */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        {/* Top row: Search and Type Pills */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item name, brand, color, keywords, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Selector (All / Lost / Found) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full lg:w-auto shrink-0">
            <button
              onClick={() => setType('all')}
              className={`flex-1 lg:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setType('lost')}
              className={`flex-1 lg:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 hover:bg-rose-100/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Lost Items
            </button>
            <button
              onClick={() => setType('found')}
              className={`flex-1 lg:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-100/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Found Items
            </button>
          </div>
        </div>

        {/* Bottom row: Dropdown filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Category Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs font-medium p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt === 'All Categories' ? 'all' : opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Campus Zone</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs font-medium p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
            >
              {locationOptions.map((opt) => (
                <option key={opt} value={opt === 'All Locations' ? 'all' : opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs font-medium p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Active / Open</option>
              <option value="claimed">Claim In Review</option>
              <option value="returned">Safely Returned</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs font-medium p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Most Recent First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
            <button
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className="w-full p-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{items.length}</strong> matching report(s)
        </span>
        {hasActiveFilters && (
          <span className="text-brand-600 font-semibold">
            Filtered view active
          </span>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 space-y-4">
              <div className="h-40 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
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
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No matching items found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            We couldn't find any reports matching your current filter criteria. Try adjusting keywords, campus zone, or clearing the filter.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Reset Filters
            </button>
            <button
              onClick={() => onNavigate('report', 'lost')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
            >
              Report a New Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
