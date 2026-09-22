# 🛠️ Developer Handover & Integration Guide
## Allzone Technologies AI Services Chatbot & Consultative SDR Agent

Welcome! This document provides a complete technical handover for any software engineer or DevOps specialist picking up, maintaining, customizing, or deploying the **Allzone Technologies AI Chatbot**.

---

## 1. 📐 System Architecture & Overview

The chatbot is built with a **high-performance, zero-dependency client-side architecture**:
- **Pure Web Standards:** HTML5, Vanilla ES6+ JavaScript, Vanilla CSS3 (no heavy Node dependencies, React, or build steps required to run).
- **Zero External API Cost:** Runs an instant in-memory semantic token retrieval engine directly in the user's browser—meaning **$0 API bills**, no OpenAI/Anthropic quota exhaustion, and sub-millisecond response latency.
- **Optional LLM Ready:** Architected so that external LLM endpoints (OpenAI, Claude, or custom FastAPI) can be plugged in seamlessly if generative synthesis is needed in the future.
- **Bilingual (English & Arabic):** Full parity between English and native Arabic (العربية) with automatic language detection, Arabic normalization, and bidirectional RTL layout mirroring.
- **Consultative SDR State Machine:** Rather than simple static FAQ answers, the bot actively qualifies leads through an automated Sales Development Representative (SDR) discovery funnel and offers direct appointment booking with **Sarah Vance (Senior Solutions & Sales Engineering Manager)**.

```
                  ┌──────────────────────────────────────────────┐
                  │                 User Query                   │
                  └──────────────────────┬───────────────────────┘
                                         │
                         Is query Arabic or lang == 'ar'?
                                  ├── Yes ──► Arabic Normalizer (strip diacritics, Alef/Taa)
                                  └── No  ──► English Lowercase Tokenizer
                                         │
                    ┌────────────────────┴─────────────────────┐
                    ▼                                          ▼
     Direct Question Check                        Consultative SDR Funnel
  (What is, Where, Pricing, Team)             (Project Type ──► Scope ──► Timeline)
                    │                                          │
                    ▼                                          ▼
          Service / FAQ Match                        In-Chat Booking Card
     (Multi-Agent, Voice AI, RAG)                     (Sarah Vance / Calendar)
                    │                                          │
                    └────────────────────┬─────────────────────┘
                                         ▼
                            Rendered to UI with Chime &
                              Contextual Action Chips
```

---

## 2. ⚡ Quick Start (Running Locally)

### Option A: Python (Recommended)
A lightweight Python 3 server with CORS and cache-control headers is included in the root directory:
```bash
python3 server.py
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B: Node.js / NPM
```bash
npm start
```
Runs `python3 server.py` via `package.json`.

### Option C: Any Static Web Server
Because the project has zero build step, you can serve it with any HTTP server:
```bash
# Using npx serve
npx serve . -p 3000

# Using PHP
php -S localhost:3000

# Or simply open index.html directly in Google Chrome / Safari / Edge
```

---

## 3. 📁 Codebase Directory Structure

```
allzoneweb-agent/
├── index.html              # Main Single-Window AI Chat Application (Production Interface)
├── embed-demo.html         # Live demo of the Floating Embed Widget
├── DEVELOPER_HANDOVER.md   # This comprehensive technical handover guide
├── README.md               # High-level product summary & features
├── package.json            # Node scripts (npm start, npm test)
├── server.py               # Local development HTTP server with CORS headers
├── test_engine.js          # Automated test suite (26 unit tests + dual SDR funnels)
│
├── css/
│   └── style.css           # Full design system (Glassmorphism, Dark Mode, Cairo/Inter, RTL)
│
├── data/
│   ├── knowledge_base.json # Master structured knowledge graph (Sitemap grounded)
│   ├── knowledge_base.js   # Browser-friendly global window.ALLZONE_KB bundle
│   └── generate_kb.py      # Python script to compile/update the knowledge base
│
└── js/
    ├── knowledge-engine.js # Semantic matching, Arabic normalization & SDR state machine
    ├── allzone-bot.js      # UI controller, Web Audio synth, speech-to-text, booking card
    └── embed-widget.js     # Standalone floating launcher for third-party websites
