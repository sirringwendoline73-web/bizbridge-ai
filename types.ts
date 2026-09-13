export type RequestStatus =
  | 'New'
  | 'Reviewing'
  | 'Awaiting Customer'
  | 'Quoted'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type RequestPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type RequestType =
  | 'Product Inquiry'
  | 'Price Request'
  | 'Quotation Request'
  | 'Service Request'
  | 'Order Request'
  | 'Maintenance Request'
  | 'General Inquiry';

export type PreferredContact = 'WhatsApp' | 'Phone Call' | 'Email' | 'SMS';

export interface CustomerRequest {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  customerName: string;
  phoneWhatsApp: string;
  email?: string;
  requestType: RequestType;
  productService: string;
  quantity?: string;
  details: string;
  preferredContact: PreferredContact;
  priority: RequestPriority;
  status: RequestStatus;
  aiGeneratedSummary: string;
  isDemo?: boolean;
  internalNotes?: Array<{
    id: string;
    timestamp: string;
    author: string;
    note: string;
  }>;
  statusHistory?: Array<{
    status: RequestStatus;
    timestamp: string;
    note?: string;
  }>;
}

export interface StructuredPayload {
  timestamp: string;
  requestId: string;
  customerName: string;
  phoneWhatsApp: string;
  email: string;
  requestType: RequestType;
  productService: string;
  quantity: string;
  details: string;
  preferredContact: PreferredContact;
  priority: RequestPriority;
  status: RequestStatus;
  aiGeneratedSummary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}

export interface ExtractedRequestData {
  customerName?: string;
  phoneWhatsApp?: string;
  email?: string;
  requestType?: RequestType;
  productService?: string;
  quantity?: string;
  details?: string;
  preferredContact?: PreferredContact;
  missingFields: string[];
  summary?: string;
  readyForConfirmation: boolean;
}

export interface IntegrationConfig {
  googleFormUrl: string;
  googleSheetId: string;
  webhookUrl: string;
  autoSyncEnabled: boolean;
}
