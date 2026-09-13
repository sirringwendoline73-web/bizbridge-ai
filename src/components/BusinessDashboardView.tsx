import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Check,
  Send,
  Workflow,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { CustomerRequest, RequestStatus, RequestPriority, StructuredPayload } from '../types';
import { fetchRequests, updateRequest } from '../services/api';

interface BusinessDashboardViewProps {
  onOpenIntegrations: () => void;
}

const ALL_STATUSES: RequestStatus[] = [
  'New',
  'Reviewing',
  'Awaiting Customer',
  'Quoted',
  'In Progress',
  'Completed',
  'Cancelled',
];

const ALL_PRIORITIES: RequestPriority[] = ['Low', 'Normal', 'High', 'Urgent'];

export const BusinessDashboardView: React.FC<BusinessDashboardViewProps> = ({
  onOpenIntegrations,
}) => {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Selected request for detail drawer
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);

  // Quick note input inside detail modal
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Business Ops');
  const [copySuccess, setCopySuccess] = useState(false);

  // Automation simulation states
  const [automationResult, setAutomationResult] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const data = await fetchRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Stats calculation
  const totalRequests = requests.length;
  const newRequests = requests.filter((r) => r.status === 'New').length;
  const requiringFollowUp = requests.filter(
    (r) => r.status === 'Reviewing' || r.status === 'Awaiting Customer'
  ).length;
  const completedRequests = requests.filter((r) => r.status === 'Completed').length;

  // Filtered requests
  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phoneWhatsApp.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || r.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    const updated = await updateRequest(requestId, { status: newStatus });
    if (updated) {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(updated);
      }
    }
  };

  const handlePriorityChange = async (requestId: string, newPriority: RequestPriority) => {
    const updated = await updateRequest(requestId, { priority: newPriority });
    if (updated) {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(updated);
      }
    }
  };

  const handleAddNote = async () => {
    if (!selectedRequest || !newNote.trim()) return;
    const updated = await updateRequest(selectedRequest.id, {
      note: newNote.trim(),
      author: noteAuthor,
    });
    if (updated) {
      setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? updated : r)));
      setSelectedRequest(updated);
      setNewNote('');
    }
  };

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
    }
  };

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 'High':
        return 'bg-orange-50 text-orange-800 border-orange-200 font-semibold';
      case 'Normal':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Low':
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const buildStructuredPayload = (r: CustomerRequest): StructuredPayload => ({
    timestamp: r.createdAt,
    requestId: r.id,
    customerName: r.customerName,
    phoneWhatsApp: r.phoneWhatsApp,
    email: r.email || '',
    requestType: r.requestType,
    productService: r.productService,
    quantity: r.quantity || '1',
    details: r.details,
    preferredContact: r.preferredContact,
    priority: r.priority,
    status: r.status,
    aiGeneratedSummary: r.aiGeneratedSummary,
  });

  const handleCopyPayload = (r: CustomerRequest) => {
    const payload = buildStructuredPayload(r);
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleSimulateAutomation = (actionType: string) => {
    setAutomationResult(`Simulated automation triggered: "${actionType}" dispatched payload.`);
    setTimeout(() => setAutomationResult(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Request ID',
      'Customer Name',
      'Phone/WhatsApp',
      'Email',
      'Request Type',
      'Product/Service',
      'Quantity',
      'Preferred Contact',
      'Priority',
      'Status',
      'Details',
      'AI Summary',
    ];

    const rows = requests.map((r) => [
      r.createdAt,
      r.id,
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.phoneWhatsApp}"`,
      `"${r.email || ''}"`,
      `"${r.requestType}"`,
      `"${r.productService.replace(/"/g, '""')}"`,
      `"${r.quantity || '1'}"`,
      `"${r.preferredContact}"`,
      `"${r.priority}"`,
      `"${r.status}"`,
      `"${r.details.replace(/"/g, '""')}"`,
      `"${(r.aiGeneratedSummary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bizbridge_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Small Business Request Dashboard</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Monitor, prioritize, and manage customer requests structured by BizBridge AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Sheets CSV</span>
          </button>

          <button
            onClick={onOpenIntegrations}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Google Workflow</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Requests
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {totalRequests}
            </div>
            <span className="text-[11px] text-slate-500">Centralized request intake</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              New Requests
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{newRequests}</div>
            <span className="text-[11px] text-blue-600 font-medium">Awaiting triage</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Requiring Follow-up
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
              {requiringFollowUp}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">Reviewing & Awaiting info</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Completed Requests
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
              {completedRequests}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Fitted & closed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="dashboard-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, request ID, phone, or product..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="all">All Priorities</option>
              {ALL_PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedPriority('all');
              }}
              className="text-slate-500 hover:text-slate-900 underline text-xs ml-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Request Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Request Type</th>
                <th className="py-3.5 px-4">Product / Service</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No requests match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{req.id}</span>
                      {req.isDemo && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                          Demo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{req.customerName}</div>
                      <div className="text-[11px] text-slate-500">{req.phoneWhatsApp}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                        {req.requestType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate">
                      <span className="font-medium text-slate-900">{req.productService}</span>
                      {req.quantity && (
                        <span className="text-slate-500 text-xs ml-1">({req.quantity})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs border ${getPriorityBadge(
                          req.priority
                        )}`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal / Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Request Details</h2>
                  <span className="font-mono text-sm font-extrabold bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-800">
                    {selectedRequest.id}
                  </span>
                  {selectedRequest.isDemo ? (
                    <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                      Demo Data
                    </span>
                  ) : (
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                      Live Customer Submission
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Received on {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status & Priority Controller */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Update Request Status:
                </label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) =>
                    handleStatusChange(selectedRequest.id, e.target.value as RequestStatus)
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Set Priority:
                </label>
                <select
                  value={selectedRequest.priority}
                  onChange={(e) =>
                    handlePriorityChange(selectedRequest.id, e.target.value as RequestPriority)
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {ALL_PRIORITIES.map((pr) => (
                    <option key={pr} value={pr}>
                      {pr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer & Product Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 block">Customer</span>
                <span className="font-semibold text-slate-900 text-base">
                  {selectedRequest.customerName}
                </span>
                <div className="text-slate-600 text-xs flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedRequest.phoneWhatsApp}</span>
                </div>
                {selectedRequest.email && (
                  <div className="text-slate-600 text-xs flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedRequest.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 block">Request Specifications</span>
                <div className="font-semibold text-slate-900">{selectedRequest.productService}</div>
                <div className="text-xs text-slate-600">
                  Quantity: <span className="font-medium text-slate-900">{selectedRequest.quantity || '1'}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Preferred Contact: <span className="font-medium text-emerald-800">{selectedRequest.preferredContact}</span>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Customer Details & Requirements</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedRequest.details || 'No additional details noted.'}
                </p>
              </div>

              {selectedRequest.aiGeneratedSummary && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">AI-Generated Structured Summary</span>
                  <p className="text-xs text-slate-700 italic bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                    "{selectedRequest.aiGeneratedSummary}"
                  </p>
                </div>
              )}
            </div>

            {/* Automation Simulation Section (Demonstrating downstream potential) */}
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    Automation Triggers (Google Sheet Workflow)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">Downstream Integration</span>
              </div>

              <p className="text-xs text-slate-300">
                Once a request enters the Google Sheet, automations execute the next business action:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleSimulateAutomation('Dispatch WhatsApp Quote Notification')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                >
                  Send Follow-up Message
                </button>
                <button
                  onClick={() => handleSimulateAutomation('Assign Tech Lead David to Diagnostics')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                >
                  Assign to Lead Tech
                </button>
                <button
                  onClick={() => handleSimulateAutomation('Calendar Reminder for Quote Expiry')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                >
                  Schedule Follow-up Task
                </button>
              </div>

              {automationResult && (
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{automationResult}</span>
                </div>
              )}
            </div>

            {/* Google Form / Google Sheet Structured Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Google Form / Sheets JSON Payload
                </span>
                <button
                  onClick={() => handleCopyPayload(selectedRequest)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto max-h-40">
                {JSON.stringify(buildStructuredPayload(selectedRequest), null, 2)}
              </pre>
            </div>

            {/* Internal Notes Feed */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Internal Team Follow-Up Notes
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedRequest.internalNotes && selectedRequest.internalNotes.length > 0 ? (
                  selectedRequest.internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-bold text-slate-700">{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-800">{note.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No internal notes added yet.</p>
                )}
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add note (e.g. 'Called customer, quote Q-102 dispatched')..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
