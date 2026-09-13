import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Info,
} from 'lucide-react';
import { CustomerRequest, RequestStatus } from '../types';
import { fetchRequestById, getLocalStoredRequests } from '../services/api';

interface TrackRequestViewProps {
  initialRequestId?: string;
  onNavigateSubmit: () => void;
}

const DEMO_IDS = [
  { id: 'BB-2026-1042', label: 'Solar Batteries', status: 'Reviewing' },
  { id: 'BB-2026-1039', label: 'Bakery Mixer', status: 'Quoted' },
  { id: 'BB-2026-1035', label: 'HVAC Servicing', status: 'In Progress' },
  { id: 'BB-2026-1028', label: 'Walnut Table', status: 'Awaiting Customer' },
  { id: 'BB-2026-1014', label: 'Scanner Fleet', status: 'Completed' },
];

const STATUS_ORDER: RequestStatus[] = [
  'New',
  'Reviewing',
  'Quoted',
  'In Progress',
  'Completed',
];

export const TrackRequestView: React.FC<TrackRequestViewProps> = ({
  initialRequestId = '',
  onNavigateSubmit,
}) => {
  const [searchId, setSearchId] = useState(initialRequestId);
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (idToSearch?: string) => {
    const id = (idToSearch || searchId).trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetchRequestById(id);
      if (res) {
        setRequest(res);
        setSearchId(res.id);
      } else {
        setRequest(null);
        setError(`No request found with ID "${id}". Please verify the tracking code.`);
      }
    } catch (err) {
      setError('Unable to retrieve request data at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRequestId) {
      handleSearch(initialRequestId);
    }
  }, [initialRequestId]);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Reviewing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Awaiting Customer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Quoted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Track Customer Request</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Enter your unique BizBridge Request ID below to view real-time status, technician updates, and quotation progress.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              id="track-search-input"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. BB-2026-1042"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
          <button
            id="track-search-button"
            type="submit"
            disabled={loading || !searchId.trim()}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <span>Searching...</span> : <span>Track Request</span>}
          </button>
        </form>

        {/* Quick Demo ID chips */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Sample Demonstration Records:</span>
            {DEMO_IDS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => {
                  setSearchId(demo.id);
                  handleSearch(demo.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
              >
                {demo.id} <span className="text-[10px] text-slate-500">({demo.status})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-red-600 mt-0.5">
              Please ensure you typed the full format including "BB-2026-".
            </p>
          </div>
        </div>
      )}

      {/* Found Request Display */}
      {request && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden space-y-6">
          {/* Top Banner with Demo vs Real Distinction */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-white">
                  {request.id}
                </span>
                {request.isDemo ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 border border-amber-300">
                    Demonstration Record
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400 text-slate-950">
                    Live Submitted Request
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Submitted on {new Date(request.createdAt).toLocaleDateString()} at{' '}
                {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                  request.status
                )}`}
              >
                Status: {request.status}
              </span>
            </div>
          </div>

          {/* Workflow Progress Stepper */}
          <div className="px-6 py-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Workflow Status Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATUS_ORDER.map((s, index) => {
                const currentIndex = STATUS_ORDER.indexOf(request.status);
                const isPassed = index <= currentIndex;
                const isCurrent = s === request.status;

                return (
                  <div
                    key={s}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono">0{index + 1}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Request Information */}
          <div className="px-6 pb-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Customer Name</span>
                <span className="font-semibold text-slate-900">{request.customerName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Follow-up Contact</span>
                <span className="font-semibold text-slate-900">
                  {request.phoneWhatsApp} {request.email ? `• ${request.email}` : ''}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Request Category</span>
                <span className="font-medium text-slate-800">{request.requestType}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Product / Service</span>
                <span className="font-semibold text-slate-900">{request.productService}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Quantity</span>
                <span className="text-slate-800">{request.quantity || '1'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Preferred Contact Channel</span>
                <span className="font-medium text-slate-800">{request.preferredContact}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">Submitted Specifications & Details</span>
                <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 mt-1">
                  {request.details || 'No additional details noted.'}
                </p>
              </div>
              {request.aiGeneratedSummary && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-500 block">BizBridge AI Structured Summary</span>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200 mt-1">
                    "{request.aiGeneratedSummary}"
                  </p>
                </div>
              )}
            </div>

            {/* Business Follow-Up Notes Log */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Business Follow-Up Activity & Notes
              </h4>
              {request.internalNotes && request.internalNotes.length > 0 ? (
                <div className="space-y-2">
                  {request.internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-bold text-slate-700">{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-800">{note.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                  No internal notes recorded yet. The business team is currently reviewing the specifications.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Callout */}
      {!request && !loading && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Need to submit a new inquiry?</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Use the AI Assistant or direct form to structure your request into the business workflow.
          </p>
          <button
            onClick={onNavigateSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <span>Create New Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
