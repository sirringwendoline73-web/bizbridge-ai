import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Check,
  RotateCcw,
  Search,
  ArrowRight,
  ClipboardList,
  Phone,
  Mail,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import {
  ChatMessage,
  ExtractedRequestData,
  RequestType,
  PreferredContact,
  CustomerRequest,
  StructuredPayload,
} from '../types';
import { sendChatMessage, submitCustomerRequest } from '../services/api';

interface AIAssistantViewProps {
  onTrackRequest: (requestId: string) => void;
  onRequestSubmitted?: (req: CustomerRequest) => void;
}

const SAMPLE_PROMPTS = [
  'I need three solar batteries for my house.',
  'Looking for a commercial 60L bakery spiral dough mixer with delivery.',
  'Urgent maintenance for 2 rooftop HVAC units blowing warm air in our office.',
  'Quotation for custom 12-person walnut conference table with power outlets.',
];

const REQUEST_TYPES: RequestType[] = [
  'Product Inquiry',
  'Price Request',
  'Quotation Request',
  'Service Request',
  'Order Request',
  'Maintenance Request',
  'General Inquiry',
];

const CONTACT_METHODS: PreferredContact[] = ['WhatsApp', 'Phone Call', 'Email', 'SMS'];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onTrackRequest,
  onRequestSubmitted,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm BizBridge AI. Tell me what product, service, or business assistance you need, and I'll organize your request into structured details for our team.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Extracted request state
  const [extracted, setExtracted] = useState<ExtractedRequestData>({
    customerName: '',
    phoneWhatsApp: '',
    email: '',
    requestType: 'General Inquiry',
    productService: '',
    quantity: '1',
    details: '',
    preferredContact: 'WhatsApp',
    missingFields: ['Product or Service Requested', 'Customer Name', 'Phone/WhatsApp Number'],
    summary: '',
    readyForConfirmation: false,
  });

  // Successful submission record
  const [submittedData, setSubmittedData] = useState<{
    request: CustomerRequest;
    payload: StructuredPayload;
  } | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await sendChatMessage(newHistory, extracted);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.extracted) {
        setExtracted((prev) => ({
          ...prev,
          ...response.extracted,
          // Preserve edits if user manually populated fields
          customerName: response.extracted.customerName || prev.customerName,
          phoneWhatsApp: response.extracted.phoneWhatsApp || prev.phoneWhatsApp,
          email: response.extracted.email || prev.email,
          productService: response.extracted.productService || prev.productService,
          quantity: response.extracted.quantity || prev.quantity || '1',
          details: response.extracted.details || prev.details,
          preferredContact: response.extracted.preferredContact || prev.preferredContact,
          requestType: response.extracted.requestType || prev.requestType,
        }));
      }
    } catch (err) {
      console.error('Chat error', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I had trouble processing that message. Please check the summary card on the right or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSubmit = async () => {
    // Validate minimal fields
    if (!extracted.customerName?.trim()) {
      setSubmitError('Please provide your Full Name before submitting.');
      return;
    }
    if (!extracted.phoneWhatsApp?.trim()) {
      setSubmitError('Please provide your Phone or WhatsApp number so our team can follow up.');
      return;
    }
    if (!extracted.productService?.trim()) {
      setSubmitError('Please specify the product or service requested.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitCustomerRequest({
        customerName: extracted.customerName,
        phoneWhatsApp: extracted.phoneWhatsApp,
        email: extracted.email,
        requestType: extracted.requestType || 'General Inquiry',
        productService: extracted.productService,
        quantity: extracted.quantity || '1',
        details: extracted.details,
        preferredContact: extracted.preferredContact || 'WhatsApp',
        aiGeneratedSummary:
          extracted.summary ||
          `${extracted.requestType} for ${extracted.productService} (${extracted.quantity || '1'})`,
      });

      if (res.success && res.request) {
        setSubmittedData({
          request: res.request,
          payload: res.payload,
        });
        if (onRequestSubmitted) {
          onRequestSubmitted(res.request);
        }
      } else {
        setSubmitError(res.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setSubmitError('Error connecting to server. Request has been preserved.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-new',
        sender: 'assistant',
        text: "Hello! I'm BizBridge AI. Tell me what product, service, or business assistance you need, and I'll organize your request into structured details for our team.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setExtracted({
      customerName: '',
      phoneWhatsApp: '',
      email: '',
      requestType: 'General Inquiry',
      productService: '',
      quantity: '1',
      details: '',
      preferredContact: 'WhatsApp',
      missingFields: ['Product or Service Requested', 'Customer Name', 'Phone/WhatsApp Number'],
      summary: '',
      readyForConfirmation: false,
    });
    setSubmittedData(null);
    setSubmitError(null);
    setIsEditing(false);
  };

  // If already submitted, display the clean, authentic confirmation screen
  if (submittedData) {
    const { request, payload } = submittedData;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Request Submitted Successfully
            </h2>
            <p className="text-slate-600 max-w-md text-sm sm:text-base">
              The business has received your structured request and will follow up using the contact
              information you provided.
            </p>
          </div>

          {/* Request ID Banner */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Tracking ID
              </span>
              <div className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight">
                {request.id}
              </div>
            </div>
            <button
              id="confirm-track-btn"
              onClick={() => onTrackRequest(request.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Track This Request</span>
            </button>
          </div>

          {/* Submitted Request Summary Breakdown */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Customer Request Summary
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Customer Name</span>
                <span className="font-semibold text-slate-900">{request.customerName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Contact Info</span>
                <span className="font-semibold text-slate-900">
                  {request.phoneWhatsApp} {request.email ? `• ${request.email}` : ''}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Request Type</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-0.5">
                  {request.requestType}
                </span>
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
                <span className="text-xs text-slate-500 block">Preferred Contact Method</span>
                <span className="font-medium text-slate-800">{request.preferredContact}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">Additional Details</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  {request.details || 'No additional details noted.'}
                </p>
              </div>
              {request.aiGeneratedSummary && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-500 block">AI-Generated Summary</span>
                  <p className="text-xs text-slate-600 italic bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 mt-1">
                    "{request.aiGeneratedSummary}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Genuine Real-World Notice (Mandate: Do not claim fake email/WhatsApp was sent) */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Real-World Business Notice</span>
            </div>
            <p>
              This request is saved in the BizBridge AI database and structured as a Google Form & Google
              Sheets payload. No mock email or fictitious WhatsApp message has been simulated.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              id="confirm-submit-another-btn"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Request</span>
            </button>

            <button
              id="confirm-track-footer-btn"
              onClick={() => onTrackRequest(request.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              <span>View Status in Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">AI Request Assistant</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Interactive Structuring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Chat naturally about your business inquiry. BizBridge AI extracts key specifications and
            identifies missing items in real time.
          </p>
        </div>

        <button
          id="assistant-reset-btn"
          onClick={handleReset}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Two Column Layout: Chat on Left, Real-time Structured Extraction on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Sample Prompts Banner */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Quick Test Prompts (Click to send):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="text-left text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 transition-all disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/70'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1 ${
                        isUser ? 'text-slate-400 text-right' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>BizBridge AI is organizing request details...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2"
          >
            <input
              id="ai-assistant-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. 'I need 3 solar batteries for my house' or share your name & number..."
              disabled={loading}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <button
              id="ai-assistant-send-btn"
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        {/* Live Extraction & Summary Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-base">Customer Request Summary</h2>
              </div>
              <button
                id="edit-request-toggle-btn"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Done Editing' : 'Edit Request'}</span>
              </button>
            </div>

            {/* Missing Info Warning / Readiness */}
            {extracted.missingFields && extracted.missingFields.length > 0 && !isEditing ? (
              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Information Still Needed:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
                  {extracted.missingFields.map((field, i) => (
                    <li key={i}>{field}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-amber-700 pt-1">
                  You can type them in the chat or click "Edit Request" above to enter manually.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>All critical details captured! Ready for review and submission.</span>
              </div>
            )}

            {/* Structured Fields: View or Edit Mode */}
            {isEditing ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={extracted.customerName || ''}
                    onChange={(e) =>
                      setExtracted((prev) => ({ ...prev, customerName: e.target.value }))
                    }
                    placeholder="Full name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    value={extracted.phoneWhatsApp || ''}
                    onChange={(e) =>
                      setExtracted((prev) => ({ ...prev, phoneWhatsApp: e.target.value }))
                    }
                    placeholder="e.g. +1 555-0192"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={extracted.email || ''}
                    onChange={(e) =>
                      setExtracted((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="name@business.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Request Type</label>
                    <select
                      value={extracted.requestType || 'General Inquiry'}
                      onChange={(e) =>
                        setExtracted((prev) => ({
                          ...prev,
                          requestType: e.target.value as RequestType,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs"
                    >
                      {REQUEST_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                    <input
                      type="text"
                      value={extracted.quantity || '1'}
                      onChange={(e) =>
                        setExtracted((prev) => ({ ...prev, quantity: e.target.value }))
                      }
                      placeholder="e.g. 3 units"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product / Service *</label>
                  <input
                    type="text"
                    value={extracted.productService || ''}
                    onChange={(e) =>
                      setExtracted((prev) => ({ ...prev, productService: e.target.value }))
                    }
                    placeholder="Product or service description"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Contact</label>
                  <select
                    value={extracted.preferredContact || 'WhatsApp'}
                    onChange={(e) =>
                      setExtracted((prev) => ({
                        ...prev,
                        preferredContact: e.target.value as PreferredContact,
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs"
                  >
                    {CONTACT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Details</label>
                  <textarea
                    rows={2}
                    value={extracted.details || ''}
                    onChange={(e) =>
                      setExtracted((prev) => ({ ...prev, details: e.target.value }))
                    }
                    placeholder="Additional context or constraints"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-semibold text-slate-900">
                    {extracted.customerName || (
                      <span className="text-amber-600 italic">Missing</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-semibold text-slate-900">
                    {extracted.phoneWhatsApp || (
                      <span className="text-amber-600 italic">Missing</span>
                    )}
                    {extracted.email && ` (${extracted.email})`}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Request Type:</span>
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {extracted.requestType || 'General Inquiry'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Product / Service:</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[65%] truncate">
                    {extracted.productService || (
                      <span className="text-amber-600 italic">Missing</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="text-slate-900 font-medium">
                    {extracted.quantity || '1'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Preferred Contact:</span>
                  <span className="text-slate-900 font-medium">
                    {extracted.preferredContact || 'WhatsApp'}
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Details:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    {extracted.details || 'No additional details noted yet.'}
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {submitError}
              </div>
            )}

            {/* Action Buttons: Edit Request & Confirm & Submit */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  id="assistant-edit-request-btn"
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  {isEditing ? 'Save Edits' : 'Edit Request'}
                </button>

                <button
                  id="assistant-confirm-submit-btn"
                  type="button"
                  onClick={handleConfirmAndSubmit}
                  disabled={submitting || !extracted.customerName || !extracted.phoneWhatsApp || !extracted.productService}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Submit</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                Requires Name, Contact, and Product/Service to submit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