```

---

## 4. 🧠 Core Component Deep Dive

### 4.1 Knowledge Base (`data/knowledge_base.json` & `data/knowledge_base.js`)
All ground-truth facts are synthesized from the official [Allzone Technologies Sitemap](https://www.allzonetech.com/sitemap.xml):
- **Company Profile:** Founded 2014, 10+ years experience, CEO **Irshad Kanwal**, 250+ enterprise deliveries.
- **Physical Offices:** 
  - 🇸🇦 **Saudi Arabia (Riyadh):** Olaya View Tower, King Fahad Road.
  - 🇶🇦 **Qatar (Doha):** QFC Tower 1.
  - 🇺🇸 **USA:** Cedar Park, Texas.
  - 🇵🇰 **Pakistan:** Johar Town, Lahore.
- **Disciplines & Services:** Multi-Agent Systems (Agentic AI), AI Voice Agents, RAG Knowledge Bases, Custom Enterprise Software, Dedicated ML Squads, Cloud DevOps & FinOps.
- **Live Case Studies:** *Agentic Engineering Platform*, *Manufacturing Agent Platform*, *Customer Support Agentic Platform*.

### 4.2 Retrieval Engine & SDR Funnel (`js/knowledge-engine.js`)
- **Class:** `AllzoneKnowledgeEngine`
- **Normalization:** `normalizeArabic(text)` removes diacritics/tashkeel (`َ ً ُ ٌ ِ ٍ ّ ْ`), unifies Alef variants (`[إأآا]` $\rightarrow$ `ا`), Taa Marbuta (`ة` $\rightarrow$ `ه`), and Alef Maksura (`ى` $\rightarrow$ `ي`).
- **Discovery Progression State:**
  ```javascript
  engine.consultationStage // 'INIT' -> 'DISCOVERY' -> 'SCOPE' -> 'TIMELINE' -> 'BOOKING' -> 'CONFIRMED'
  engine.leadData // { projectType, integrationNeed, timeline, fullName, email, phone, slot }
  ```
- **Informational Precedence:** If a user interrupts the discovery funnel with a direct technical question (*"where are your offices?"* or *"ما هي خدماتكم؟"*), the engine answers the question immediately without losing the user's progress in the funnel.

### 4.3 Chatbot UI Controller (`js/allzone-bot.js`)
- **Class:** `AllzoneChatbot`
- **Audio Feedback:** Synthesizes pleasant two-tone chimes using the native browser `AudioContext` (no external MP3/WAV files required).
- **Speech Recognition:** Integrates native `webkitSpeechRecognition` for microphone voice input.
- **In-Chat Booking Card:** Directly renders an interactive slot picker and lead submission form inside the message stream.

---

## 5. 🔌 How to Connect External APIs / Webhooks

### 5.1 Connecting the Booking Form to CRM / Webhook (HubSpot, Salesforce, Zapier)
In `js/allzone-bot.js`, find the `handleInChatBooking(e, form)` method (around line 310). 

Replace or augment the local confirmation with a `fetch()` call to your API or webhook:

```javascript
// Inside js/allzone-bot.js -> handleInChatBooking()
handleInChatBooking(e, form) {
  e.preventDefault();
  const formData = new FormData(form);
  
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    slot: formData.get('slot'),
    projectType: this.engine.leadData.projectType || 'General AI Discovery',
    integrationNeed: this.engine.leadData.integrationNeed || 'Not specified',
    timeline: this.engine.leadData.timeline || 'Immediate',
    language: this.currentLang,
    sourceUrl: window.location.href,
    submittedAt: new Date().toISOString()
  };

  // SEND TO YOUR WEBHOOK / BACKEND ENDPOINT:
  fetch('https://api.allzonetech.com/api/v1/leads/booking', { // Or Zapier/HubSpot Webhook URL
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => console.log('Booking synced to CRM:', data))
  .catch(err => console.error('Failed to sync booking:', err));

  // Render the confirmed card in the chat UI
  // (Existing card rendering code...)
}
```

### 5.2 Connecting an External LLM (OpenAI / Claude / Custom API)
If you want to use an LLM for fallback responses or dynamic generation, modify `processQuery(userQuery)` in `js/knowledge-engine.js`:

```javascript
// In js/knowledge-engine.js
async processQuery(userQuery) {
  // 1. Try local exact match first (instant, free, zero latency)
  const localMatch = this.findHighConfidenceMatch(userQuery);
  if (localMatch) {
    return localMatch;
  }

  // 2. Otherwise, delegate to your LLM endpoint with grounded KB context
  try {
    const response = await fetch('https://api.allzonetech.com/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: this.history,
        context: this.kb.services,
        language: this.lang
      })
    });
    const data = await response.json();
    return {
      text: data.reply,
      chips: data.suggestedChips || ["Tell me about Multi-Agent Systems", "Book Consultation"]
    };
  } catch (err) {
    // 3. Fallback to local rule engine if network fails
    return this.handleFallback(userQuery);
  }
}
```

---

## 6. 🌐 How to Embed on Any Website (WordPress, Webflow, React, Shopify)

### Option 1: Floating Launcher Widget (Recommended for Existing Sites)
Add these 5 tags before `</body>` on any webpage:

```html
<!-- 1. Allzone Chat Styles -->
<link rel="stylesheet" href="https://your-cdn-or-host.com/css/style.css" />

