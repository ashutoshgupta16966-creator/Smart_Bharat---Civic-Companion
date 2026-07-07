# Smart Bharat - AI-Powered Civic Companion 🇮🇳

**Smart Bharat** is a production-ready, Generative AI-powered civic platform designed for the official **PromptWars 2026** challenge. It bridges the gap between citizens and municipal authorities by simplifying access to public schemes, tracking civic grievances on a visual map, and using AI to check formatting/mismatches on mandatory public documents.

---

## Key Features

1.  **AI Civic Companion (Chatbot)**: A multilingual digital assistant (supporting English, Hindi, Bengali, Tamil, Telugu) built on Google Gemini to explain entitlements, check eligibility, and guide citizens. Features built-in browser-native **Text-to-Speech (TTS)** and **Voice-to-Text Speech Recognition**.
2.  **Public Issue Tracker**: Log complaints (e.g. potholes, water leaks, streetlights, garbage pileups) with locations, photos, and descriptions. View complaints pinned geographically on an interactive coordinate-mapped SVG map of India.
3.  **Document Requirements Assistant**: Review step-by-step checklist guides for major services (Aadhaar Card, Passport, Ration Card, PAN Card).
4.  **AI Document Scanner**: Upload digital scans of documents (mock scans or actual cards) to verify layout structures, name spellings, ID patterns, and safety recommendations (like masking Aadhaar details).
5.  **Analytics Dashboard (Overview)**: Premium command center detailing live status widgets, resolution charts (built with Recharts), and real-time municipal notification feeds.
6.  **Responsive Light/Dark Mode**: A glassmorphic design system using CSS variables with fluid layout animations.

---

## Tech Stack

*   **Backend**: Node.js, Express, Multer, dotenv, CORS, `@google/generative-ai` SDK.
*   **Frontend**: React (Vite), Lucide Icons, Recharts (responsive graphing).
*   **Design**: Custom Vanilla CSS (Design Tokens, HSL tailormade palettes).
*   **Deployment**: Multi-stage Docker configurations optimized for **Google Cloud Run**.

---

## Folder Structure

```
PromptWars_2026/
├── .env.example          # Template environment file
├── .gitignore            # Git exclusions
├── Dockerfile            # Container definition for Cloud Run
├── package.json          # Monorepo/Root package conductor
├── server.js             # Express server (APIs & Static file serving)
├── db.json               # Seeded local database (auto-generated)
└── client/               # Vite React Frontend
    ├── package.json      # React project files
    ├── vite.config.js    # Vite config with API proxy
    ├── index.html        # Entry index and Google Fonts
    └── src/
        ├── main.jsx      # Entry react renderer
        ├── App.jsx       # Layout orchestrator & router
        ├── index.css     # Premium design system stylesheet
        └── components/
            ├── Sidebar.jsx           # Sidebar & theme toggles
            ├── Overview.jsx          # Analytics & News bulletins
            ├── AIChatbot.jsx         # Chatbot with voice TTS/STT
            ├── IssueTracker.jsx      # Grievances form and SVG India map
            └── DocumentAssistant.jsx  # Checklists & dropzone verifier
```

---

## Local Setup & Development

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Set Up Environment Variables
Create a `.env` file in the root folder:
```bash
cp .env.example .env
```
Open `.env` and fill in your Gemini API Key:
```env
PORT=5000
GEMINI_API_KEY=your_actual_google_gemini_api_key_here
```
> [!NOTE]
> If `GEMINI_API_KEY` is not provided or left blank, the application will run in **Mock Demo Mode**. The AI chatbot and document checker will return realistic simulated results, allowing full user experience without requiring an active API key out-of-the-box.

### 3. Install Dependencies
Run the utility script in the root directory to install packages for both the backend and client frontend:
```bash
npm run install-all
```

### 4. Run Development Servers
Start both the Express backend (port 5000) and the Vite frontend (port 3000) concurrently with:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to view the application.

---

## Production Build & Local Serve

To compile the React client code and serve it from the Express server:
```bash
# Build React client
npm run build

# Start Express production server
npm start
```
Go to **`http://localhost:5000`** to view the production app.

---

## Deployment to Google Cloud Run

To containerize and deploy this application to Google Cloud Run, follow these steps:

### 1. Build and push image to Google Artifact Registry
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/smart-bharat
```

### 2. Deploy to Google Cloud Run
```bash
gcloud run deploy smart-bharat \
  --image gcr.io/YOUR_PROJECT_ID/smart-bharat \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_gemini_api_key_here \
  --port 8080
```
*(Cloud Run will provide a secure `https://...` URL for the live web application)*
