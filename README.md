# Smart Bharat - AI-Powered Civic Companion

> A modern, responsive web application engineered to bridge the communication gap between citizens and public administration under the **Digital India** initiative. The platform simplifies public service discovery, assists with document checks, and enables real-time tracking of local civic complaints.

---

## ✨ Core Features & Module Breakdown

- 🤖 **AI Civic Companion**: An interactive conversational chatbot powered by **Google Gemini AI**. Provides real-time guidance on various government schemes (e.g., Ayushman Bharat, Ration Card registration, Passport application procedures) and civic regulations.
- 🚧 **Civic Issue Tracker**: A structured platform for users to report, view, and monitor regional civic issues such as water supply disruptions, malfunctioning street lights, and road repairs with GPS auto-tagging and a 4-stage complaint status timeline.
- 📄 **Document Assistant**: An automated utility designed to help users review policy guidelines, identify required documents, and verify prerequisites before applying for public services.
- 🌐 **Multilingual Support**: Built-in localization support (`translations.json`) enabling seamless language switching for citizen accessibility.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS / Custom CSS
- **Localization**: Custom JSON-based Translation engine (`translations.json`)

### **Backend & AI**
- **Server**: Node.js & Express (`server.js`)
- **AI Integration**: Google Gemini AI API (`@google/generative-ai`)
- **File Uploads**: Express file handling middleware (`uploads/`)

---

## 📂 Project Structure

```text
Smart_Bharat/
├── client/                     # Frontend React Application (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components & modals
│   │   ├── App.jsx             # Core Application Routing & View Management
│   │   ├── config.js           # API Endpoints & Client Configs
│   │   ├── index.css           # Global CSS Styles
│   │   ├── main.jsx            # Application Entry Point
│   │   └── translations.json   # Multilingual Translation Dictionaries
│   ├── index.html              # HTML Root
│   ├── package.json            # Frontend Dependencies
│   ├── vercel.json             # Vercel Single-Page App Redirect Config
│   └── vite.config.js          # Vite Build Configuration
├── node_modules/               # Server Dependencies
├── uploads/                    # Local storage for reported issue photo uploads
├── .gitignore                  # Untracked Git Files
├── .vercelignore               # Excluded deployment files
├── package.json                # Root Server Dependencies
├── server.js                   # Node.js/Express Backend Server & Gemini API Endpoints
├── vercel.json                 # Backend / Monorepo deployment config
└── README.md                   # Project Documentation
