import React from 'react';
import {
  Bot,
  FileText,
  Search,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Table,
  Workflow,
  Sparkles,
  Clock,
  Inbox,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { ViewType } from './Navbar';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenIntegrations: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenIntegrations }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Technology Capstone Project • Small Business Solution</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
            BizBridge <span className="text-emerald-600">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-slate-700 max-w-2xl mx-auto">
            From Customer Request to Business Action.
          </p>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            BizBridge AI transforms unstructured customer inquiries from WhatsApp, phone, and email into
            clean, standardized data. It validates missing details in real-time, prepares payloads for Google Forms
            and Sheets, and powers automated downstream business follow-ups.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              id="hero-cta-ai-assistant"
              onClick={() => onNavigate('ai-assistant')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-md transition-all group"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Start with AI Assistant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-cta-submit-manual"
              onClick={() => onNavigate('submit-request')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-all"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Submit Direct Request</span>
            </button>

            <button
              id="hero-cta-dashboard"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-xs transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Business Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Workflow Pipeline Visualizer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              The End-to-End Pipeline
            </h2>
            <p className="text-2xl font-bold text-slate-900">
              How Customer Inquiries Turn into Business Actions
            </p>
            <p className="text-sm text-slate-600">
              A structured flow engineered for small businesses without requiring expensive enterprise ERPs.
            </p>
          </div>

          {/* Flow Stepper Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                  Step 1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Customer</h3>
                <p className="text-xs text-slate-600">
                  Customer arrives with a natural inquiry via chat, WhatsApp, or form.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Inbox className="w-3.5 h-3.5" />
                <span>Unstructured need</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900">
                  Step 2
                </span>
                <h3 className="text-sm font-bold text-emerald-950">BizBridge AI</h3>
                <p className="text-xs text-slate-700">
                  Understands request, asks clarification questions, and checks missing data.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <Bot className="w-3.5 h-3.5" />
                <span>Intelligent clarification</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                  Step 3
                </span>
                <h3 className="text-sm font-bold text-slate-900">Structured Data</h3>
                <p className="text-xs text-slate-600">
                  Standardized 12-field schema with Request ID, Contact, Priority, and Summary.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span>JSON Payload</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                  Step 4
                </span>
                <h3 className="text-sm font-bold text-slate-900">Google Form</h3>
                <p className="text-xs text-slate-600">
                  Entry-ID mapped payload dispatches clean submission without manual entry.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Workflow className="w-3.5 h-3.5" />
                <span>Form ingestion</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                  Step 5
                </span>
                <h3 className="text-sm font-bold text-slate-900">Google Sheet</h3>
                <p className="text-xs text-slate-600">
                  Auto-populated row acts as a single centralized source of truth for the business.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Table className="w-3.5 h-3.5" />
                <span>Row appended</span>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 text-white">
                  Step 6
                </span>
                <h3 className="text-sm font-bold text-white">Business Action</h3>
                <p className="text-xs text-emerald-100">
                  Automations trigger team notifications, quote delivery, and follow-up tasks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500 flex items-center gap-1 text-[11px] font-semibold text-emerald-200">
                <Zap className="w-3.5 h-3.5" />
                <span>Follow-up executed</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Configured ready for Google Form, Google Sheets Apps Script, and Webhook integrations.
            </span>
            <button
              id="pipeline-inspect-button"
              onClick={onOpenIntegrations}
              className="font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              <span>Inspect Integration Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* The 3-Step Customer Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Customer Experience
          </h2>
          <p className="text-2xl font-bold text-slate-900">
            The Simple 3-Step Process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Customer explains what they need</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Customers don't need to navigate confusing menus. They simply type or speak their request naturally, such as:
              <span className="block mt-2 italic text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                "I need three solar batteries for my house."
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">BizBridge AI structures the request</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The AI detects the request type, extracts product specifications, asks friendly clarification questions for missing data (e.g. contact phone, battery capacity), and produces a clean summary.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">The request enters the business workflow</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The customer confirms the summary, receives a tracking Request ID, and the business receives a prioritized, standardized record ready for rapid review, quotation, and automated follow-up.
            </p>
          </div>
        </div>
      </section>

      {/* Realistic Benefits for Small Businesses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-lg">
          <div className="max-w-3xl space-y-3 mb-8">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Operational Value
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Designed for Real Small Business Challenges
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Small businesses lose hours each week deciphering incomplete voice notes, chasing missing phone numbers,
              and re-typing customer notes into spreadsheets. BizBridge AI solves these specific bottlenecks:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Reduce Repetitive Manual Data Entry</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Customer conversation is automatically transformed into structured spreadsheet fields without retyping.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Organize Customer Requests</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Categorizes inquiries into clear types (Quotes, Inquiries, Orders, Maintenance) with unified priorities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Reduce Missed Information</h3>
                <p className="text-xs text-slate-300 mt-1">
                  AI proactively prompts for missing essential information before the customer leaves the session.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Improve Response Speed</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Business staff receive complete, pre-qualified requests immediately, accelerating quote dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Centralize Request Information</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Consolidates inquiries into one clear dashboard and synchronized Google Sheet tracking repository.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Connect to Business Automation</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Enables next-step workflows such as team alerts, calendar reminders, and status notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('ai-assistant')}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Assistant</h3>
            <p className="text-xs text-slate-600 mt-1">
              Conversational intake with real-time field extraction and clarification.
            </p>
          </div>

          <div
            onClick={() => onNavigate('submit-request')}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Submit Request</h3>
            <p className="text-xs text-slate-600 mt-1">
              Standard structured form with summary validation and review before submission.
            </p>
          </div>

          <div
            onClick={() => onNavigate('track-request')}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Track Request</h3>
            <p className="text-xs text-slate-600 mt-1">
              Check live status, review progress, and view business follow-up notes by ID.
            </p>
          </div>

          <div
            onClick={() => onNavigate('dashboard')}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Business Dashboard</h3>
            <p className="text-xs text-slate-600 mt-1">
              Manage requests, update status, change priority, add notes, and trigger workflows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
