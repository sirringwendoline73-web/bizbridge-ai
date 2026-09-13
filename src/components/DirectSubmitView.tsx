import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Search,
  ArrowRight,
  ShieldAlert,
  Edit3,
  Check,
} from 'lucide-react';
import { RequestType, PreferredContact, CustomerRequest, StructuredPayload } from '../types';
import { submitCustomerRequest } from '../services/api';

interface DirectSubmitViewProps {
  onTrackRequest: (requestId: string) => void;
  onRequestSubmitted?: (req: CustomerRequest) => void;
}

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

export const DirectSubmitView: React.FC<DirectSubmitViewProps> = ({
  onTrackRequest,
  onRequestSubmitted,
}) => {
  // Form input state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneWhatsApp: '',
    email: '',
    requestType: 'Quotation Request' as RequestType,
    productService: '',
    quantity: '1',
    details: '',
    preferredContact: 'WhatsApp' as PreferredContact,
  });

  // Stage: 'form' | 'summary' | 'submitted'
  const [stage, setStage] = useState<'form' | 'summary' | 'submitted'>('form');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    request: CustomerRequest;
    payload: StructuredPayload;
  } | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!formData.phoneWhatsApp.trim()) {
      newErrors.phoneWhatsApp = 'Phone or WhatsApp number is required.';
    }
    if (!formData.productService.trim()) {
      newErrors.productService = 'Please specify the product or service requested.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStage('summary');
    }
  };

  const handleConfirmAndSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitCustomerRequest({
        customerName: formData.fullName,
        phoneWhatsApp: formData.phoneWhatsApp,
        email: formData.email,
        requestType: formData.requestType,
        productService: formData.productService,
        quantity: formData.quantity || '1',
        details: formData.details,
        preferredContact: formData.preferredContact,
        aiGeneratedSummary: `${formData.requestType} for ${formData.productService} (${formData.quantity || '1'})`,
      });

      if (res.success && res.request) {
        setSubmittedData({
          request: res.request,
          payload: res.payload,
        });
        setStage('submitted');
        if (onRequestSubmitted) {
          onRequestSubmitted(res.request);
        }
      } else {
        alert(res.error || 'Submission failed. Please check your inputs.');
      }
    } catch (err) {
      alert('Error connecting to server. Request has been preserved.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phoneWhatsApp: '',
      email: '',
      requestType: 'Quotation Request',
      productService: '',
      quantity: '1',
      details: '',
      preferredContact: 'WhatsApp',
    });
    setStage('form');
    setSubmittedData(null);
    setErrors({});
  };

  // SUCCESS STAGE
  if (stage === 'submitted' && submittedData) {
    const { request } = submittedData;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Request Submitted Successfully</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              The business has received your request and will follow up using the contact information provided.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Tracking ID
              </span>
              <div className="text-2xl font-mono font-extrabold text-slate-900">{request.id}</div>
            </div>
            <button
              id="direct-track-btn"
              onClick={() => onTrackRequest(request.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Track This Request</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Real-World Business Transparency</span>
            </div>
            This request has been formatted into the structured Google Form and Google Sheet integration payload.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Submit Another Request</span>
            </button>
            <button
              onClick={() => onTrackRequest(request.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
            >
              <span>View Tracking Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUMMARY STAGE (Explicitly required: Customer Request Summary with Edit Request & Confirm & Submit)
  if (stage === 'summary') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-xl font-bold text-slate-900">Customer Request Summary</h1>
            <p className="text-xs text-slate-600 mt-1">
              Please review your request details below before submitting to the business team.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">Customer Name:</span>
              <span className="font-semibold text-slate-900">{formData.fullName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">Contact:</span>
              <span className="font-semibold text-slate-900">
                {formData.phoneWhatsApp} {formData.email ? `(${formData.email})` : ''}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">Request Type:</span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                {formData.requestType}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">Product / Service:</span>
              <span className="font-semibold text-slate-900">{formData.productService}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">Quantity:</span>
              <span className="text-slate-800">{formData.quantity || '1'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 text-xs">Preferred Contact Method:</span>
              <span className="font-medium text-slate-800">{formData.preferredContact}</span>
            </div>

            <div className="pt-1">
              <span className="text-slate-500 text-xs block mb-1">Details:</span>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                {formData.details || 'No additional details provided.'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit Request and Confirm & Submit */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              id="summary-edit-request-btn"
              type="button"
              onClick={() => setStage('form')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Request</span>
            </button>

            <button
              id="summary-confirm-submit-btn"
              type="button"
              onClick={handleConfirmAndSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
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
        </div>
      </div>
    );
  }

  // STANDARD FORM STAGE
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Submit Business Request</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Provide your requirements below. BizBridge AI will validate and format your data for our business workflow.
          </p>
        </div>

        <form onSubmit={handleProceedToSummary} className="space-y-5">
          {/* Customer Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="input-full-name"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Marcus Vance"
                className={`w-full bg-white border ${
                  errors.fullName ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Phone / WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                id="input-phone"
                type="tel"
                value={formData.phoneWhatsApp}
                onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                placeholder="+1 (555) 234-8901"
                className={`w-full bg-white border ${
                  errors.phoneWhatsApp ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2`}
              />
              {errors.phoneWhatsApp && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phoneWhatsApp}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Email Address (Optional)
              </label>
              <input
                id="input-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@business.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Type of Request
              </label>
              <select
                id="select-request-type"
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value as RequestType })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REQUEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product and Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Product or Service Requested <span className="text-red-500">*</span>
              </label>
              <input
                id="input-product-service"
                type="text"
                value={formData.productService}
                onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
                placeholder="e.g. Solar Home Battery Backup (5kWh)"
                className={`w-full bg-white border ${
                  errors.productService ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2`}
              />
              {errors.productService && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.productService}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                6. Quantity (When Applicable)
              </label>
              <input
                id="input-quantity"
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g. 3 units"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              8. Preferred Contact Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONTACT_METHODS.map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setFormData({ ...formData, preferredContact: method })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    formData.preferredContact === method
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              7. Additional Details & Specifications
            </label>
            <textarea
              id="textarea-details"
              rows={3}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Describe dimensions, location, existing equipment, deadlines, or questions..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Review details on next screen before final dispatch.
            </span>
            <button
              id="form-proceed-summary-btn"
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Review Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
