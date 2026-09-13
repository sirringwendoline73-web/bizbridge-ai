import React, { useState } from 'react';
import {
  Layers,
  Bot,
  FileText,
  Search,
  LayoutDashboard,
  Info,
  Menu,
  X,
  Workflow,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export type ViewType =
  | 'home'
  | 'ai-assistant'
  | 'submit-request'
  | 'track-request'
  | 'dashboard'
  | 'about';

interface NavbarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenIntegrations: () => void;
  newRequestsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenIntegrations,
  newRequestsCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: <Bot className="w-4 h-4" />,
    },
    {
      id: 'submit-request',
      label: 'Submit Request',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'track-request',
      label: 'Track Request',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'dashboard',
      label: 'Business Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: newRequestsCount > 0 ? newRequestsCount : undefined,
    },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: ViewType) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <button
            id="nav-brand-button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-slate-800 transition-colors">
              <Workflow className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  BizBridge <span className="text-emerald-600">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Capstone Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-normal hidden md:block">
                From Customer Request to Business Action
              </p>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action / Integration Hub Trigger */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              id="nav-integration-button"
              onClick={onOpenIntegrations}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
              title="Inspect Google Form, Google Sheets & Automation Setup"
            >
              <Workflow className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Workflow</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="nav-integration-mobile-icon"
              onClick={onOpenIntegrations}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 sm:hidden"
              aria-label="Workflow settings"
            >
              <Workflow className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              id="nav-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              id="mobile-nav-integrations"
              onClick={() => {
                onOpenIntegrations();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
            >
              <Workflow className="w-4 h-4 text-emerald-600" />
              <span>Google Form / Sheet Automation Config</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
