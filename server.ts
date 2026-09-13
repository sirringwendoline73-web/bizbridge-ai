import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { CustomerRequest, StructuredPayload, RequestStatus, RequestPriority, RequestType, PreferredContact } from './src/types';
import { INITIAL_MOCK_REQUESTS } from './src/data/mockRequests';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// In-memory store initialized with realistic demo requests
let requestsStore: CustomerRequest[] = [...INITIAL_MOCK_REQUESTS];

// Helper to generate professional request IDs (e.g. BB-2026-4821)
function generateRequestId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BB-2026-${randomNum}`;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Get all requests
app.get('/api/requests', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: requestsStore,
  });
});

// Get single request by ID
app.get('/api/requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const found = requestsStore.find((r) => r.id.toLowerCase() === id.toLowerCase().trim());
  if (!found) {
    return res.status(404).json({
      success: false,
      error: `Request with ID "${id}" was not found.`,
    });
  }
  return res.json({
    success: true,
    data: found,
  });
});

// Create new customer request
app.post('/api/requests', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.customerName || !body.phoneWhatsApp || !body.productService) {
      return res.status(400).json({
        success: false,
        error: 'Missing required customer name, contact phone/WhatsApp, or product/service details.',
      });
    }

    const newId = generateRequestId();
    const now = new Date().toISOString();

    const newRequest: CustomerRequest = {
      id: newId,
      createdAt: now,
      updatedAt: now,
      customerName: body.customerName.trim(),
      phoneWhatsApp: body.phoneWhatsApp.trim(),
      email: body.email ? body.email.trim() : '',
      requestType: (body.requestType as RequestType) || 'General Inquiry',
      productService: body.productService.trim(),
      quantity: body.quantity ? body.quantity.trim() : '1',
      details: body.details ? body.details.trim() : '',
      preferredContact: (body.preferredContact as PreferredContact) || 'WhatsApp',
      priority: (body.priority as RequestPriority) || 'Normal',
      status: 'New',
      aiGeneratedSummary: body.aiGeneratedSummary || `${body.requestType} for ${body.productService} (${body.quantity || '1'})`,
      isDemo: false,
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          timestamp: now,
          author: 'BizBridge AI System',
          note: 'Request captured and formatted for Google Form / Google Sheet workflow.',
        },
      ],
      statusHistory: [
        {
          status: 'New',
          timestamp: now,
          note: 'Submitted by customer via BizBridge AI.',
        },
      ],
    };

    // Prepend new requests so they appear at the top
    requestsStore = [newRequest, ...requestsStore];

    // Build the structured payload formatted for Google Form / Google Sheet integration
    const payload: StructuredPayload = {
      timestamp: now,
      requestId: newRequest.id,
      customerName: newRequest.customerName,
      phoneWhatsApp: newRequest.phoneWhatsApp,
      email: newRequest.email || '',
      requestType: newRequest.requestType,
      productService: newRequest.productService,
      quantity: newRequest.quantity || '1',
      details: newRequest.details,
      preferredContact: newRequest.preferredContact,
      priority: newRequest.priority,
      status: newRequest.status,
      aiGeneratedSummary: newRequest.aiGeneratedSummary,
    };

    return res.status(201).json({
      success: true,
      message: 'Request submitted successfully.',
      data: newRequest,
      structuredPayload: payload,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while saving the request.',
    });
  }
});

// Update request status, priority, or add internal note
app.patch('/api/requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, priority, note, author } = req.body;

  const index = requestsStore.findIndex((r) => r.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `Request with ID "${id}" was not found.`,
    });
  }

  const existing = requestsStore[index];
  const now = new Date().toISOString();

  let updatedStatusHistory = existing.statusHistory || [];
  if (status && status !== existing.status) {
    updatedStatusHistory = [
      ...updatedStatusHistory,
      {
        status: status as RequestStatus,
        timestamp: now,
        note: note || `Status updated from ${existing.status} to ${status}`,
      },
    ];
  }

  let updatedNotes = existing.internalNotes || [];
  if (note && note.trim().length > 0) {
    updatedNotes = [
      ...updatedNotes,
      {
        id: `note-${Date.now()}`,
        timestamp: now,
        author: author || 'Business User',
        note: note.trim(),
      },
    ];
  }

  const updated: CustomerRequest = {
    ...existing,
    updatedAt: now,
    status: (status as RequestStatus) || existing.status,
    priority: (priority as RequestPriority) || existing.priority,
    internalNotes: updatedNotes,
    statusHistory: updatedStatusHistory,
  };

  requestsStore[index] = updated;

  return res.json({
    success: true,
    data: updated,
  });
});

// Test webhook endpoint for Google Apps Script, Zapier, or Make
app.post('/api/test-webhook', async (req: Request, res: Response) => {
  const { webhookUrl, payload } = req.body;

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'No webhook URL provided for testing.',
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload || { test: true, timestamp: new Date().toISOString() }),
    });

    return res.json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      message: `Webhook received response code ${response.status}.`,
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reach webhook URL.',
    });
  }
});

// Heuristic fallback extractor for when Gemini API key is not configured or offline
function heuristicChatProcessor(messages: Array<{ sender: string; text: string }>, currentExtracted: any) {
  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
  const fullConversation = messages.map((m) => `${m.sender}: ${m.text}`).join('\n');

  const lowerText = fullConversation.toLowerCase();

  // Extract phone/WhatsApp
  const phoneMatch = fullConversation.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  // Extract email
  const emailMatch = fullConversation.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  // Extract quantity
  const quantityMatch = fullConversation.match(/\b(\d+)\s*(units?|batteries?|pieces?|items?|tables?|systems?|sets?|boxes?|rooms?|devices?|kg|liters?)?\b/i);

  // Extract request type
  let detectedType: RequestType = currentExtracted?.requestType || 'General Inquiry';
  if (/quote|quotation|estimate|pricing|how much/i.test(lowerText)) {
    detectedType = 'Quotation Request';
  } else if (/order|buy|purchase|need to buy/i.test(lowerText)) {
    detectedType = 'Order Request';
  } else if (/service|install|installation|setup/i.test(lowerText)) {
    detectedType = 'Service Request';
  } else if (/repair|broken|maintenance|squealing|not working|service rooftop/i.test(lowerText)) {
    detectedType = 'Maintenance Request';
  } else if (/inquiry|available|do you carry|catalog/i.test(lowerText)) {
    detectedType = 'Product Inquiry';
  }

  // Extract preferred contact
  let detectedContact: PreferredContact = currentExtracted?.preferredContact || 'WhatsApp';
  if (/whatsapp/i.test(lowerText)) detectedContact = 'WhatsApp';
  else if (/call|phone call/i.test(lowerText)) detectedContact = 'Phone Call';
  else if (/email/i.test(lowerText)) detectedContact = 'Email';
  else if (/sms|text message/i.test(lowerText)) detectedContact = 'SMS';

  // Product/service extraction
  let productService = currentExtracted?.productService || '';
  if (!productService) {
    if (/solar batter/i.test(lowerText)) productService = 'Solar Home Battery Backup';
    else if (/mixer|commercial mixer/i.test(lowerText)) productService = 'Commercial Spiral Dough Mixer';
    else if (/hvac|air condition|ac unit/i.test(lowerText)) productService = 'Commercial HVAC Servicing';
    else if (/table|wood|walnut/i.test(lowerText)) productService = 'Custom Wooden Conference Table';
    else if (/generator|power/i.test(lowerText)) productService = 'Backup Power Generator';
    else if (lastUserMsg.length > 5 && !phoneMatch && !emailMatch) {
      productService = lastUserMsg.slice(0, 50);
    }
  }

  // Customer Name extraction
  let customerName = currentExtracted?.customerName || '';
  const nameMatch = fullConversation.match(/(?:my name is|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) {
    customerName = nameMatch[1];
  }

  const phone = phoneMatch ? phoneMatch[0] : currentExtracted?.phoneWhatsApp || '';
  const email = emailMatch ? emailMatch[0] : currentExtracted?.email || '';
  const quantity = quantityMatch ? quantityMatch[0] : currentExtracted?.quantity || '1';
  const details = currentExtracted?.details || (lastUserMsg.length > 15 ? lastUserMsg : 'Customer request provided via conversation.');

  // Missing fields checklist
  const missing: string[] = [];
  if (!customerName) missing.push('Your Full Name');
  if (!phone) missing.push('Phone or WhatsApp Number');
  if (!productService) missing.push('Product or Service Requested');

  const ready = missing.length === 0;

  // Build assistant response
  let reply = '';
  if (!productService) {
    reply = "Hello! I'm BizBridge AI. I'm here to help turn your request into a structured business action. Could you tell me what product or service you're looking for?";
  } else if (!quantityMatch && /order|quote|batter/i.test(lowerText) && !currentExtracted?.quantity) {
    reply = `I noted you need "${productService}". How many units or what scale/capacity are you looking for, and do you have any specific requirements?`;
  } else if (!customerName) {
    reply = `Got it for the ${productService}${quantity ? ` (${quantity})` : ''}. Who should our team address the follow-up and quotation to? Please share your name.`;
  } else if (!phone) {
    reply = `Thank you, ${customerName}. What is the best Phone or WhatsApp number for our business team to reach you?`;
  } else if (ready) {
    reply = `Thank you, ${customerName}! I have gathered all necessary information for your ${detectedType} (${productService}, ${quantity}). Please review the structured summary on the right and click "Confirm & Submit" when you're ready!`;
  } else {
    reply = `Thank you! Could you also provide ${missing.join(' and ')} so we can finalize your request?`;
  }

  return {
    assistantMessage: reply,
    extracted: {
      customerName,
      phoneWhatsApp: phone,
      email,
      requestType: detectedType,
      productService,
      quantity,
      details,
      preferredContact: detectedContact,
      priority: /urgent|asap|emergency/i.test(lowerText) ? 'Urgent' : 'Normal',
      missingFields: missing,
      summary: `${detectedType} for ${productService} (${quantity}) requested by ${customerName || 'Customer'}. Contact: ${phone || 'Pending'}.`,
      readyForConfirmation: ready,
    },
  };
}

