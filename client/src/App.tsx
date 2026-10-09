import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DemoBar } from './components/DemoBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ReportItemPage } from './pages/ReportItemPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { MatchesPage } from './pages/MatchesPage';
import { MyActivityPage } from './pages/MyActivityPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { GuidedDemoTour } from './components/GuidedDemoTour';
import { CampusItem } from './types';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [extraParam, setExtraParam] = useState<string | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const navigateTo = (tab: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'item-detail' && param) {
      setSelectedItemId(param);
      setCurrentTab('item-detail');
      setExtraParam(undefined);
      return;
    }
    setCurrentTab(tab);
    setExtraParam(param);
  };

  const handleSelectItem = (item: CampusItem) => {
    setSelectedItemId(item.id);
    setCurrentTab('item-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportSuccess = (newItem: CampusItem) => {
    setSelectedItemId(newItem.id);
    setCurrentTab('item-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDataReset = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-600 selection:text-white">
      {/* 1. Hackathon Demo Bar */}
      <DemoBar 
        onStartTour={() => setTourOpen(true)} 
        onDataReset={handleDataReset}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={navigateTo}
        onStartTour={() => setTourOpen(true)}
      />

      {/* 3. Page Views */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            key={`home-${refreshTrigger}`}
            onNavigate={navigateTo}
            onSelectItem={handleSelectItem}
            onStartTour={() => setTourOpen(true)}
          />
        )}

        {currentTab === 'browse' && (
          <BrowsePage
            key={`browse-${refreshTrigger}-${extraParam || 'all'}`}
            initialFilter={extraParam}
            onSelectItem={handleSelectItem}
            onNavigate={navigateTo}
          />
        )}

        {currentTab === 'report' && (
          <ReportItemPage
            key={`report-${extraParam || 'lost'}`}
            initialType={(extraParam as 'lost' | 'found') || 'lost'}
            onSuccess={handleReportSuccess}
            onNavigate={navigateTo}
          />
        )}

        {currentTab === 'item-detail' && selectedItemId && (
          <ItemDetailPage
            key={`detail-${selectedItemId}-${refreshTrigger}`}
            itemId={selectedItemId}
            onBack={() => navigateTo('browse')}
            onSelectOtherItem={handleSelectItem}
          />
        )}

        {currentTab === 'matches' && (
          <MatchesPage
            key={`matches-${refreshTrigger}`}
            onSelectItem={handleSelectItem}
            onNavigate={navigateTo}
          />
        )}

        {currentTab === 'activity' && (
          <MyActivityPage
            key={`activity-${refreshTrigger}`}
            onSelectItem={handleSelectItem}
            onNavigate={navigateTo}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            key={`admin-${refreshTrigger}`}
            onSelectItem={handleSelectItem}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Guided Demo Tour Modal */}
      <GuidedDemoTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onNavigate={navigateTo}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
