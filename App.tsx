/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ViewType } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { AIAssistantView } from './components/AIAssistantView';
import { DirectSubmitView } from './components/DirectSubmitView';
import { TrackRequestView } from './components/TrackRequestView';
import { BusinessDashboardView } from './components/BusinessDashboardView';
import { AboutView } from './components/AboutView';
import { IntegrationModal } from './components/IntegrationModal';
import { CustomerRequest } from './types';
import { fetchRequests } from './services/api';
import {
  Workflow,
  Sparkles,
  Bot,
  FileText,
  Search,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [trackingId, setTrackingId] = useState<string>('');
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(5);

  useEffect(() => {
    // Initial fetch to get accurate request count for badge
    fetchRequests().then((reqs) => {
      if (reqs && reqs.length) {
        setRequestCount(reqs.length);
      }
    });
  }, []);

  const handleTrackRequest = (id: string) => {
    setTrackingId(id);
    setCurrentView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestSubmitted = (newReq: CustomerRequest) => {
    setRequestCount((prev) => prev + 1);
    setRecentNotification(
      `Request ${newReq.id} recorded! Structured data ready for business triage.`
    );
    setTimeout(() => {
      setRecentNotification(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenIntegrations={() => setIsIntegrationOpen(true)}
      />

      {/* Global Notification Banner if a request was submitted */}
      {recentNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{recentNotification}</span>
          </div>
          <button
            onClick={() => setRecentNotification(null)}
            className="text-emerald-200 hover:text-white text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenIntegrations={() => setIsIntegrationOpen(true)}
          />
        )}

        {currentView === 'ai-assistant' && (
          <AIAssistantView
            onTrackRequest={handleTrackRequest}
            onRequestSubmitted={handleRequestSubmitted}
          />
        )}

        {currentView === 'submit' && (
          <DirectSubmitView
            onTrackRequest={handleTrackRequest}
            onRequestSubmitted={handleRequestSubmitted}
          />
        )}

        {currentView === 'track' && (
          <TrackRequestView
            initialRequestId={trackingId}
            onNavigateSubmit={() => {
              setCurrentView('ai-assistant');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <BusinessDashboardView onOpenIntegrations={() => setIsIntegrationOpen(true)} />
        )}

        {currentView === 'about' && (
          <AboutView
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenIntegrations={() => setIsIntegrationOpen(true)}
          />
        )}
      </main>

      {/* Google Form / Google Sheet Integration Modal */}
      <IntegrationModal
        isOpen={isIntegrationOpen}
        onClose={() => setIsIntegrationOpen(false)}
      />

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              BB
            </div>
            <div>
              <p className="font-bold text-slate-900">BizBridge AI</p>
              <p className="text-[11px] text-slate-500">
                From Customer Request to Business Action
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
            <button
              onClick={() => {
                setCurrentView('ai-assistant');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              AI Assistant
            </button>
            <button
              onClick={() => {
                setCurrentView('submit');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Direct Submit
            </button>
            <button
              onClick={() => {
                setCurrentView('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Track Request
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Business Dashboard
            </button>
            <button
              onClick={() => setIsIntegrationOpen(true)}
              className="hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <Workflow className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Sheets Setup</span>
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1eQpFWa_3vx2P8zKWe8Xr4ceAUz0GWfjtlT4XLPSrycE/edit?resourcekey=&gid=1180325917#gid=1180325917"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <span>Open Google Sheet</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf1iLGKJjopVOdtg3xSmcwD8uH8PuBI7OkOmNWXRYjU6CfD7A/viewform?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <span>Submit Request Form</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <button
              onClick={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Capstone Overview
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center md:text-right">
            AI Technology Capstone Prototype &bull; Designed for Small Businesses
          </div>
        </div>
      </footer>
    </div>
  );
}
