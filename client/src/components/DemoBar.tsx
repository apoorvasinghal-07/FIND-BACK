import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, RotateCcw, ShieldCheck, UserCheck, Play } from 'lucide-react';

interface DemoBarProps {
  onStartTour: () => void;
  onDataReset?: () => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({ onStartTour, onDataReset }) => {
  const { currentUser, switchUser, availableUsers } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (resetting) return;
    try {
      setResetting(true);
      await api.resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
      if (onDataReset) onDataReset();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white text-xs py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Hackathon badge & quick tour trigger */}
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 font-semibold tracking-wide uppercase text-[10px]">
            <Sparkles className="w-3 h-3 text-brand-400 animate-pulse" />
            Hackathon Demo Mode
          </div>
          <button
            onClick={onStartTour}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium shadow-sm transition-all hover:scale-105"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>5-Step Guided Demo Flow</span>
          </button>
        </div>

        {/* Right: Quick Persona Switcher & Reset */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <span className="text-slate-400 hidden md:inline">Current Persona:</span>
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            {availableUsers.map(user => {
              const active = currentUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => switchUser(user.id)}
                  title={`${user.name} (${user.role})`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-xs ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-4 h-4 rounded-full object-cover border border-white/20"
                  />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  {user.role === 'admin' ? (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 hidden lg:inline">
                      ({user.rollNo?.split('-')[0]})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset campus reports and claims to initial demo state"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin text-brand-400' : ''}`} />
            <span className="hidden sm:inline">{resetSuccess ? 'Reset!' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
