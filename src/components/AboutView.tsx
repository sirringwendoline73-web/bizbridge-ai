import React from 'react';
import {
  Sparkles,
  Workflow,
  CheckCircle2,
  Table,
  Zap,
  Bot,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Send,
} from 'lucide-react';
import { ViewType } from './Navbar';

interface AboutViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenIntegrations: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onOpenIntegrations }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-16">
      {/* Title & Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Technology Capstone Project Showcase</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About BizBridge AI
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          From Customer Request to Business Action: Bridging conversational AI with practical small
          business automation.
        </p>
      </div>

      {/* The 5 Capstone Pillars: Problem -> AI Solution -> Structured Data -> Business Workflow -> Automation Potential */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          The Capstone Architecture Framework
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Pillar 1: Problem */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
              Pillar 1
            </span>
            <h3 className="font-bold text-slate-900 text-base">The Problem</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Small businesses lose up to 15 hours weekly dealing with fragmented, unstructured customer
              messages on WhatsApp, phone calls, and email. Critical details like quantity, product specs,
              and contact methods are routinely missed.
            </p>
          </div>

          {/* Pillar 2: AI Solution */}
          <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 space-y-3 shadow-2xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Pillar 2
            </span>
            <h3 className="font-bold text-slate-900 text-base">AI Solution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              BizBridge AI converses naturally with the customer. It understands context, proactively
              asks clarification questions for missing data, and verifies customer intent without forcing
              rigid dropdowns.
            </p>
          </div>

          {/* Pillar 3: Structured Data */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
              Pillar 3
            </span>
            <h3 className="font-bold text-slate-900 text-base">Structured Data</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Natural language is converted into a normalized 12-field schema containing Request ID, contact
              channel, priority level, product specifications, and an executive AI summary ready for ingestion.
            </p>
          </div>

          {/* Pillar 4: Business Workflow */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
              Pillar 4
            </span>
            <h3 className="font-bold text-slate-900 text-base">Business Workflow</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Payload feeds directly into familiar small business tools: Google Forms and Google Sheets. The
              business dashboard centralizes status tracking, internal notes, and quotation histories.
            </p>
          </div>

          {/* Pillar 5: Automation Potential */}
          <div className="bg-white rounded-2xl border border-indigo-200 bg-indigo-50/20 p-5 space-y-3 shadow-2xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Pillar 5
            </span>
            <h3 className="font-bold text-slate-900 text-base">Automation Potential</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once inside Google Sheets, no-code/low-code tools (Apps Script, Zapier, Make) trigger instant
              technician dispatch alerts, draft quotations, and calendar deadlines without human intervention.
            </p>
          </div>
        </div>
      </div>

      {/* Engineering Design Principles */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Engineering Rigor
          </span>
          <h2 className="text-2xl font-bold mt-1">Real-World Prototype, Not a Toy</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Security & API Protection</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              All Gemini AI inference executes server-side via Express backend endpoints. No API keys or
              secrets are ever exposed to the client browser.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Graceful Fallback Processing</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Equipped with both server Gemini 3.8 Flash intelligence and deterministic heuristic extraction,
              ensuring 100% operational uptime during evaluations or offline demos.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-400" />
              <span>No Fake External Credentials</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Cleanly separated configuration placeholders for Google Forms and Sheets so developers can
              plug in live webhooks when ready without deceptive mock indicators.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Instant CSV & JSON Export</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              One-click export directly to Google Sheets CSV or copyable JSON payloads, providing immediate
              data portability for small business operators.
            </p>
          </div>
        </div>
      </div>

      {/* Capstone Action CTA */}
      <div className="text-center space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-900">Experience BizBridge AI in Action</h3>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Test the AI Assistant</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Table className="w-4 h-4" />
            <span>Open Business Dashboard</span>
          </button>
          <button
            onClick={onOpenIntegrations}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Workflow className="w-4 h-4 text-emerald-600" />
            <span>Review Google Sheet Setup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
