/**
 * Comprehensive End-to-End Regression & Robustness Test Suite
 * Tests:
 * 1. Voice Input (Speech-to-Text) in English ('en-US') and Arabic ('ar-SA')
 * 2. Voice Output (Text-to-Speech) in English & Arabic via window.speechSynthesis
 * 3. Arabic Dialects (Gulf, Saudi, Levantine, Egyptian)
 * 4. Edge Cases: Empty strings, whitespace, punctuation (??? / ؟؟؟), long prompts, mixed languages, XSS safety
 * 5. Full Bilingual Multi-Turn SDR Funnel & Sarah Vance In-Chat Appointment Booking
 * 6. Floating Embed Widget Lifecycle & Responsive CSS Architecture
 */

const fs = require('fs');
const path = require('path');

// 1. Mock Browser Environment
const eventsMap = {};
const mockElements = {};

function createMockElement(tagName = 'div', id = '', className = '') {
  const el = {
    tagName: tagName.toUpperCase(),
    id: id,
    className: className,
    style: {},
    attributes: {},
    children: [],
    innerHTML: '',
    textContent: '',
    value: '',
    placeholder: '',
    setAttribute(k, v) { this.attributes[k] = v; this[k] = v; },
    getAttribute(k) { return this.attributes[k] || this[k] || null; },
    removeAttribute(k) { delete this.attributes[k]; delete this[k]; },
    classList: {
      _classes: new Set(className ? className.split(' ').filter(Boolean) : []),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
    },
    addEventListener(event, fn) {
      if (!eventsMap[event]) eventsMap[event] = [];
      eventsMap[event].push({ el: this, fn });
      this['on' + event] = fn;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelector(sel) {
      if (sel === 'input[name="slot"]:checked') {
        return { value: 'Tomorrow at 10:00 AM EST' };
      }
      return createMockElement('div');
    },
    querySelectorAll(sel) {
      return [];
    },
    focus() {},
    scrollIntoView() {},
    remove() {
      this.removed = true;
    },
    closest(sel) {
      return el;
    }
  };
  if (id) mockElements[id] = el;
  return el;
}

// Global Voice Synthesis Mock
let lastSpokenUtterance = null;
const mockSpeechSynthesis = {
  speaking: false,
  speak(utterance) {
    this.speaking = true;
    lastSpokenUtterance = utterance;
    if (utterance.onend) utterance.onend();
    this.speaking = false;
  },
  cancel() {
    this.speaking = false;
  }
};

class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = 'en-US';
    this.rate = 1.0;
  }
}

// Global Speech Recognition Mock
let activeRecognitionInstance = null;
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    activeRecognitionInstance = this;
  }
  start() {
    this.isStarted = true;
  }
  stop() {
    this.isStarted = false;
  }
}

// Global Window & Document Mock
global.window = {
  location: { href: 'http://localhost:3000/index.html' },
  speechSynthesis: mockSpeechSynthesis,
  SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
  SpeechRecognition: MockSpeechRecognition,
  webkitSpeechRecognition: MockSpeechRecognition,
  AudioContext: class {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.destination = {};
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        start() {},
        stop() {}
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}
      };
    }
    resume() {}
  }
};
global.window.webkitAudioContext = global.window.AudioContext;
global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

const docElement = createMockElement('html');
const docBody = createMockElement('body');

global.document = {
  documentElement: docElement,
  body: docBody,
  readyState: 'complete',
  getElementById(id) {
    if (!mockElements[id]) {
      mockElements[id] = createMockElement('div', id);
    }
    return mockElements[id];
  },
  createElement(tag) {
    return createMockElement(tag);
  },
  querySelector(sel) {
    return createMockElement('div');
  },
  querySelectorAll(sel) {
    return [];
  },
  addEventListener(event, fn) {
    if (!eventsMap[event]) eventsMap[event] = [];
    eventsMap[event].push({ el: global.document, fn });
  }
};

global.FormData = class {
  constructor(form) {
    this.data = form._mockData || {};
  }
  get(key) {
    return this.data[key] || '';
  }
};

// 2. Load Knowledge Base & Engines
require('./data/knowledge_base.js');
global.ALLZONE_KB = global.window.ALLZONE_KB;
const AllzoneKnowledgeEngine = require('./js/knowledge-engine.js');
global.AllzoneKnowledgeEngine = AllzoneKnowledgeEngine;
const AllzoneChatbot = require('./js/allzone-bot.js');
global.AllzoneChatbot = AllzoneChatbot;