// AI Assistant conversational endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, currentExtracted } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const ai = getGeminiClient();

  // If Gemini is not configured, seamlessly use the intelligent fallback
  if (!ai) {
    const fallbackResult = heuristicChatProcessor(messages, currentExtracted);
    return res.json({
      success: true,
      message: fallbackResult.assistantMessage,
      extracted: fallbackResult.extracted,
      mode: 'heuristic_fallback',
    });
  }

  try {
    const conversationTranscript = messages
      .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n');

    const prompt = `You are BizBridge AI, an intelligent customer request and business workflow assistant for small businesses.
Your purpose:
Help a customer turn their natural-language request into a structured business request ready for a Google Form, Google Sheet, and automation workflow.

You must:
1. Converse naturally, courteously, and professionally.
2. Ask clear, friendly clarification questions when essential information is missing (e.g. product/service specifics, quantity, dimensions/capacity, customer name, contact phone/WhatsApp, preferred contact method).
3. If the customer provided partial details (e.g. "I need 3 solar batteries for my house"), recognize the request type ("Quotation Request" or "Order Request"), ask about the battery capacity/specifications, and politely ask for their name and contact information.
4. Always return your answer in valid JSON matching the exact schema specified below.

JSON Schema format:
{
  "reply": "Your conversational response to the customer. Acknowledge what they said, explain what you noted, and ask 1 or 2 targeted questions if anything is missing, or summarize if complete.",
  "extracted": {
    "customerName": "Customer's full name or empty string if not yet provided",
    "phoneWhatsApp": "Phone/WhatsApp number or empty string if not yet provided",
    "email": "Email address or empty string if not provided",
    "requestType": "One of: Product Inquiry, Price Request, Quotation Request, Service Request, Order Request, Maintenance Request, General Inquiry",
    "productService": "Clear name/description of the product or service requested or empty string",
    "quantity": "Quantity or volume (e.g. '3 units', '1 system') or '1'",
    "details": "Specific technical details, requirements, notes, or constraints provided by customer",
    "preferredContact": "One of: WhatsApp, Phone Call, Email, SMS",
    "priority": "One of: Low, Normal, High, Urgent",
    "missingFields": ["Array of human-readable names of missing critical fields, e.g. 'Customer Full Name', 'Phone/WhatsApp Number'"],
    "summary": "Crisp 1-2 sentence executive summary of the entire customer request",
    "readyForConfirmation": boolean (true ONLY when customerName, phoneWhatsApp, and productService are all clearly provided)
  }
}

Conversation so far:
${conversationTranscript}

Previously extracted state:
${JSON.stringify(currentExtracted || {})}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            extracted: {
              type: Type.OBJECT,
              properties: {
                customerName: { type: Type.STRING },
                phoneWhatsApp: { type: Type.STRING },
                email: { type: Type.STRING },
                requestType: { type: Type.STRING },
                productService: { type: Type.STRING },
                quantity: { type: Type.STRING },
                details: { type: Type.STRING },
                preferredContact: { type: Type.STRING },
                priority: { type: Type.STRING },
                missingFields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                summary: { type: Type.STRING },
                readyForConfirmation: { type: Type.BOOLEAN },
              },
              required: ['missingFields', 'readyForConfirmation', 'summary'],
            },
          },
          required: ['reply', 'extracted'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      message: parsed.reply,
      extracted: parsed.extracted,
      mode: 'gemini',
    });
  } catch (error) {
    console.warn('Gemini chat error, using fallback processor:', error);
    const fallbackResult = heuristicChatProcessor(messages, currentExtracted);
    return res.json({
      success: true,
      message: fallbackResult.assistantMessage,
      extracted: fallbackResult.extracted,
      mode: 'heuristic_fallback',
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BizBridge AI server running on port ${PORT}`);
  });
}

startServer();
