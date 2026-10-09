import React from 'react';
import { CampusItem } from '../types';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface ItemCardProps {
  item: CampusItem;
  onClick: (item: CampusItem) => void;
  onClaim?: (item: CampusItem) => void;
  onFindMatches?: (item: CampusItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, onClaim, onFindMatches }) => {
  const isLost = item.type === 'lost';

  // Format date nicely
  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={() => onClick(item)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Image Banner */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback placeholder if image link fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <Tag className="w-10 h-10 mb-1 opacity-50" />
            <span className="text-xs font-medium">No photo uploaded</span>
          </div>
        )}

        {/* Status & Type Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
            isLost 
              ? 'bg-rose-600 text-white shadow-rose-900/20' 
              : 'bg-emerald-600 text-white shadow-emerald-900/20'
          }`}>
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          {item.status === 'returned' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
              <CheckCircle className="w-3 h-3" />
              Returned
            </span>
          )}

          {item.status === 'claimed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
              <AlertCircle className="w-3 h-3" />
              Claim In Review
            </span>
          )}
        </div>

        {/* Category Pill on bottom right of image */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium shadow-sm">
            {item.category}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Brand & Color Tags */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            {item.brand && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                {item.brand}
              </span>
            )}
            {item.primaryColor && (
              <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                <span 
                  className="w-2 h-2 rounded-full border border-slate-300"
                  style={{ backgroundColor: item.primaryColor.toLowerCase() }}
                />
                {item.primaryColor}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
            {item.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Meta Info & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          {/* Location & Date */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium truncate max-w-[65%]" title={item.campusLocation}>
              <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="truncate">{item.campusLocation}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] shrink-0">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Bottom Card Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-600 group-hover:text-brand-700 flex items-center gap-1">
              View Details
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>

            {!isLost && item.status === 'open' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClaim) onClaim(item);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              >
                Claim This
              </button>
            )}

            {isLost && item.status === 'open' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFindMatches) onFindMatches(item);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition"
              >
                Smart Matches
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
