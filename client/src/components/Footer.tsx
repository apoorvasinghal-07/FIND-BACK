import React from 'react';
import { Compass, ShieldCheck, MapPin, Phone, Lock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4 text-sky-200" />
              </div>
              <span className="font-bold text-lg text-white">
                Find<span className="text-brand-400">Back</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lost it on campus? Find your way back to it. Centralized intelligent campus recovery platform replacing chaotic WhatsApp groups.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus ID Verified Protocol</span>
            </div>
          </div>

          {/* Safe Campus Recovery Rules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Safe Recovery Guidelines
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>Always meet at authorized designated zones (Library Desk, Gate 1 Security Booth).</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>Private verification clues protect true owners from fraudulent claims.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>Contact information is only unlocked once an authorized claim is approved.</span>
              </li>
            </ul>
          </div>

          {/* Campus Zones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Campus Help Desks
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>Central Library — Ground Floor Circulation Counter</li>
              <li>Admin Block — Campus Security Control Room (Ext. 402)</li>
              <li>Student Affairs Center — Room 104, Block B</li>
              <li>Sports Complex — Equipment Check-in Office</li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Campus Security Hotline
            </h4>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 (0) 123-456-7890</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Available 24x7 for high-value items (laptops, wallets, passports, keys).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Find Back — Smart Campus Lost &amp; Found. Built for University Hackathon.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineered with care for campus students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