<!-- 2. Knowledge Base & Engines -->
<script src="https://your-cdn-or-host.com/data/knowledge_base.js"></script>
<script src="https://your-cdn-or-host.com/js/knowledge-engine.js"></script>
<script src="https://your-cdn-or-host.com/js/allzone-bot.js"></script>

<!-- 3. Floating Widget Injector -->
<script src="https://your-cdn-or-host.com/js/embed-widget.js"></script>
```
*Note: Test this live by loading `embed-demo.html`.*

### Option 2: Embedded Container (Within an Existing Page Layout)
To place the chat directly inside a `<div>` in an existing page:

```html
<div id="my-chat-container">
  <div id="chat-messages" class="messages-viewport"></div>
  <div id="quick-chips" class="chips-container"></div>
  <form id="chat-form">
    <input type="text" id="user-input" class="chat-input" placeholder="Ask a question..." />
    <button type="submit" class="btn-send">Send</button>
  </form>
</div>

<script src="data/knowledge_base.js"></script>
<script src="js/knowledge-engine.js"></script>
<script src="js/allzone-bot.js"></script>
<script>
  window.allzoneChatbot = new AllzoneChatbot({
    containerId: 'chat-messages',
    inputId: 'user-input',
    chipsId: 'quick-chips',
    isWidget: false
  });
</script>
```

---

## 7. 🧪 Testing & Quality Assurance

A Node.js test suite is included in the project root: `test_engine.js`.

### Running the Tests:
```bash
npm test
# or
node test_engine.js
```

### What is Tested:
1. **18 English Single-Turn Queries:** Multi-agent systems, Voice AI, RAG, Cedar Park office, CEO Irshad Kanwal, Dedicated engineers, Case studies, Pricing, Timelines, Web dev, LLM models, and Sales Manager booking.
2. **8 Arabic Single-Turn Queries:** Services overview (`ما هي خدماتكم؟`), what do you offer (`ماذا تقدمون؟`), CEO (`من هو المدير التنفيذي؟`), timeline (`كم يستغرق المشروع؟`), hiring engineers (`توظيف مطورين ومهندسين`), case studies (`دراسات الحالة`), industries (`القطاعات`), and mobile/web apps.
3. **English Multi-Turn SDR Funnel:** Full qualification sequence (`Greeting` $\rightarrow$ `Project Type` $\rightarrow$ `Scope` $\rightarrow$ `Timeline & Booking`).
4. **Arabic Multi-Turn SDR Funnel:** Full qualification sequence in Arabic (`الترحيب` $\rightarrow$ `تحديد المشروع` $\rightarrow$ `نطاق العمل` $\rightarrow$ `حجز سارة فانس`).

**Current Status:** All **26/26 tests pass** with 100% precision.

---

## 8. ⚙️ Key Configuration & Customization Points

| Setting / Field | Location in Code | Description |
| :--- | :--- | :--- |
| **Sales Manager Profile** | `js/allzone-bot.js` & `js/knowledge-engine.js` | Name: **Sarah Vance**, Title: **Senior Solutions & Sales Engineering Manager** |
| **Available Slots** | `js/allzone-bot.js` (`slot-picker-row`) | Default slots: Tomorrow 10:00 AM, 02:00 PM, 04:30 PM, In 2 Days 11:30 AM |
| **Office Locations** | `data/knowledge_base.json` (`company.offices`) | USA (Texas), Saudi Arabia (Riyadh), Qatar (Doha), Pakistan (Lahore) |
| **Contact Phone / Email** | `data/knowledge_base.json` (`company.phone`, `company.email`) | `+1 (408) 850-5081` & `services@allzonetech.com` |
| **Colors & Glows** | `css/style.css` (`:root`) | `--az-blue: #1466ff;`, `--az-cyan: #00d4ff;`, `--az-dark: #060911;` |
| **Arabic Font** | `css/style.css` (`[dir="rtl"]`) | Google Font **Cairo** with fallback to system fonts |

---

## 9. 🚀 Production Deployment Checklist

When deploying to production (e.g. AWS S3 + CloudFront, Vercel, Netlify, or Apache/Nginx):
1. [ ] Ensure static asset caching headers (`Cache-Control: public, max-age=3600`) are configured on your CDN.
2. [ ] If serving from a CDN or different domain than the parent website, ensure CORS headers (`Access-Control-Allow-Origin: *`) are enabled for `.css` and `.js` files.
3. [ ] If connecting to a CRM/Calendar webhook, update the endpoint URL in `js/allzone-bot.js` $\rightarrow$ `handleInChatBooking`.
4. [ ] Ensure HTTPS is enabled (required for browser Web Speech API voice input).
5. [ ] Run `npm test` before pushing any modifications to ensure 100% test coverage remains intact.
