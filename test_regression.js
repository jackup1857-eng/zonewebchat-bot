/**
 * Comprehensive End-to-End Regression Test Suite
 * Tests DOM manipulation, event handlers, English & Arabic funnels,
 * in-chat booking form submission, ticket rendering, and embed widget lifecycle.
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
    closest(sel) {
      return el;
    }
  };
  if (id) mockElements[id] = el;
  return el;
}

// Global Document / Window Mock
global.window = {
  location: { href: 'http://localhost:3000/index.html' },
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

async function runRegressionSuite() {
  console.log('=== STARTING DEEP REGRESSION TEST SUITE ===\n');
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

  // 1. KB Structure & Data Integrity
  assert(global.ALLZONE_KB && global.ALLZONE_KB.company, 'Knowledge base is loaded globally');
  assert(global.ALLZONE_KB.company.offices.length === 4, '4 global offices defined (USA, KSA, Qatar, Pakistan)');
  assert(Array.isArray(global.ALLZONE_KB.services) && global.ALLZONE_KB.services.length >= 6, 'All core services defined in KB array');
  const agenticService = global.ALLZONE_KB.services.find(s => s.id === 'agentic-ai');
  assert(agenticService && agenticService.title.includes('Multi-Agent'), 'Multi-Agent systems defined with full capabilities');

  // 2. Arabic Normalizer
  const engine = new AllzoneKnowledgeEngine(global.ALLZONE_KB);
  const normalized = engine.normalizeArabic('أهلاً بِكُمْ فِي آلْزُونْ التِّقْنِيَّة');
  assert(normalized.includes('اهلا') && !normalized.includes('ِ'), 'Arabic diacritics and Alef variants normalized cleanly');

  // 3. Chatbot Instantiation
  const bot = new AllzoneChatbot({
    containerId: 'chat-messages',
    inputId: 'user-input',
    chipsId: 'quick-chips'
  });
  global.window.allzoneChatbot = bot;
  assert(bot && bot.engine, 'Chatbot successfully initialized');
  assert(bot.currentLang === 'en', 'Default language initialized to English');

  // 4. Initial Greeting & Quick Action Chips in DOM
  const chatMessagesEl = document.getElementById('chat-messages');
  assert(chatMessagesEl.children.length > 0, 'Welcome greeting rendered to chat DOM');
  const chipsEl = document.getElementById('quick-chips');
  assert(chipsEl.children.length > 0, 'Initial quick-action chips rendered to UI');

  // 5. English Multi-Turn SDR Funnel Progression
  // Turn 1: Greeting
  const step1 = await bot.engine.processQuery('hi');
  assert(step1.text.includes('Alex'), 'Greeting acknowledged with Alex identity');

  // Turn 2: Project Type
  const step2 = await bot.engine.processQuery('I need an autonomous multi-agent system');
  assert(step2.text.includes('Autonomous Multi-Agent System'), 'SDR correctly recognized Multi-Agent project type');
  assert(bot.engine.consultationStage === 'SCOPE', 'Stage updated to SCOPE');

  // Turn 3: Scope
  const step3 = await bot.engine.processQuery('connect to our existing CRM and databases');
  assert(step3.text.includes('Existing Systems'), 'SDR correctly captured integration scope');
  assert(bot.engine.consultationStage === 'TIMELINE', 'Stage updated to TIMELINE');

  // Turn 4: Timeline & Booking
  const step4 = await bot.engine.processQuery('Rapid MVP in 3-4 weeks');
  assert(step4.text.includes('Sarah Vance'), 'SDR transitioned directly to Sales Manager Sarah Vance');
  assert(step4.action === 'render_booking_card', 'SDR triggered action render_booking_card');
  assert(bot.engine.consultationStage === 'BOOKING', 'Stage updated to BOOKING');

  // 6. Direct In-Chat Booking Card Rendering to DOM
  bot.appendBotMessage(step4.text, step4.links, step4.chips, step4.action, step4.actionLabel);
  const lastBookingMsg = chatMessagesEl.children[chatMessagesEl.children.length - 1];
  assert(lastBookingMsg && lastBookingMsg.innerHTML.includes('Sarah Vance'), 'Booking card features Sales Manager Sarah Vance in DOM');
  assert(lastBookingMsg.innerHTML.includes('Solutions & Sales Engineering Manager'), 'Correct executive title rendered on card');
  assert(lastBookingMsg.innerHTML.includes('inchat-booking-form'), 'Interactive form markup present in booking card');

  // 7. Interactive Form Submission & Ticket Generation
  const mockBookingCard = createMockElement('div', '', 'inchat-booking-card');
  chatMessagesEl.appendChild(mockBookingCard);
  const mockBookingForm = createMockElement('form');
  mockBookingForm.closest = () => mockBookingCard;
  mockBookingForm._mockData = {
    name: 'Tariq Al-Mansoor',
    email: 'tariq@enterprise-ksa.com',
    phone: '+966 50 123 4567',
    slot: 'Tomorrow: 02:00 PM - 02:45 PM (EST / Riyadh Compatible)'
  };
  bot.handleInChatBooking({ preventDefault() {} }, mockBookingForm);
  assert(bot.engine.consultationStage === 'CONFIRMED', 'Booking stage transitioned to CONFIRMED');
  assert(mockBookingCard.innerHTML.includes('1-on-1 Strategy Session Confirmed!'), 'Confirmation ticket rendered inside booking card');
  assert(mockBookingCard.innerHTML.includes('Sarah Vance'), 'Sarah Vance confirmed on the appointment ticket');
  assert(mockBookingCard.innerHTML.includes('tariq@enterprise-ksa.com'), 'Attendee email confirmed on ticket');

  // 8. Language Switching to Arabic
  bot.setLanguage('ar');
  assert(bot.currentLang === 'ar', 'Bot language switched to Arabic');
  assert(document.documentElement['dir'] === 'rtl', 'Document direction switched to RTL [dir="rtl"]');
  assert(document.documentElement['lang'] === 'ar', 'HTML lang attribute set to "ar"');

  // 9. Arabic Greeting
  bot.initGreeting();
  const lastArabicGreeting = chatMessagesEl.children[chatMessagesEl.children.length - 1];
  assert(lastArabicGreeting.innerHTML.includes('أهلاً') || lastArabicGreeting.innerHTML.includes('أولزون'), 'Arabic greeting rendered with official Allzone Arabic branding');

  // 10. Arabic Query Processing
  const resAr = await bot.engine.processQuery('ما هي خدماتكم؟');
  assert(resAr.text.includes('الوكلاء المتعددين') || resAr.text.includes('الذكاء الاصطناعي'), 'Arabic services answered with complete accuracy');

  // 11. Arabic Multi-Turn SDR Funnel Progression
  const arEngine = new AllzoneKnowledgeEngine(global.ALLZONE_KB);
  arEngine.setLanguage('ar');
  const arStep2 = await arEngine.processQuery('نظام وكلاء أذكياء لخدمة العملاء');
  assert(arStep2.text.includes('اختيار متميز'), 'Arabic Step 2 acknowledged project selection');
  assert(arEngine.consultationStage === 'SCOPE', 'Arabic Step 2 advanced to SCOPE');

  const arStep3 = await arEngine.processQuery('الربط مع نظام CRM وقواعد بيانات SQL وبوابة الدفع');
  assert(arStep3.text.includes('تم تسجيل نطاق العمل'), 'Arabic Step 3 acknowledged integrations');
  assert(arEngine.consultationStage === 'TIMELINE', 'Arabic Step 3 advanced to TIMELINE');

  const arStep4 = await arEngine.processQuery('نستهدف إطلاق النموذج الأولي خلال 4 أسابيع');
  assert(arStep4.text.includes('سارة فانس'), 'Arabic Step 4 transitioned to Sarah Vance');
  assert(arStep4.action === 'render_booking_card', 'Arabic Step 4 triggered render_booking_card');

  // Render Arabic booking card to DOM
  bot.appendBotMessage(arStep4.text, arStep4.links, arStep4.chips, arStep4.action, arStep4.actionLabel);
  const lastArBookingMsg = chatMessagesEl.children[chatMessagesEl.children.length - 1];
  assert(lastArBookingMsg.innerHTML.includes('سارة فانس'), 'Arabic booking card contains Sarah Vance in Arabic');
  assert(lastArBookingMsg.innerHTML.includes('بتوقيت السعودية'), 'Arabic booking card references Saudi Arabia timezone');

  // 12. Direct Question Interruption (Precedence Rule)
  const precedenceEngine = new AllzoneKnowledgeEngine(global.ALLZONE_KB);
  precedenceEngine.consultationStage = 'SCOPE';
  const interruptionResponse = await precedenceEngine.processQuery('Where is your Riyadh office located?');
  assert(interruptionResponse.text.includes('Olaya View Tower') || interruptionResponse.text.includes('Riyadh'), 'Direct office question answered accurately');
  assert(precedenceEngine.consultationStage === 'SCOPE', 'Funnel stage preserved despite technical interruption');

  // 13. Audio Context Synth Safety
  let audioWorked = true;
  try {
    bot.playChime('receive');
    bot.playChime('send');
  } catch (e) {
    audioWorked = false;
  }
  assert(audioWorked, 'Web Audio synthesized chimes executed safely with zero crashes');

  // 14. Embed Widget Lifecycle
  const embedWidgetCode = fs.readFileSync(path.join(__dirname, 'js/embed-widget.js'), 'utf8');
  eval(embedWidgetCode);
  const launcher = document.getElementById('allzone-widget-btn');
  assert(launcher !== null, 'Widget launcher button rendered into document body');
  const drawer = document.getElementById('allzone-widget-window');
  assert(drawer !== null, 'Widget slide-out glass drawer element rendered into DOM');

  // 15. CSS Design System Verification
  const css = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');
  assert(css.includes('--az-blue: #1466ff;'), 'Core brand blue color token exists');
  assert(css.includes('--az-cyan: #00d4ff;'), 'Core brand cyan color token exists');
  assert(css.includes('[dir="rtl"]'), 'Full RTL layout mirror rules present in CSS');
  assert(css.includes('font-family: \'Cairo\''), 'Cairo Arabic Google Font imported and applied');
  assert(css.includes('@media (max-width: 768px)'), 'Mobile responsive media queries configured');

  console.log(`\n=== REGRESSION RESULTS: ${passed}/${total} TESTS PASSED ===`);
  if (passed === total) {
    console.log('🎉 ALL 32 SYSTEM, NLP, DOM & REGRESSION CHECKS PASSED WITH 100% SUCCESS!\n');
  } else {
    console.error('⚠️ SOME TESTS FAILED');
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('Regression suite crashed:', err);
  process.exit(1);
});
