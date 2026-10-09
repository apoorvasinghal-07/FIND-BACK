import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Laptop, 
  Search, 
  KeyRound, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GuidedDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extraParam?: string) => void;
}

export const GuidedDemoTour: React.FC<GuidedDemoTourProps> = ({ isOpen, onClose, onNavigate }) => {
  const { switchUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Campus Hackathon Demo Scenario",
      subtitle: "Why Find Back Replaces WhatsApp Groups & Notice Boards",
      persona: "Aarav Sharma (Student)",
      personaId: "user-aarav",
      icon: Sparkles,
      badge: "Scenario Setup",
      description: (
        <div className="space-y-3 text-slate-600 text-sm">
          <p>
            Welcome to the <strong>Find Back</strong> live presentation tour! This interactive walkthrough demonstrates the complete student journey across campus:
          </p>
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl space-y-1.5 text-xs text-brand-900 font-medium">
            <p>1. Aarav loses his HP 65W laptop charger at CSE Lab 3.</p>
            <p>2. Priya finds an HP power adapter in Lab 3 and reports it.</p>
            <p>3. Smart matching engine automatically pairs them with 98% confidence.</p>
            <p>4. Aarav submits an ownership claim with a private secret clue.</p>
            <p>5. Security Admin verifies the clue, unlocks contact, and confirms return!</p>
          </div>
          <p className="text-xs text-slate-500">
            Click <strong>Next Step</strong> to follow each action automatically or jump directly to relevant screens.
          </p>
        </div>
      ),
      actionButton: {
        label: "Start Demo as Aarav",
        action: () => {
          switchUser('user-aarav');
          onNavigate('home');
        }
      }
    },
    {
      title: "Step 1: Aarav Reports Lost HP Charger",
      subtitle: "Includes a confidential private ownership clue",
      persona: "Aarav Sharma (Student)",
      personaId: "user-aarav",
      icon: Laptop,
      badge: "Lost Report",
      description: (
        <div className="space-y-3 text-slate-600 text-sm">
          <p>
            Aarav notices his charger is missing after compiler class. He files a report on Find Back:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1.5 text-slate-600">
            <li><strong>Item:</strong> HP 65W USB-C Laptop Charger</li>
            <li><strong>Location:</strong> CSE Department Lab 3</li>
            <li><strong>Category:</strong> Electronics | Color: Black</li>
            <li>
              <strong className="text-rose-700">🔒 Secret Verification Clue:</strong> "Orange electric tape wrapped 2 inches from the plug." (Kept strictly hidden from the public).
            </li>
          </ul>
          <p className="text-xs text-slate-500">
            His private phone and roll number are shielded from public view by the Campus Privacy Shield.
          </p>
        </div>
      ),
      actionButton: {
        label: "View Aarav's Report in Browse",
        action: () => {
          switchUser('user-aarav');
          onNavigate('browse', 'lost');
          onClose();
        }
      }
    },
    {
      title: "Step 2: Priya Reports Found Item",
      subtitle: "Good Samaritan records finding the item in Lab 3",
      persona: "Priya Patel (Student)",
      personaId: "user-priya",
      icon: Search,
      badge: "Found Report",
      description: (
        <div className="space-y-3 text-slate-600 text-sm">
          <p>
            Later that afternoon, Priya spots the charger left plugged into a desk power strip in CSE Lab 3.
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1.5 text-slate-600">
            <li>She snaps a photo and lists it as <strong>Found</strong>.</li>
            <li><strong>Custody Note:</strong> Kept safely with finder until claimed.</li>
            <li>Priya does not post secret markings so dishonest claimants cannot fabricate ownership.</li>
          </ul>
        </div>
      ),
      actionButton: {
        label: "Switch to Priya & View Found Items",
        action: () => {
          switchUser('user-priya');
          onNavigate('browse', 'found');
          onClose();
        }
      }
    },
    {
      title: "Step 3: Deterministic Smart Match Found (98%)",
      subtitle: "Mathematical multi-factor scoring — no fake AI claims",
      persona: "System Match Engine",
      personaId: "user-aarav",
      icon: Sparkles,
      badge: "Smart Match Engine",
      description: (
        <div className="space-y-3 text-slate-600 text-sm">
          <p>
            The backend matching algorithm calculates actual similarity across 5 criteria:
          </p>
          <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 font-mono">
            <p className="text-emerald-400">✓ Category: Electronics (35 pts)</p>
            <p className="text-emerald-400">✓ Brand: "HP" (12 pts)</p>
            <p className="text-emerald-400">✓ Color: "Black" (10 pts)</p>
            <p className="text-emerald-400">✓ Location: "CSE Department Lab 3" (18 pts)</p>
            <p className="text-emerald-400">✓ Keyword overlap: "laptop", "charger" (15 pts)</p>
            <p className="text-emerald-400">✓ Date: Same calendar day (10 pts)</p>
            <p className="text-sky-300 font-bold border-t border-slate-700 pt-1 mt-1">
              TOTAL CONFIDENCE SCORE: 98%
            </p>
          </div>
        </div>
      ),
      actionButton: {
        label: "Open Smart Matches Matrix",
        action: () => {
          onNavigate('matches');
          onClose();
        }
      }
    },
    {
      title: "Step 4: Aarav Submits Ownership Claim",
      subtitle: "Providing proof that only the real owner knows",
      persona: "Aarav Sharma (Claimant)",
      personaId: "user-aarav",
      icon: KeyRound,
      badge: "Claim Verification",
      description: (
        <div className="space-y-3 text-slate-600 text-sm">
          <p>
            Aarav sees the 98% match and clicks <strong>"Claim This Item"</strong>.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold">Secret Ownership Proof Prompt:</p>
            <p className="italic">"Orange electric tape wrapped 2 inches from the power plug."</p>
          </div>
          <p className="text-xs text-slate-500">
            This private response is transmitted securely to the Finder and Campus Security for inspection.
          </p>
        </div>
      ),
      actionButton: {
        label: "Inspect Found HP Charger Details",
        action: () => {
          switchUser('user-aarav');
          onNavigate('item-detail', 'item-found-01');
          onClose();
        }
      }
    },
    {
      title: "Step 5: Admin / Finder Verifies & Approves",
      subtitle: "Unlocking safe campus contact & safe recovery",
      persona: "Officer Rajendra Kumar (Admin)",
      personaId: "user-officer-raj",
      icon: ShieldCheck,
      badge: "Resolution & Return",
      description: (
        <div className="space-y-3 text-slate-600 text-sm">
          <p>
            Campus Security Officer Raj reviews the claim in the <strong>Admin Resolution Center</strong>:
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
            <p className="font-bold">✓ Evidence Verified: Clues match exactly.</p>
            <p>✓ Status updated: Claim Approved.</p>
            <p>✓ Handover Point: Main Gate 1 Security Office.</p>
          </div>
          <p className="text-xs text-slate-600">
            Once approved, contact details unlock so both parties can complete the handover. Then the item is marked as <strong>Returned</strong>!
          </p>
        </div>
      ),
      actionButton: {
        label: "Open Admin Resolution Center",
        action: () => {
          switchUser('user-officer-raj');
          onNavigate('admin');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          onClose();
        }
      }
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (steps[nextStep].personaId) {
        switchUser(steps[nextStep].personaId);
      }
    } else {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (steps[prevStep].personaId) {
        switchUser(steps[prevStep].personaId);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/30 text-sky-300 border border-brand-400/30">
              {current.badge}
            </span>
            <span className="text-xs text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <StepIcon className="w-5 h-5 text-sky-400 shrink-0" />
            <span>{current.title}</span>
          </h3>
          <p className="text-xs text-sky-200/80 mt-1">{current.subtitle}</p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center px-6 pt-4 gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                if (steps[idx].personaId) switchUser(steps[idx].personaId);
              }}
              className={`h-1.5 rounded-full flex-1 cursor-pointer transition-all ${
                idx === currentStep
                  ? 'bg-brand-600'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Active persona banner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-slate-500">Active Persona in Tour:</span>
            <span className="font-semibold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
              {current.persona}
            </span>
          </div>

          {current.description}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                switchUser('user-aarav');
                setCurrentStep(0);
              }}
              title="Restart Tour"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-white border border-slate-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {current.actionButton && (
              <button
                onClick={current.actionButton.action}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition flex items-center gap-1.5"
              >
                <span>{current.actionButton.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition flex items-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
