# Smart Bharat - AI-Powered Civic Companion

**Smart Bharat** is a modern, responsive web application engineered to bridge the communication gap between citizens and public administration under the Digital India initiative. The platform simplifies public service discovery, assists with document checks, and enables tracking of local civic complaints through an intuitive AI interface.

---

## 🌟 Core Features & Module Breakdown

* **AI Civic Companion:** An interactive conversational module powered by Google Gemini AI. It provides real-time guidance on various government schemes (e.g., Ayushman Bharat, Ration Card registration, Passport application procedures) and civic regulations.
* **Civic Issue Tracker:** A structured platform for users to report, view, and monitor regional civic complaints such as water supply disruptions, malfunctioning street lights, and road repairs.
* **Document Assistant:** An automated utility designed to help users review policy guidelines, identify required documentation, and verify civic application requirements.
* **Responsive Multi-Device Interface:** Designed with dynamic drawer navigation and adaptive layouts for seamless usability on both mobile phones and desktop displays.
* **Multilingual Capabilities:** Built to support regional language interactions, making government processes accessible to a broader audience.

---

## 🏗️ System Architecture & Tech Stack

### Frontend
* **Framework:** React.js / Vite
* **Styling:** Tailwind CSS (Responsive Grid & Flexbox architecture)
* **Icons & UI Components:** Lucide Icons, Custom Animated Modals & Drawers

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **AI Integration:** Google Generative AI SDK (Gemini Flash Model API integration)
* **Deployment:** Render (Automated deployment via Github continuous integration)

---

## ⚙️ How the Backend & AI Integration Works

* **Express Server (`server.js`):** Acts as a secure proxy between the user frontend and Google's Generative AI servers.
* **API Endpoints:**
  * `/api/chat`: Processes user civic queries and returns formatted, context-aware responses using Gemini Flash.
  * `/api/verify-document`: Analyzes user inputs regarding document checklist validation for public schemes.
* **Static File Serving:** Serves compiled frontend assets directly in production for unified deployment.

---