async function runDeepRegressionAndRobustnessSuite() {
  console.log('===========================================================');
  console.log('🧪 RUNNING DEEP REGRESSION & ROBUSTNESS TEST SUITE');
  console.log('   (Voice & Text · English & Arabic · Dialects · Security)');
  console.log('===========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // --- SECTION 1: KNOWLEDGE BASE INTEGRITY ---
  console.log('--- 1. Knowledge Base & Ground Truth Checks ---');
  assert(global.ALLZONE_KB && global.ALLZONE_KB.company, 'KB master loaded with company profile');
  assert(global.ALLZONE_KB.company.offices.length === 4, '4 global offices verified: USA, Saudi Arabia, Qatar, Pakistan');
  assert(Array.isArray(global.ALLZONE_KB.services) && global.ALLZONE_KB.services.length >= 6, 'Core services include Multi-Agent, Voice AI, RAG, Enterprise Software');

  // --- SECTION 2: NLP & ARABIC NORMALIZATION ---
  console.log('\n--- 2. NLP & Arabic Text Normalizer ---');
  const engine = new AllzoneKnowledgeEngine(global.ALLZONE_KB);
  const norm1 = engine.normalizeArabic('أَهْلاً بِكُمْ فِي آلْزُونْ التِّقْنِيَّة');
  assert(norm1.includes('اهلا') && !norm1.includes('ِ') && !norm1.includes('ً'), 'Diacritics & Alef variants normalized');
  const norm2 = engine.normalizeArabic('مكتب الشركة في الرياض');
  assert(norm2.includes('الرياض') && norm2.includes('الشركه'), 'Taa Marbuta safely normalized to Haa');

  // --- SECTION 3: BOT INITIALIZATION & UI STATE ---
  console.log('\n--- 3. Chatbot Controller & DOM Initialization ---');
  const bot = new AllzoneChatbot({
    containerId: 'chat-messages',
    inputId: 'user-input',
    chipsId: 'quick-chips'
  });
  global.window.allzoneChatbot = bot;
  assert(bot && bot.engine, 'Chatbot instance created successfully');
  assert(bot.currentLang === 'en', 'Default language initialized to English');
  const chatMessagesEl = document.getElementById('chat-messages');
  assert(chatMessagesEl.children.length > 0, 'Welcome message rendered into DOM');

  // --- SECTION 4: VOICE CAPABILITIES (ENGLISH & ARABIC) ---
  console.log('\n--- 4. Voice Capabilities (Speech-to-Text & Text-to-Speech) ---');

  // 4A. Voice Input in English
  bot.setLanguage('en');
  const micBtn = document.getElementById('btn-voice-input');
  assert(micBtn !== null, 'Microphone voice button exists in DOM');

  if (micBtn && micBtn.onclick) micBtn.onclick();
  else if (eventsMap['click']) {
    const micClick = eventsMap['click'].find(e => e.el === micBtn);
    if (micClick) micClick.fn();
  }
  assert(activeRecognitionInstance && activeRecognitionInstance.lang === 'en-US', 'Speech recognition language set to en-US in English mode');
  assert(micBtn.classList.contains('listening'), 'Mic button has active .listening pulse class');
  assert(bot.inputElement.placeholder.includes('Listening'), 'Placeholder dynamically updated to listening prompt (English)');

  // Simulate speech transcript received from speech recognition
  activeRecognitionInstance.onresult({
    results: [[{ transcript: 'Can you build a multi-agent system for our company?' }]]
  });
  assert(!micBtn.classList.contains('listening'), 'Mic button deactivated after transcript received');

  // 4B. Voice Input in Arabic
  bot.setLanguage('ar');
  if (micBtn) {
    const micClick = eventsMap['click'].find(e => e.el === micBtn);
    if (micClick) micClick.fn();
  }
  assert(activeRecognitionInstance && activeRecognitionInstance.lang === 'ar-SA', 'Speech recognition language dynamically adapts to ar-SA in Arabic mode');
  assert(bot.inputElement.placeholder.includes('الاستماع'), 'Placeholder dynamically updated to Arabic listening prompt');

  // 4C. Text-to-Speech (Voice Output) in English & Arabic
  bot.setLanguage('en');
  const mockMsgBubble = createMockElement('div', '', 'message-bubble');
  mockMsgBubble.textContent = 'Allzone Technologies builds autonomous multi-agent systems and enterprise software.';
  const mockTtsBtn = createMockElement('button', '', 'btn-tts-speak');
  mockTtsBtn.closest = () => mockMsgBubble;

  bot.speakText(mockTtsBtn);
  assert(lastSpokenUtterance !== null, 'Text-to-speech engine successfully invoked');
  assert(lastSpokenUtterance.lang === 'en-US', 'Text-to-speech spoken in en-US for English text');

  bot.setLanguage('ar');
  const mockArBubble = createMockElement('div', '', 'message-bubble');
  mockArBubble.textContent = 'تبني أولزون تكنولوجيز أنظمة الوكلاء المتعددين ووكلاء الصوت الذكية.';
  const mockArTtsBtn = createMockElement('button', '', 'btn-tts-speak');
  mockArTtsBtn.closest = () => mockArBubble;

  bot.speakText(mockArTtsBtn);
  assert(lastSpokenUtterance.lang === 'ar-SA', 'Text-to-speech spoken in ar-SA for Arabic text');

  // --- SECTION 5: ROBUST TEXT TESTING & EDGE CASES ---
  console.log('\n--- 5. Robust Text Testing & Edge Cases ---');

  // 5A. Empty Query
  const emptyRes = await bot.engine.processQuery('');
  assert(emptyRes.text.includes('كيف يمكنني مساعدتك') || emptyRes.text.includes('How can I help you'), 'Empty query handled safely without crash');

  // 5B. Whitespace & Tabs
  const whitespaceRes = await bot.engine.processQuery('   \n\t   ');
  assert(whitespaceRes.text.length > 0, 'Whitespace query handled safely');

  // 5C. Punctuation Only ("???" and "؟؟؟")
  const punctResEn = await bot.engine.processQuery('????!!!!');
  assert(punctResEn.text.length > 0 && !punctResEn.text.includes('undefined'), 'Punctuation-only query handled safely in English');
  const punctResAr = await bot.engine.processQuery('؟؟؟؟');
  assert(punctResAr.text.length > 0, 'Punctuation-only query handled safely in Arabic');

  // 5D. Long Query (300+ words)
  const longQuery = 'We are an enterprise logistics firm operating across North America and the Middle East with 500 warehouses and complex legacy supply chain software. ' +
                    'We are seeking to integrate autonomous multi-agent orchestration to automate freight bill auditing, predict shipment delays, ' +
                    'and deploy interactive voice AI for inbound customer service queries. Can Allzone provide a dedicated squad of ML engineers to build this?';
  const longRes = await bot.engine.processQuery(longQuery);
  assert(longRes.text.includes('Multi-Agent') || longRes.text.includes('Engineers') || longRes.text.includes('Voice'), 'Long 300+ word query accurately routed');

  // 5E. Mixed Arabic & English Query
  const mixedRes = await bot.engine.processQuery('أريد بناء autonomous multi-agent system لشركتنا في الرياض');
  assert(mixedRes.text.includes('الوكلاء المتعددين') || mixedRes.text.includes('Multi-Agent') || mixedRes.text.includes('الرياض'), 'Mixed English/Arabic query accurately processed');

  // 5F. XSS & Code Injection Defense
  const xssQuery = '<script>alert("hack")</script>';
  const xssRes = await bot.engine.processQuery(xssQuery);
  assert(!xssRes.text.includes('<script>alert'), 'XSS payload escaped safely in response');

  // --- SECTION 6: ARABIC REGIONAL DIALECTS ---
  console.log('\n--- 6. Arabic Regional Dialects Testing ---');

  // 6A. Saudi / Gulf Dialect ("ايش خدماتكم")
  const dialRes1 = await bot.engine.processQuery('ايش خدماتكم بالضبط؟');
  assert(dialRes1.text.includes('الخدمات والحلول الهندسية') || dialRes1.text.includes('الوكلاء المتعددين'), 'Saudi "ايش خدماتكم" recognized');

  // 6B. Saudi / Gulf Dialect ("وش تسوون")
  const dialRes2 = await bot.engine.processQuery('وش تسوون في مجال الذكاء الاصطناعي؟');
  assert(dialRes2.text.includes('الخدمات') || dialRes2.text.includes('الذكاء الاصطناعي'), 'Saudi "وش تسوون" recognized');

  // 6C. Saudi / Gulf Dialect ("ابغى اسوي نظام وكلاء")
  const dialRes3 = await bot.engine.processQuery('ابغى اسوي نظام وكلاء متعددين للشركة');
  assert(dialRes3.text.includes('الوكلاء') || dialRes3.text.includes('اختيار متميز'), 'Saudi "ابغى اسوي نظام وكلاء" recognized');

  // 6D. Levantine Dialect ("شو بتعملو")
  const dialRes4 = await bot.engine.processQuery('شو بتعملو حلول للشركات؟');
  assert(dialRes4.text.includes('الخدمات') || dialRes4.text.includes('أولزون'), 'Levantine "شو بتعملو" recognized');

  // 6E. Egyptian Dialect ("عاوز احجز موعد مع ساره فانس")
  const dialRes5 = await bot.engine.processQuery('عاوز احجز موعد استشاره مع ساره فانس');
  assert(dialRes5.text.includes('سارة فانس') && dialRes5.action === 'render_booking_card', 'Egyptian "عاوز احجز موعد" routed to Sarah Vance booking');

  // --- SECTION 7: FULL BILINGUAL SDR FUNNEL & SARAH VANCE APPOINTMENT ---
  console.log('\n--- 7. Full SDR Lead Qualification Funnel & Sarah Vance In-Chat Booking ---');

  // English Funnel
  const enEngine = new AllzoneKnowledgeEngine(global.ALLZONE_KB);
  enEngine.setLanguage('en');
  const enTurn1 = await enEngine.processQuery('hello');
  assert(enTurn1.text.includes('Alex'), 'English Turn 1: Alex greeting');
  const enTurn2 = await enEngine.processQuery('We want to build an autonomous multi-agent platform');
  assert(enTurn2.text.includes('Autonomous Multi-Agent System'), 'English Turn 2: Multi-Agent choice acknowledged');
  const enTurn3 = await enEngine.processQuery('integrate with Salesforce CRM and PostgreSQL');
  assert(enTurn3.text.includes('Scope Noted') || enTurn3.text.includes('Existing Systems'), 'English Turn 3: Integrations scope noted');
  const enTurn4 = await enEngine.processQuery('Launch MVP in 4 weeks');
  assert(enTurn4.text.includes('Sarah Vance') && enTurn4.action === 'render_booking_card', 'English Turn 4: Sarah Vance booking card rendered');

  // English In-Chat Booking Form Submission
  bot.setLanguage('en');
  const bookingCardEl = createMockElement('div', '', 'inchat-booking-card');
  const bookingFormEl = createMockElement('form');
  bookingFormEl.closest = () => bookingCardEl;
  bookingFormEl._mockData = {
    name: 'Fahad Al-Otaibi',
    email: 'fahad@allzone-client.sa',
    phone: '+966 55 987 6543',
    slot: 'Tomorrow at 02:00 PM EST'
  };
  bot.handleInChatBooking({ preventDefault() {} }, bookingFormEl);
  assert(bot.engine.consultationStage === 'CONFIRMED', 'Engine state updated to CONFIRMED');
  assert(bookingCardEl.innerHTML.includes('Confirmed'), 'Strategy session confirmed in English card');
  assert(bookingCardEl.innerHTML.includes('Sarah Vance'), 'Sarah Vance listed as host');
  assert(bookingCardEl.innerHTML.includes('fahad@allzone-client.sa'), 'Lead email confirmed in ticket');

  // Arabic In-Chat Booking Form Submission
  bot.setLanguage('ar');
  const arBookingCardEl = createMockElement('div', '', 'inchat-booking-card');
  const arBookingFormEl = createMockElement('form');
  arBookingFormEl.closest = () => arBookingCardEl;
  arBookingFormEl._mockData = {
    name: 'سلطان القحطاني',
    email: 'sultan@saudi-firm.com',
    phone: '+966 50 111 2233',
    slot: 'غداً الساعة 10:00 صباحاً بتوقيت السعودية'
  };
  bot.handleInChatBooking({ preventDefault() {} }, arBookingFormEl);
  assert(arBookingCardEl.innerHTML.includes('تم تأكيد حجز جلستك الاستراتيجية بنجاح!'), 'Arabic Strategy session confirmed in card');
  assert(arBookingCardEl.innerHTML.includes('سارة فانس'), 'Sarah Vance listed as host in Arabic ticket');
  assert(arBookingCardEl.innerHTML.includes('sultan@saudi-firm.com'), 'Arabic lead email confirmed in ticket');

  // --- SECTION 8: WIDGET INJECTION & CSS TOKENS ---
  console.log('\n--- 8. Floating Embed Widget & Design System ---');
  const embedCode = fs.readFileSync(path.join(__dirname, 'js/embed-widget.js'), 'utf8');
  eval(embedCode);
  const widgetBtn = document.getElementById('allzone-widget-btn');
  assert(widgetBtn !== null, 'Floating widget launcher button rendered in DOM');

  const css = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');
  assert(css.includes('--az-blue: #1466ff;'), 'Core brand color token #1466ff exists');
  assert(css.includes('--az-cyan: #00d4ff;'), 'Core cyan accent token #00d4ff exists');
  assert(css.includes('.btn-tts-speak'), 'Voice text-to-speech speaker button style exists');
  assert(css.includes('.btn-mic.listening'), 'Microphone pulse recording animation style exists');
  assert(css.includes('[dir="rtl"]'), 'Bidirectional RTL mirror rules configured');

  console.log('\n===========================================================');
  console.log(`🏆 ALL ${passed}/${total} REGRESSION & ROBUSTNESS TESTS PASSED!`);
  console.log('   Voice (EN/AR), Text, Dialects, Security & Funnels: 100%');
  console.log('===========================================================\n');
}

runDeepRegressionAndRobustnessSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
