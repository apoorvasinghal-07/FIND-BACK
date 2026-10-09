import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Search, 
  Sparkles, 
  User, 
  ShieldCheck, 
  PlusCircle, 
  Menu, 
  X, 
  FileText,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, extraParam?: string) => void;
  onStartTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onStartTour }) => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'browse', label: 'Browse All Items', icon: Search },
    { id: 'matches', label: 'Smart Matches', icon: Sparkles, badge: 'Live AI-free' },
    { id: 'activity', label: 'My Activity', icon: FileText },
    ...(currentUser.role === 'admin'
      ? [{ id: 'admin', label: 'Admin Center', icon: ShieldCheck, badge: 'Admin' }]
      : [{ id: 'admin', label: 'Admin Center', icon: ShieldCheck }]),
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleLinkClick('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-800 to-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-900/20 ring-2 ring-brand-500/20">
              <Compass className="w-5 h-5 text-sky-300 transform -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Find<span className="text-brand-600">Back</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Campus
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Smart Campus Lost &amp; Found
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-brand-700 bg-brand-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      link.badge === 'Admin' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-brand-100 text-brand-700'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Report Lost / Report Found */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <button
              onClick={() => {
                onNavigate('report', 'lost');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 shadow-sm transition-all hover:shadow"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Report Lost
            </button>

            <button
              onClick={() => {
                onNavigate('report', 'found');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-200" />
              Report Found
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => onNavigate('report', 'lost')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md text-rose-700 bg-rose-50 border border-rose-200"
            >
              Lost
            </button>
            <button
              onClick={() => onNavigate('report', 'found')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md text-white bg-brand-600"
            >
              Found
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={onStartTour}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Launch Guided Demo Tour
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
