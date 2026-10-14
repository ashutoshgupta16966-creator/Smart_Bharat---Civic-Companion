import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://smart-bharat-civic-companion-1.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for mock file uploads
const upload = multer({ dest: 'uploads/' });

// Database path for civic issues
const DB_FILE = path.join(__dirname, 'db.json');

// Initialize local database with seed data if it doesn't exist
const initialSeedData = [
  {
    id: "complaint-101",
    title: "Deep Potholes on MG Road",
    description: "Several massive potholes have formed near the Metro Station on MG Road. They are causing major traffic bottlenecks and are dangerous for two-wheelers.",
    category: "Roads & Traffic",
    location: "MG Road Metro Station, Bengaluru",
    lat: 12.9716,
    lng: 77.5946,
    citizenName: "Rahul Sharma",
    citizenContact: "+91 98765 43210",
    status: "In Progress",
    reportedAt: "2026-07-01T10:30:00.000Z",
    assignedTo: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    notes: "Site inspection done. Crew scheduled for asphalt filling tonight.",
    attachmentUrl: ""
  },
  {
    id: "complaint-102",
    title: "Drinking Water Pipeline Leakage",
    description: "Main clean water supply line has cracked in Karol Bagh block 4A. Clean water has been wasting and flooding the road since yesterday morning.",
    category: "Water Supply",
    location: "Block 4A, Karol Bagh, New Delhi",
    lat: 28.6139,
    lng: 77.2090,
    citizenName: "Priya Patel",
    citizenContact: "+91 87654 32109",
    status: "Pending",
    reportedAt: "2026-07-06T15:45:00.000Z",
    assignedTo: "Delhi Jal Board (DJB)",
    notes: "Complaint received. Engineer dispatched to assess leakage point.",
    attachmentUrl: ""
  },
  {
    id: "complaint-103",
    title: "Illegal Garbage Dumping & Overflowing Bins",
    description: "Garbage hasn't been collected for 5 days near the public park in Sector 3. It's causing a terrible stench and stray dogs are spreading it all over the road.",
    category: "Sanitation & Waste",
    location: "Sector 3 Public Park, Salt Lake, Kolkata",
    lat: 22.5726,
    lng: 88.3639,
    citizenName: "Anirban Sen",
    citizenContact: "+91 76543 21098",
    status: "Resolved",
    reportedAt: "2026-06-28T09:15:00.000Z",
    assignedTo: "Kolkata Municipal Corporation (KMC)",
    notes: "Solid waste management team cleaned the area and placed additional bins.",
    attachmentUrl: ""
  },
  {
    id: "complaint-104",
    title: "Malfunctioning Streetlights",
    description: "Entire street opposite the Dadar railway station is in complete darkness as 6 consecutive streetlights are down. Poses safety risks for women returning late.",
    category: "Street Lighting",
    location: "Station Road, Dadar East, Mumbai",
    lat: 19.0760,
    lng: 72.8777,
    citizenName: "Sneha Kulkarni",
    citizenContact: "+91 95432 10987",
    status: "Resolved",
    reportedAt: "2026-07-02T21:00:00.000Z",
    assignedTo: "Brihanmumbai Municipal Corporation (BMC)",
    notes: "Bulbs replaced and circuit breaker reset. All lights operational.",
    attachmentUrl: ""
  },
  {
    id: "complaint-105",
    title: "Open Sewage Drain & Odour Control",
    description: "The storm water drain next to Adyar main road is open, leading to mosquito breeding grounds and unbearable smell during day hours.",
    category: "Sanitation & Waste",
    location: "Adyar Main Road, Chennai",
    lat: 13.0827,
    lng: 80.2707,
    citizenName: "Karthik Subramanian",
    citizenContact: "+91 91234 56789",
    status: "Pending",
    reportedAt: "2026-07-07T08:12:00.000Z",
    assignedTo: "Greater Chennai Corporation (GCC)",
    notes: "Logged. Allocated to public safety and health department.",
    attachmentUrl: ""
  }
];

