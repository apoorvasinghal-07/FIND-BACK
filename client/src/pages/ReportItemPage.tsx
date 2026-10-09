import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CampusItem, ItemType } from '../types';
import { 
  Upload, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportItemPageProps {
  initialType?: 'lost' | 'found';
  onSuccess: (newItem: CampusItem) => void;
  onNavigate: (tab: string) => void;
}

export const ReportItemPage: React.FC<ReportItemPageProps> = ({ initialType = 'lost', onSuccess, onNavigate }) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [reportType, setReportType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState('Black');
  const [campusLocation, setCampusLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [description, setDescription] = useState('');
  const [privateSecretClue, setPrivateSecretClue] = useState('');
  const [custodyLocation, setCustodyLocation] = useState('');

  // Reporter info (pre-filled from demo persona)
  const [reporterName, setReporterName] = useState(currentUser.name);
  const [reporterEmail, setReporterEmail] = useState(currentUser.email);
  const [reporterPhone, setReporterPhone] = useState('+91 98765 43210');
  const [reporterRollNo, setReporterRollNo] = useState(currentUser.rollNo || '22CS104');

  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isLost = reportType === 'lost';

  const categories = [
    'Electronics',
    'ID & Cards',
    'Wallets & Bags',
    'Keys',
    'Bottles & Flasks',
    'Books & Stationery',
    'Clothing & Accessories',
    'Other'
  ];

  const popularLocations = [
    'Central Library',
    'Central Canteen',
    'CSE Department Lab 3',
    'Sports Complex Gym',
    'Main Auditorium',
    'Student Parking Lot B',
    'Science Block Lab'
  ];

  const colorPresets = [
    { name: 'Black', hex: '#000000' },
    { name: 'Navy Blue', hex: '#1e3a8a' },
    { name: 'Silver / Grey', hex: '#94a3b8' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Brown', hex: '#78350f' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image size must be under 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide an item title/name');
      return;
    }
    if (!campusLocation.trim()) {
      setErrorMessage('Please specify the campus location');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('type', reportType);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('brand', brand.trim());
      formData.append('primaryColor', primaryColor);
      formData.append('campusLocation', campusLocation.trim());
      formData.append('date', date);
      formData.append('time', time);
      formData.append('description', description.trim());
      
      if (isLost && privateSecretClue.trim()) {
        formData.append('privateSecretClue', privateSecretClue.trim());
      }
      if (!isLost && custodyLocation.trim()) {
        formData.append('custodyLocation', custodyLocation.trim());
      }

      formData.append('reporterName', reporterName.trim());
      formData.append('reporterEmail', reporterEmail.trim());
      formData.append('reporterPhone', reporterPhone.trim());
      formData.append('reporterRollNo', reporterRollNo.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.createItem(formData);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      onSuccess(res.item);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please check the fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          File a Campus Property Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Our smart matching engine will immediately scan existing campus filings to find potential matches
        </p>

        {/* Dual Mode Switcher Tabs */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 max-w-md w-full">
            <button
              type="button"
              onClick={() => setReportType('lost')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isLost
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLost ? 'bg-white animate-ping' : 'bg-rose-500'}`} />
              I Lost an Item
            </button>

            <button
              type="button"
              onClick={() => setReportType('found')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                !isLost
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${!isLost ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
              I Found an Item
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-10 space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Section 1: Item Basic Information */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>1. Item Details</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              * Required fields
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Item Name / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isLost ? "e.g., HP 65W Laptop Charger, Blue HydroFlask, Casio FX Calculator" : "e.g., HP Laptop Power Adapter, Apple Wireless Earbuds Case"}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Brand / Manufacturer (if known)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Apple, HP, Milton, Casio, Dell, Fossil"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>

            {/* Primary Color */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Primary Colour
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setPrimaryColor(c.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition ${
                      primaryColor === c.name
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Item Description &amp; Distinguishing Characteristics *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention key details, scratches, labels, contents, or where it was placed..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Photo Upload */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-600" />
              <span>2. Item Photo (High Confidence Verification)</span>
            </h2>
            <span className="text-[11px] text-slate-400">Optional but recommended</span>
          </div>

          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 max-w-sm aspect-[16/10] bg-slate-100">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-brand-50/20 group"
              >
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-600 mx-auto mb-2 transition" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Click to upload item photo or drag and drop here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPG, or WEBP up to 10MB. Images persist safely across all refreshes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Location and Date/Time */}
        <div className="space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>3. Campus Location &amp; Timestamp</span>
            </h2>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Where on campus was it {isLost ? 'lost' : 'found'}? *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {popularLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setCampusLocation(loc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    campusLocation === loc
                      ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              placeholder="e.g., Central Library 2nd Floor, Canteen Juice Stall, CSE Lab 3 Bench 14"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date {isLost ? 'Lost' : 'Found'} *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Approximate Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Privacy & Verification Safeguards */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              <span>4. Anti-Fraud &amp; Handover Security</span>
            </h2>
          </div>

          {isLost ? (
            /* Private Secret Clue for Lost items */
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Private Ownership Clue / Secret Identifier (Crucial Safeguard)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Provide a confidential proof detail (e.g. <em>"Lockscreen wallpaper photo", "Orange tape on cord", "Initials etched on underside", "Driver license inside card pocket"</em>).
                <strong className="block mt-1 text-amber-900">
                  🔒 This detail is strictly confidential. It is NOT displayed in public listings and will be used to verify claimants.
                </strong>
              </p>
              <input
                type="text"
                value={privateSecretClue}
                onChange={(e) => setPrivateSecretClue(e.target.value)}
                placeholder="e.g., Orange electric tape wrapped 2 inches from the plug; initials TD written inside"
                className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:border-amber-600 text-sm"
              />
            </div>
          ) : (
            /* Safe Custody point for Found items */
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Current Custody &amp; Handover Location</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Where is this item currently being stored while awaiting its rightful owner?
              </p>
              <input
                type="text"
                value={custodyLocation}
                onChange={(e) => setCustodyLocation(e.target.value)}
                placeholder="e.g., Handed over to Security Desk at Gate 1, or kept with finder in CSE Lab 3"
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:border-emerald-600 text-sm"
              />
            </div>
          )}
        </div>

        {/* Section 5: Reporter Contact Information (Shielded) */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>5. Reporter Identity (Protected by Campus Shield)</span>
            </h2>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Shield Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">College Roll No / ID</label>
              <input
                type="text"
                value={reporterRollNo}
                onChange={(e) => setReporterRollNo(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Campus Email</label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (SMS Alert)</label>
              <input
                type="text"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Cancel &amp; Return
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLost
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/25'
            } ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {submitting ? (
              <span>Submitting Report...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publish Report &amp; Check Matches</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
