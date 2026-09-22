# Allzone Technologies AI Services Chatbot 🤖

An intelligent, production-ready Web Chatbot built for **Allzone Technologies** to answer questions about company services—with deep expertise in **Multi-Agent Systems, Agentic AI, AI Voice Agents, RAG Knowledge Platforms, Custom Enterprise Software, and Dedicated Squads**.

Ground-truth knowledge is derived directly from the official [Allzone Technologies Sitemap](https://www.allzonetech.com/sitemap.xml).

> [!TIP]
> **Developer Handover Guide:** For detailed architecture diagrams, webhook integration (HubSpot/Salesforce/Zapier), external LLM hookup, and custom embedding instructions, see [DEVELOPER_HANDOVER.md](file:///Users/azt/Desktop/allzoneweb-agent/DEVELOPER_HANDOVER.md).

---

## 🌟 Key Features

1. **Multi-Agent & Agentic AI Expertise:**
   - Explains multi-agent workflow orchestration, tool & API calling, human checkpoints, and enterprise guardrails.
   - Showcases real Allzone case studies (*Agentic Engineering Platform*, *Manufacturing Agent Platform*, *Customer Support Agentic Platform*).

2. **Full-Spectrum Service Coverage:**
   - **AI Voice Agents:** Real-time speech, low-latency barge-in handling, telephony (Twilio/Vonage), and human handoff.
   - **RAG & Enterprise Knowledge Systems:** Document ingestion, chunking, vector search (Pinecone/Qdrant/pgvector), citations, and zero hallucinations.
   - **Enterprise Software Development:** Bespoke ERP/CRM platforms, legacy modernization, and system integration.
   - **Staff Augmentation / Dedicated Teams:** Pre-vetted senior AI/ML engineers and full-stack squads.
   - **DevOps & Cloud:** GPU cluster management, Kubernetes scaling, and FinOps cost optimization.

3. **100% In-Browser Semantic Retrieval (Zero Setup Required):**
   - Operates with zero external API dependencies or subscription keys.
   - Works immediately out of the box via an in-memory semantic token engine.

4. **Interactive Lead Capture Flow:**
   - Interactive modal and chat actions allowing prospective clients to submit project discovery inquiries directly inside the chat.

5. **Dual Display Modes:**
   - **Standalone Showcase Portal (`index.html`):** Full-screen split layout featuring an interactive service explorer, live chatbot, track-record statistics, and global office locations (USA, Saudi Arabia, Qatar, Pakistan).
   - **Floating Embed Widget (`embed-demo.html`):** Lightweight plug-and-play widget that can be embedded into any website using one script tag.

6. **Rich Visual Aesthetics:**
   - Dark theme inspired by Allzone Technologies' brand identity (`#1466ff` blue, `#00d4ff` cyan, glassmorphic card overlays, responsive design, audio feedback).

---

## 🚀 Quick Start

### Option 1: Using Python
```bash
python3 server.py
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Using NPM
```bash
npm start
```

### Option 3: Direct Browser File
Simply open `index.html` or `embed-demo.html` directly in your browser.

---

## 🔌 How to Embed into Any Website

Add the following lines before the closing `</body>` tag of your website:

```html
<!-- Allzone Chatbot Widget -->
<link rel="stylesheet" href="https://your-domain.com/css/style.css" />
<script src="https://your-domain.com/data/knowledge_base.js"></script>
<script src="https://your-domain.com/js/knowledge-engine.js"></script>
<script src="https://your-domain.com/js/allzone-bot.js"></script>
<script src="https://your-domain.com/js/embed-widget.js"></script>
```

---

## 🧪 Testing the Knowledge Retrieval Engine

Run the automated test suite to verify accurate question-answering across all core services:

```bash
npm test
# or
node test_engine.js
```

---

## 📁 Project Directory Structure

```
allzoneweb-agent/
├── index.html              # Standalone showcase portal
├── embed-demo.html         # Live embeddable widget demo
├── package.json            # Node scripts & configuration
├── server.py               # Local dev server with CORS support
├── test_engine.js          # Automated question-answering test suite
├── css/
│   └── style.css           # Design system, glassmorphism & responsive styles
├── data/
│   ├── generate_kb.py      # Knowledge synthesis generator
│   ├── knowledge_base.json # Structured knowledge graph
│   └── knowledge_base.js   # Browser-friendly script bundle
└── js/
    ├── knowledge-engine.js # Semantic matching & intent classifier
    ├── allzone-bot.js      # Chatbot UI controller & audio chime
    └── embed-widget.js     # Floating widget launcher
```