// Read issues helper
const getIssues = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2));
    return initialSeedData;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning in-memory fallback", err);
    return initialSeedData;
  }
};

// Write issues helper
const saveIssues = (issues) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(issues, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing to database file", err);
    return false;
  }
};

// Initialize Anthropic & Gemini Client Helpers
// Using dynamic getters with trimming/sanitization prevents issues with accidental quotes or whitespace
const cleanKey = (k) => {
  if (!k || typeof k !== 'string') return '';
  return k.trim().replace(/^["']|["']$/g, '');
};

function getAnthropicClient() {
  const key = cleanKey(process.env.ANTHROPIC_API_KEY);
  if (!key || key === 'your_anthropic_api_key_here') return null;
  return new Anthropic({ apiKey: key });
}

function getGeminiClient() {
  const key = cleanKey(process.env.GEMINI_API_KEY);
  if (!key || key === 'your_google_gemini_api_key_here') return null;
  return new GoogleGenerativeAI(key);
}

// Startup check logs (visible in Render logs)
const startupAnthropic = getAnthropicClient();
if (startupAnthropic) {
  console.log("[Startup] Anthropic API key detected and client initialized successfully.");
} else {
  console.warn("[Startup] WARNING: ANTHROPIC_API_KEY is not set or placeholder is being used.");
}

const startupGemini = getGeminiClient();
if (startupGemini) {
  console.log("[Startup] Gemini API key detected and client initialized successfully.");
} else {
  console.warn("[Startup] WARNING: GEMINI_API_KEY is not set or placeholder is being used.");
}

// Global reference for document verification
let genAI = startupGemini;

// Multi-Model Fallback Chain
// Sequence: Claude Sonnet -> Claude Opus -> Claude Haiku -> Gemini 2.0 Flash -> Gemini 1.5 Flash
const FALLBACK_CHAIN = [
  // 1. Claude Sonnet (Primary)
  {
    provider: 'anthropic',
    model: process.env.CLAUDE_SONNET_MODEL || 'claude-3-7-sonnet-20250219',
    displayName: 'Claude 3.7 Sonnet'
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet'
  },
  // 2. Claude Opus
  {
    provider: 'anthropic',
    model: process.env.CLAUDE_OPUS_MODEL || 'claude-3-opus-20240229',
    displayName: 'Claude 3 Opus'
  },
  // 3. Claude Haiku
  {
    provider: 'anthropic',
    model: process.env.CLAUDE_HAIKU_MODEL || 'claude-3-5-haiku-20241022',
    displayName: 'Claude 3.5 Haiku'
  },
  {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku'
  },
  // 4. Gemini 2.0 Flash
  {
    provider: 'gemini',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash'
  },
  // 5. Gemini 1.5 Flash & Lighter Variants
  {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash'
  },
  {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro'
  },
  {
    provider: 'gemini',
    model: 'gemini-1.5-flash-8b',
    displayName: 'Gemini 1.5 Flash 8B'
  }
];

// Fallback Gemini models for multimodal document verification
const MODELS_TO_TRY = [
  process.env.GEMINI_MODEL || "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

// Maximum timeout per model attempt (12 seconds)
const MODEL_TIMEOUT_MS = 12000;

// Promise timeout wrapper
const callWithTimeout = (promise, ms, label) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: ${label} did not respond within ${ms / 1000} seconds.`));
    }, ms);

    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// ─── System instruction builder (language-aware) ───────────────────────────
// Called per-request so the model always knows which language to respond in.
function buildSystemInstruction(language) {
  return `You are the Smart Bharat AI Civic Companion — an expert assistant on Indian public schemes, utility forms, municipal grievances, and civic policies.

RESPONSE LANGUAGE: Respond ENTIRELY in ${language}. Do not mix languages.

RULES:
1. NO SELF-INTRODUCTION in ongoing responses. Never start with "Hello, I am Smart Bharat..." or similar openings.
2. Only greet if the user message is ONLY a greeting (hi/hello/hey/namaste/who are you?).
3. ANSWER ANY QUESTION DIRECTLY — civic, government, population, geography, general knowledge — all are valid. Never say "I can only answer civic queries."
4. For civic/government topics: give step-by-step guidance, eligibility criteria, official portals, required documents.
5. NO GENERIC FALLBACKS: Never redirect without providing real information first.`.trim();
}

// Backward-compat alias used by /api/verify-document
const BOT_SYSTEM_PROMPT = buildSystemInstruction('English');

/**
 * Runs multi-model fallback chain silently.
 * Logs every attempt + error to server console (visible in Render logs, not to user).
 * Falls back to getMockChatResponse only if every real model fails.
 */
async function generateCivicChatResponse(prompt, language = 'English') {
  // Build language-aware system instruction for this specific request
  const systemInstruction = buildSystemInstruction(language);
  const anthropicClient = getAnthropicClient();
  const geminiClient = getGeminiClient();

  let lastError = null;

  console.log(`[AIChat] ── New request ─────────────────────────────────────`);
  console.log(`[AIChat]   language="${language}" | prompt="${prompt.substring(0, 100)}"`);
  console.log(`[AIChat]   Claude client ready: ${!!anthropicClient} | Gemini client ready: ${!!geminiClient}`);
  console.log(`[AIChat]   Chain: ${FALLBACK_CHAIN.map(m => m.displayName).join(' → ')}`);

  for (let i = 0; i < FALLBACK_CHAIN.length; i++) {
    const { provider, model, displayName } = FALLBACK_CHAIN[i];
    const attempt = i + 1;
    const startTime = Date.now();

    try {
      if (provider === 'anthropic') {
        if (!anthropicClient) {
          console.log(`[AIChat] [${attempt}/${FALLBACK_CHAIN.length}] SKIP ${displayName} — ANTHROPIC_API_KEY not configured.`);
          continue;
        }

        console.log(`[AIChat] [${attempt}/${FALLBACK_CHAIN.length}] TRYING ${displayName} (${model})...`);

        const anthropicCall = anthropicClient.messages.create({
          model: model,
          max_tokens: 2048,
          system: systemInstruction,
          messages: [{ role: 'user', content: prompt }]
        });

        const response = await callWithTimeout(anthropicCall, MODEL_TIMEOUT_MS, `${displayName} (${model})`);

        // Extract text from Anthropic response content blocks
        const textResponse = response.content
          ?.filter(block => block.type === 'text')
          ?.map(block => block.text)
          ?.join('\n')
          ?.trim();

        if (textResponse) {
          console.log(`[AIChat] [${attempt}] ✓ SUCCESS ${displayName} in ${Date.now() - startTime}ms`);
          return textResponse;
        } else {
          console.warn(`[AIChat] [${attempt}] ${displayName} returned empty text. Trying next...`);
        }
      } else if (provider === 'gemini') {
        if (!geminiClient) {
          console.log(`[AIChat] [${attempt}/${FALLBACK_CHAIN.length}] SKIP ${displayName} — GEMINI_API_KEY not configured.`);
          continue;
        }

        console.log(`[AIChat] [${attempt}/${FALLBACK_CHAIN.length}] TRYING ${displayName} (${model})...`);

        const geminiModel = geminiClient.getGenerativeModel({
          model: model,
          systemInstruction: systemInstruction
        });

        const geminiCall = geminiModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        }).then(async (result) => {
          const resp = await result.response;
          return resp.text();
        });

        const textResponse = await callWithTimeout(geminiCall, MODEL_TIMEOUT_MS, `${displayName} (${model})`);

        if (textResponse && textResponse.trim()) {
          console.log(`[AIChat] [${attempt}] ✓ SUCCESS ${displayName} in ${Date.now() - startTime}ms`);
          return textResponse.trim();
        } else {
          console.warn(`[AIChat] [${attempt}] ${displayName} returned empty text. Trying next...`);
        }
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      console.warn(`[AIChat] [${attempt}/${FALLBACK_CHAIN.length}] ✗ FAILED ${displayName} (${model}) after ${duration}ms`);
      console.warn(`[AIChat]   type="${err.constructor?.name}" status=${err.status || err.statusCode || 'n/a'} msg="${err.message}"`);
      lastError = err;
    }
  }

  console.warn(`[AIChat] ✗ ALL models exhausted. Using built-in knowledge base fallback.`);
  return getMockChatResponse(prompt, language);
}

// Helper for Mock AI responses when API key is missing
const getMockChatResponse = (userMessage, lang = "English") => {
  const query = (userMessage || "").toLowerCase().trim();
  const isJustGreeting = /^(hi|hello|hey|namaste|pranam|who are you|who r u)\b/i.test(query);

  if (lang.toLowerCase() === "hindi" || query.includes("नमस्ते") || query.includes("मदद")) {
    if (query.includes("ration") || query.includes("राशन")) {
      return `**राशन कार्ड (Ration Card) विवरण एवं आवेदन प्रक्रिया:**\n\n*   **पात्रता:** कम आय वाले परिवार (BPL/AAY) और मध्यम आय वाले परिवार (APL)।\n*   **आवश्यक दस्तावेज:**\n    1. परिवार के सभी सदस्यों का आधार कार्ड\n    2. वर्तमान पते का प्रमाण (बिजली बिल/किरायानामा)\n    3. आय प्रमाण पत्र\n    4. परिवार के मुखिया का पासपोर्ट आकार का फोटो\n*   **आवेदन कैसे करें:**\n    1. अपने राज्य के खाद्य एवं नागरिक आपूर्ति (Food & Civil Supplies) पोर्टल पर जाएं।\n    2. 'New Ration Card' फॉर्म भरें।\n    3. दस्तावेज अपलोड करें और नजदीकी राशन दुकान (FPS) पर सत्यापन कराएं।`;
    }
    if (query.includes("ayushman") || query.includes("आयुष्मान")) {
      return `**आयुष्मान भारत योजना (PM-JAY) विवरण:**\n\n*   **लाभ:** ₹5 लाख प्रति वर्ष प्रति परिवार मुफ्त कैशलेस स्वास्थ्य बीमा।\n*   **पात्रता:** SECC 2011 डेटा के तहत पहचाने गए गरीब और वंचित परिवार।\n*   **आवश्यक दस्तावेज:**\n    1. आधार कार्ड या राशन कार्ड\n    2. मोबाइल नंबर\n*   **सत्यापन कैसे करें:**\n    1. आधिकारिक वेबसाइट (mera.pmjay.gov.in) पर जाएं या 14555 पर कॉल करें।\n    2. 'Am I Eligible' पर जांचें और नजदीकी ई-मित्र/CSC केंद्र पर जाकर आयुष्मान कार्ड बनवाएं।`;
    }
    if (isJustGreeting) {
      return `नमस्ते! मैं आपका स्मार्ट भारत नागरिक सहायक हूँ। मैं भारत सरकार की योजनाओं (जैसे राशन कार्ड, आयुष्मान भारत, पासपोर्ट, आधार) और नगर निगम की सेवाओं में आपकी सहायता कर सकता हूँ। आप क्या जानना चाहते हैं?`;
    }
    return `वर्तमान में हमारे AI मॉडल अस्थायी रूप से पुनः कनेक्ट हो रहे हैं।\n\nआपके प्रश्न "${userMessage}" के लिए:\n• आधिकारिक सरकारी सांख्यिकी और जनसांख्यिकी जानकारी के लिए भारत की जनगणना पोर्टल (censusindia.gov.in) या data.gov.in देखें।\n• सरकारी योजनाओं की जानकारी के लिए राष्ट्रीय पोर्टल (myscheme.gov.in) पर जाएं।\n• कृपया कुछ पलों बाद अपना प्रश्न पुनः भेजें।`;
  }

  // English Mock Responses
  if (query.includes("ration") || query.includes("food card")) {
    return `**Ration Card Application & Details:**\n\n*   **Eligibility:** Low-income families (BPL/Antyodaya) and middle-income families (APL) determined by state-specific criteria.\n*   **Mandatory Documents Required:**\n    1. Aadhaar Cards of all family members.\n    2. Proof of Current Address (Electricity bill, gas connection, or rent agreement).\n    3. Family income certificate.\n    4. Passport-size photograph of the Head of Family.\n*   **Step-by-Step Application:**\n    1. Visit your state's official **Food & Civil Supplies Department** website.\n    2. Register and fill out the "New Ration Card Application Form".\n    3. Upload scanned documents and submit the application.\n    4. Visit the designated Ration Inspector office if physical verification is requested.`;
  }

  if (query.includes("ayushman") || query.includes("pmjay") || query.includes("health card")) {
    return `**Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY):**\n\n*   **Benefits:** Provides paperless, cashless health coverage up to **₹5 Lakhs per family per year** for secondary and tertiary hospitalization.\n*   **Eligibility:** Identified rural and urban households based on SECC 2011 data.\n*   **Required Documents:**\n    1. Aadhaar Card / Ration Card.\n    2. Active mobile number linked with Aadhaar.\n*   **How to claim/register:**\n    1. Check your name at **mera.pmjay.gov.in** or call Toll-Free Helpline **14555**.\n    2. If eligible, visit any empaneled government/private hospital or Common Service Centre (CSC) to generate your Golden Card.`;
  }

  if (query.includes("passport")) {
    return `**New Indian Passport (Ordinary) Application Steps:**\n\n*   **Required Documents:**\n    1. **Address Proof:** Water/Electricity bill, Aadhaar Card, Rent agreement, or Passbook of active bank account.\n    2. **Date of Birth Proof:** Birth Certificate, School leaving certificate, or PAN Card.\n*   **Step-by-Step Process:**\n    1. Register on the official portal: **passportindia.gov.in**.\n    2. Fill out the application form online and select your nearest **Passport Seva Kendra (PSK)**.\n    3. Make the online payment (approx. ₹1,500) and book your appointment slot.\n    4. Attend the appointment at PSK for biometric verification and document scanning.\n    5. Police verification will follow at your registered address.`;
  }

  if (query.includes("complaint") || query.includes("pothole") || query.includes("leakage") || query.includes("garbage")) {
    return `**Civic Complaint Resolution Guidance:**\n\nTo log this complaint, please head to the **Public Issue Tracker** section in the left sidebar. There, you can fill out a form with the location and description of the issue. Our system will track its progress from 'Pending' to 'In Progress' and 'Resolved' with updates from local authorities.`;
  }

  if (isJustGreeting) {
    return `Hello! How can I assist you today with Indian government schemes, civic applications (Aadhaar, PAN, Passport, Ration Card), or municipal complaints?`;
  }

  return `Currently, live AI services are momentarily unreachable.

Regarding your question about "${userMessage}":
• For official demographic and census statistics, refer to the Census of India portal (censusindia.gov.in) or data.gov.in.
• For government schemes and citizen services, visit the national portal (myscheme.gov.in) or your state's portal.
• Please try sending your query again in a moment once connectivity is restored.`;
};

// --- API ENDPOINTS ---

// 1. Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  const prompt = req.body.prompt || req.body.message;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt or message is required.' });
  }

  const lang = req.body.language || 'English';

  try {
    const textResponse = await generateCivicChatResponse(prompt.trim(), lang);
    return res.json({ response: textResponse });
  } catch (error) {
    console.error("[AIChat Endpoint Error]:", error);
    // Graceful fallback to civic knowledge base so citizen always receives an answer
    const fallbackResponse = getMockChatResponse(prompt.trim(), lang);
    return res.json({ response: fallbackResponse });
  }
});


