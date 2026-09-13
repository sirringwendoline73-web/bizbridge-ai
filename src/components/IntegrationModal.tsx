import React, { useState, useEffect } from 'react';
import {
  X,
  Workflow,
  Table,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Code,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { IntegrationConfig, StructuredPayload } from '../types';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'bizbridge_integration_config_v1';

const DEFAULT_CONFIG: IntegrationConfig = {
  googleFormUrl: '',
  googleSheetId: '',
  webhookUrl: '',
  autoSyncEnabled: false,
};

const SAMPLE_PAYLOAD: StructuredPayload = {
  timestamp: new Date().toISOString(),
  requestId: 'BB-2026-1042',
  customerName: 'Marcus Vance',
  phoneWhatsApp: '+1 (555) 234-8901',
  email: 'marcus.vance@greenridge.net',
  requestType: 'Quotation Request',
  productService: 'Solar Home Battery Backup (5kWh Lithium)',
  quantity: '3 units',
  details: 'Need 3 solar wall batteries for residential system.',
  preferredContact: 'WhatsApp',
  priority: 'High',
  status: 'New',
  aiGeneratedSummary: 'Customer requires quote for 3 units of 5kWh residential lithium solar batteries.',
};

const APPS_SCRIPT_TEMPLATE = `/**
 * BizBridge AI - Google Sheets Ingestion Script
 * Paste this into Google Sheets: Extensions > Apps Script
 * Deploy as Web App (Execute as: Me, Who has access: Anyone)
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Request ID", "Customer Name", "Phone / WhatsApp",
        "Email", "Request Type", "Product / Service", "Quantity",
        "Preferred Contact", "Priority", "Status", "Details", "AI Summary"
      ]);
    }
    
    // Append customer record
    sheet.appendRow([
      payload.timestamp,
      payload.requestId,
      payload.customerName,
      payload.phoneWhatsApp,
      payload.email || "",
      payload.requestType,
      payload.productService,
      payload.quantity || "1",
      payload.preferredContact,
      payload.priority,
      payload.status,
      payload.details || "",
      payload.aiGeneratedSummary || ""
    ]);
    
    // Optional: Trigger downstream business automation
    // sendSlackOrWhatsAppAlert(payload);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Row appended to Google Sheet successfully",
      requestId: payload.requestId
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const IntegrationModal: React.FC<IntegrationModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<IntegrationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_CONFIG;
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'config' | 'appscript' | 'payload'>('architecture');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn(e);
    }
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleTestPing = async () => {
    if (!config.webhookUrl) {
      setTestStatus('Please enter a Webhook or Apps Script URL first.');
      return;
    }

    setTesting(true);
    setTestStatus(null);

    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: config.webhookUrl,
          payload: SAMPLE_PAYLOAD,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus(`Test successful! Received status: ${data.statusCode}`);
      } else {
        setTestStatus(`Test failed: ${data.error || 'Server could not reach webhook'}`);
      }
    } catch (err) {
      setTestStatus('Network error while testing webhook endpoint.');
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Workflow className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Google Form & Google Sheet Workflow Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configuration placeholders, standardized payload schema, and automation trigger setup.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Pipeline Architecture
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Endpoints & Placeholders
          </button>
          <button
            onClick={() => setActiveTab('appscript')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'appscript'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Google Apps Script
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'payload'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Structured Payload Schema
          </button>
        </div>

        {/* Tab 1: Pipeline Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">The Complete BizBridge AI Pipeline</h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                BizBridge AI acts as the structured intake layer for small businesses. Rather than relying on
                messy WhatsApp texts or scattered voicemails, customer requests flow cleanly through:
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
                Customer → BizBridge AI → Structured Request (12 fields) → Google Form → Google Sheet → Automation → Final Business Action
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-emerald-600" />
                  <span>Google Form & Sheet Connection</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The structured JSON payload maps directly to Google Form entries or appends via Google Sheets
                  Apps Script webhook. This guarantees consistent data headers without human transcription errors.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-emerald-600" />
                  <span>Downstream Automation Actions</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Once a row enters Google Sheets, tools like Google Apps Script triggers, Zapier, Make, or n8n
                  automatically:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  <li>Notify the responsible technician or sales lead</li>
                  <li>Send quotation follow-up drafts</li>
                  <li>Assign priority tasks and calendar reminders</li>
                  <li>Update request status automatically</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Real-World Note:</span> BizBridge AI does not invent fake successful Google credentials. When you are ready to connect your live Google Form or Sheet, simply insert your real URLs in Tab 2.
            </div>
          </div>
        )}

        {/* Tab 2: Endpoints & Placeholders */}
        {activeTab === 'config' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Google Form Action / Pre-fill URL (Placeholder)
              </label>
              <input
                type="text"
                value={config.googleFormUrl}
                onChange={(e) => setConfig({ ...config, googleFormUrl: e.target.value })}
                placeholder="https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Configure your Google Form submit endpoint or pre-fill template link.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Google Sheet ID (Placeholder)
              </label>
              <input
                type="text"
                value={config.googleSheetId}
                onChange={(e) => setConfig({ ...config, googleSheetId: e.target.value })}
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 block">
                The unique identifier from your Google Sheet URL.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Google Apps Script / Webhook Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec or Zapier/Make Webhook"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={handleTestPing}
                  disabled={testing || !config.webhookUrl}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
                >
                  {testing ? 'Testing...' : 'Test Webhook Ping'}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Web app URL from Google Apps Script (see Tab 3) or webhook handler.
              </span>
            </div>

            {testStatus && (
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-800">
                {testStatus}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Google Apps Script Ready-to-use Code */}
        {activeTab === 'appscript' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Copy and paste this script directly into your Google Sheet (Extensions &gt; Apps Script):
              </span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64 border border-slate-800">
              {APPS_SCRIPT_TEMPLATE}
            </pre>
            <p className="text-[11px] text-slate-500">
              After pasting: Click <strong>Deploy &gt; New deployment &gt; Web app</strong>. Set 'Who has access' to 'Anyone', then copy the Web app URL into Tab 2.
            </p>
          </div>
        )}

        {/* Tab 4: Structured Payload Schema */}
        {activeTab === 'payload' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                The exact 12-field standardized JSON schema output for every BizBridge AI customer request:
              </span>
              <button
                onClick={handleCopyPayload}
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied!' : 'Copy Sample Payload'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 overflow-x-auto max-h-64">
              {JSON.stringify(SAMPLE_PAYLOAD, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Settings are preserved in your local browser session.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