// 2. Issues - GET all
app.get('/api/issues', (req, res) => {
  const issues = getIssues();
  res.json(issues);
});

// 3. Issues - POST new
app.post('/api/issues', upload.single('attachment'), (req, res) => {
  const { title, description, category, location, citizenName, citizenContact, lat, lng } = req.body;

  if (!title || !description || !category || !location || !citizenName) {
    return res.status(400).json({ error: 'Please provide all mandatory fields.' });
  }

  // Parse custom lat/lng or generate mock offsets near central India/major hub
  let latitude = parseFloat(lat);
  let longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) {
    // Generate a semi-random location near New Delhi for mock mapping
    latitude = 28.61 + (Math.random() - 0.5) * 0.15;
    longitude = 77.20 + (Math.random() - 0.5) * 0.15;
  }

  const issues = getIssues();

  const newIssue = {
    id: `complaint-${Date.now().toString().slice(-6)}`,
    title,
    description,
    category,
    location,
    lat: latitude,
    lng: longitude,
    citizenName,
    citizenContact: citizenContact || "Not provided",
    status: "Pending",
    reportedAt: new Date().toISOString(),
    assignedTo: `Municipal Corporation (${category} Division)`,
    notes: "Allocated automatically. Action pending.",
    attachmentUrl: req.file ? `/uploads/${req.file.filename}` : ""
  };

  issues.unshift(newIssue);
  saveIssues(issues);

  res.status(201).json(newIssue);
});

// 4. Issues - PUT update status (Admin simulation)
app.put('/api/issues/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ["Pending", "In Progress", "Resolved"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be Pending, In Progress, or Resolved." });
  }

  const issues = getIssues();
  const index = issues.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found." });
  }

  if (status) issues[index].status = status;
  if (notes) issues[index].notes = notes;

  saveIssues(issues);

  res.json(issues[index]);
});

// 5. Verify Document requirements using Multimodal input
app.post('/api/verify-document', upload.single('document'), async (req, res) => {
  const { documentType } = req.body; // e.g. "aadhaar", "pan", "passport", "ration"
  const file = req.file;

  if (!documentType) {
    return res.status(400).json({ error: "Document type must be specified." });
  }

  // Structure output
  let response = {
    isValid: false,
    confidence: "Medium",
    detectedType: "Unknown",
    extractedData: {},
    errors: [],
    feedback: "",
    tips: []
  };

  if (!file) {
    // Return checklist guidance if no file is uploaded
    response.feedback = `No image uploaded. Please upload a scan of your ${documentType.toUpperCase()} to run validation.`;
    response.errors.push("Missing document file upload.");
    return res.json(response);
  }

  try {
    // If Gemini client is active, and file is uploaded, perform analysis
    if (genAI && file) {
      const model = genAI.getGenerativeModel({ model: MODELS_TO_TRY[0] });

      // Convert file to Generative Part
      const fileBuffer = fs.readFileSync(file.path);
      const mimeType = file.mimetype;
      const filePart = {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType
        }
      };

      const prompt = `
        You are a Document Verifier AI for Indian Public Services. 
        The user claims this document is a(n) "${documentType}".
        Inspect the uploaded document image.
        Return your analysis strictly in valid JSON format. Do not surround it with markdown backticks (such as \`\`\`json). Just return the raw JSON object.
        
        The JSON object should match the following structure:
        {
          "isValid": true/false (true if the document matches the expected type, is readable, and appears authentic),
          "detectedType": "Name of document detected (e.g. Aadhaar Card, PAN Card, Indian Passport, or Unknown)",
          "confidence": "High/Medium/Low",
          "extractedData": {
             "Name": "Name if found",
             "IDNumber": "Aadhaar/PAN/Passport number if visible",
             "ExpiryDate": "Expiry date if applicable/visible"
          },
          "errors": ["list of reasons why it might be invalid, unreadable, blurred, or mismatched"],
          "feedback": "A summary of your inspection. (e.g. Aadhaar Card detected successfully, name matches expectations.)",
          "tips": [
             "Provide 2-3 specific recommendations for Indian civic submissions (e.g. 'Ensure details match your school leaving certificate', 'Mask the first 8 digits of your Aadhaar card for privacy before upload', etc.)"
          ]
        }
      `;

      const result = await model.generateContent([prompt, filePart]);
      const resultText = result.response.text().trim();

      // Clean up markdown block tags if Gemini accidentally outputs them
      const cleanedJsonText = resultText
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();

      const parsedResponse = JSON.parse(cleanedJsonText);

      // Clean up temporary upload
      fs.unlinkSync(file.path);

      return res.json(parsedResponse);
    } else {
      // Mock File Analysis when API key is missing
      // Let's do some mock file logic based on name and simulated evaluation
      const filenameLower = file.originalname.toLowerCase();
      let matched = false;

      if (documentType === 'aadhaar' && (filenameLower.includes('aadhaar') || filenameLower.includes('aadhar') || filenameLower.includes('uidai'))) {
        matched = true;
        response.detectedType = "Aadhaar Card";
        response.extractedData = { Name: "RAHUL SHARMA", IDNumber: "XXXX XXXX 9823" };
        response.feedback = "Successfully detected UIDAI Aadhaar Card structure.";
        response.tips = [
          "Mask the first 8 digits of your Aadhaar card using online e-Aadhaar portal for extra security.",
          "Ensure your demographic details (name spelling) match your SSC certificate."
        ];
      } else if (documentType === 'pan' && (filenameLower.includes('pan') || filenameLower.includes('income'))) {
        matched = true;
        response.detectedType = "PAN Card (Income Tax Dept)";
        response.extractedData = { Name: "RAHUL SHARMA", IDNumber: "DFGPS1234F" };
        response.feedback = "PAN Card signature and photo verified successfully.";
        response.tips = [
          "Ensure your PAN is linked with your Aadhaar Card to prevent it from becoming inoperative.",
          "Ensure signatures match exactly when filing official tax forms."
        ];
      } else if (documentType === 'passport' && filenameLower.includes('passport')) {
        matched = true;
        response.detectedType = "Indian Passport Page";
        response.extractedData = { Name: "RAHUL SHARMA", IDNumber: "Z9876543", ExpiryDate: "12/10/2031" };
        response.feedback = "Passport biodata page recognized and expiration checked.";
        response.tips = [
          "Ensure the page uploaded is the laminated details page showing biographical information.",
          "Passports must have at least 6 months validity left for visa requirements."
        ];
      } else {
        // Fallback mock check
        matched = Math.random() > 0.3; // 70% chance of success for generic upload in demo
        if (matched) {
          response.detectedType = `${documentType.toUpperCase()} Document`;
          response.extractedData = { Name: "DEMO CITIZEN", IDNumber: "MOCK-123-ABC" };
          response.feedback = "Document match successful (Simulated verification).";
          response.tips = ["Keep scanned files under 2MB.", "Verify the file is oriented correctly."];
        } else {
          response.detectedType = "Unknown / Blurry";
          response.errors.push("Document type mismatch or text too blurry to extract data.");
          response.feedback = `Could not verify document details for ${documentType.toUpperCase()}.`;
          response.tips = ["Take a clear photo in good ambient lighting.", "Ensure no glare blocks the text details."];
        }
      }

      response.isValid = matched;
      response.confidence = "High (Demo Mode)";

      // Remove temp file
      fs.unlinkSync(file.path);

      setTimeout(() => {
        return res.json(response);
      }, 1000);
    }
  } catch (error) {
    console.error("Document check error:", error);
    // Clean up file if still exists
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({
      error: "Error processing document validation",
      details: error.message,
      fallback: {
        isValid: true,
        detectedType: `${documentType.toUpperCase()} (Fallback)`,
        extractedData: { Info: "Demo Verification Active" },
        feedback: "Successfully scanned document in offline fallback mode.",
        tips: ["Double check text is legible before submission."]
      }
    });
  }
});

// Serve frontend in production mode
const clientDistPath = path.join(__dirname, 'client', 'dist');
const rootDistPath = path.join(__dirname, 'dist');
const staticPath = fs.existsSync(clientDistPath) ? clientDistPath : rootDistPath;

app.use(express.static(staticPath));

// Handle client-side routing fallback for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  return res.status(404).json({ error: "Endpoint or static asset not found" });
});
console.log("Serving built frontend static assets from:", staticPath);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
