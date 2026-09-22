/**
 * Allzone Technologies - Chatbot Controller
 * Manages conversation UI, audio chime, markdown formatting, speech recognition,
 * and consultation lead capture.
 */

class AllzoneChatbot {
  constructor(options = {}) {
    this.containerId = options.containerId || 'chat-messages';
    this.inputId = options.inputId || 'user-input';
    this.chipsId = options.chipsId || 'quick-chips';
    this.isWidget = options.isWidget || false;
    this.engine = new AllzoneKnowledgeEngine(window.ALLZONE_KB || null);
    
    this.soundEnabled = true;
    this.audioCtx = null;
    this.isThinking = false;
    this.currentLang = 'en';
    
    this.initElements();
    this.bindEvents();
    this.initGreeting();
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.engine.setLanguage(lang);

    const isAr = lang === 'ar';
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
    if (isAr) {
      document.body.classList.add('rtl-mode');
      if (this.inputElement) {
        this.inputElement.placeholder = "اسأل أي سؤال عن أنظمة الوكلاء المتعددين، وكلاء الصوت، أو خدمات أولزون الهندسية...";
      }
      // Update header elements if present
      const brandH1 = document.querySelector('.brand-info h1');
      if (brandH1) brandH1.innerHTML = 'مساعد أولزون الذكي <span class="status-badge"><span class="status-dot"></span> متصل</span>';
      const brandP = document.querySelector('.brand-info p');
      if (brandP) brandP.textContent = 'أنظمة الوكلاء المتعددين · وكلاء الصوت · RAG · البرمجيات المؤسسية';
      const consultationBtn = document.getElementById('btn-header-consultation');
      if (consultationBtn) {
        consultationBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          حجز استشارة 📅
        `;
      }
      const disclaimer = document.querySelector('.input-disclaimer');
      if (disclaimer) {
        disclaimer.innerHTML = 'إجابات الذكاء الاصطناعي مستندة إلى التوثيق الرسمي لشركة <a href="https://www.allzonetech.com/" target="_blank" rel="noopener noreferrer">أولزون تكنولوجيز</a> ومشاريعها الهندسية المعتمدة.';
      }
    } else {
      document.body.classList.remove('rtl-mode');
      if (this.inputElement) {
        this.inputElement.placeholder = "Ask anything about Allzone's services, multi-agent systems, voice AI...";
      }
      const brandH1 = document.querySelector('.brand-info h1');
      if (brandH1) brandH1.innerHTML = 'Allzone AI Assistant <span class="status-badge"><span class="status-dot"></span> Online</span>';
      const brandP = document.querySelector('.brand-info p');
      if (brandP) brandP.textContent = 'Multi-Agent Systems · Voice AI · RAG · Enterprise Software';
      const consultationBtn = document.getElementById('btn-header-consultation');
      if (consultationBtn) {
        consultationBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Book Consultation
        `;
      }
      const disclaimer = document.querySelector('.input-disclaimer');
      if (disclaimer) {
        disclaimer.innerHTML = 'Allzone AI answers are grounded in <a href="https://www.allzonetech.com/" target="_blank" rel="noopener noreferrer">Allzone Technologies</a> official documentation and real-world architectures.';
      }
    }

    // Update active state on language toggle buttons
    const btnEn = document.getElementById('lang-btn-en');
    const btnAr = document.getElementById('lang-btn-ar');
    if (btnEn && btnAr) {
      btnEn.classList.toggle('active', !isAr);
      btnAr.classList.toggle('active', isAr);
    }
  }

  initElements() {
    this.messagesContainer = document.getElementById(this.containerId);
    this.inputElement = document.getElementById(this.inputId);
    this.chipsContainer = document.getElementById(this.chipsId);
    this.soundToggleBtn = document.getElementById('btn-toggle-sound');
    this.micBtn = document.getElementById('btn-voice-input');
    this.leadModal = document.getElementById('lead-modal');

    // Language switcher buttons in header
    const btnEn = document.getElementById('lang-btn-en');
    const btnAr = document.getElementById('lang-btn-ar');
    if (btnEn) btnEn.addEventListener('click', () => {
      this.setLanguage('en');
      this.messagesContainer.innerHTML = '';
      this.initGreeting();
    });
    if (btnAr) btnAr.addEventListener('click', () => {
      this.setLanguage('ar');
      this.messagesContainer.innerHTML = '';
      this.initGreeting();
    });
  }

  bindEvents() {
    const form = document.getElementById(this.isWidget ? 'widget-chat-form' : 'chat-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggleBtn.innerHTML = this.soundEnabled 
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
        this.soundToggleBtn.title = this.soundEnabled ? "Mute Sound" : "Unmute Sound";
      });
    }

    if (this.micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      this.micBtn.addEventListener('click', () => {
        if (this.micBtn.classList.contains('listening')) {
          recognition.stop();
          this.micBtn.classList.remove('listening');
        } else {
          this.micBtn.classList.add('listening');
          recognition.start();
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.inputElement.value = transcript;
        this.micBtn.classList.remove('listening');
        this.handleUserSubmit();
      };

      recognition.onerror = () => {
        this.micBtn.classList.remove('listening');
      };

      recognition.onend = () => {
        this.micBtn.classList.remove('listening');
      };
    } else if (this.micBtn) {
      this.micBtn.style.display = 'none';
    }

    // Lead form submission
    const leadForm = document.getElementById('consultation-form');
    if (leadForm) {
      leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLeadSubmit(new FormData(leadForm));
      });
    }
  }

  playChime(type = 'receive') {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'receive') {
        osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(587.33, this.audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      // Ignore audio context errors if blocked by browser policy
    }
  }

  initGreeting() {
    const greeting = this.engine.handleGreeting();
    this.appendBotMessage(greeting.text, greeting.links, greeting.chips, greeting.action, greeting.actionLabel);
  }

  async handleUserSubmit() {
    if (!this.inputElement) return;
    const text = this.inputElement.value.trim();
    if (!text || this.isThinking) return;

    // Auto-detect Arabic input and activate RTL mode
    if (/[\u0600-\u06FF]/.test(text) && this.currentLang !== 'ar') {
      this.setLanguage('ar');
    }

    this.inputElement.value = '';
    this.appendUserMessage(text);
    this.playChime('send');

    this.showTypingIndicator();
    this.isThinking = true;

    // Simulate realistic AI thought / retrieval latency (300ms - 600ms)
    const delay = Math.floor(Math.random() * 200) + 350;
    setTimeout(async () => {
      const response = await this.engine.processQuery(text);
      this.hideTypingIndicator();
      this.isThinking = false;
      this.appendBotMessage(response.text, response.links, response.chips, response.action, response.actionLabel);
      this.playChime('receive');
    }, delay);
  }

  sendPrompt(promptText) {
    if (this.inputElement) {
      this.inputElement.value = promptText;
      this.handleUserSubmit();
    }
  }

  appendUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'message-row user';
    row.innerHTML = `
      <div class="user-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <div class="message-bubble">
        <p>${this.escapeHtml(text)}</p>
      </div>
    `;
    this.messagesContainer.appendChild(row);
    this.scrollToBottom();
  }

  appendBotMessage(markdownText, links = [], chips = [], action = null, actionLabel = null) {
    const row = document.createElement('div');
    row.className = 'message-row bot';
    const isAr = this.currentLang === 'ar' || (this.engine && this.engine.lang === 'ar');

    let actionBtnHtml = '';
    if (action === 'open_lead_modal') {
      actionBtnHtml = `
        <button class="action-trigger-btn" onclick="window.allzoneChatbot.openConsultationModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${actionLabel || (isAr ? 'حجز جلسة استراتيجية' : 'Book Discovery Session')}
        </button>
      `;
    }

    let bookingCardHtml = '';
    if (action === 'render_booking_card') {
      if (isAr) {
        bookingCardHtml = `
          <div class="inchat-booking-card">
            <div class="booking-card-header">
              <div class="manager-badge">
                <div class="manager-avatar">SV</div>
                <div class="manager-meta">
                  <strong>سارة فانس (Sarah Vance)</strong>
                  <span>مديرة المبيعات والحلول الهندسية</span>
                </div>
              </div>
              <span class="call-duration">⏱️ جلسة استراتيجية 20 دقيقة</span>
            </div>
            <div class="booking-prompt-label">اختر التاريخ والوقت المناسب لك:</div>
            <div class="slot-picker-row">
              <button type="button" class="slot-pill-btn active" onclick="window.allzoneChatbot.selectSlot(this, 'غداً الساعة 10:00 صباحاً بتوقيت السعودية')">غداً، 10:00 ص</button>
              <button type="button" class="slot-pill-btn" onclick="window.allzoneChatbot.selectSlot(this, 'غداً الساعة 02:00 مساءً بتوقيت السعودية')">غداً، 02:00 م</button>
              <button type="button" class="slot-pill-btn" onclick="window.allzoneChatbot.selectSlot(this, 'غداً الساعة 04:30 مساءً بتوقيت السعودية')">غداً، 04:30 م</button>
              <button type="button" class="slot-pill-btn" onclick="window.allzoneChatbot.selectSlot(this, 'بعد يومين الساعة 11:30 صباحاً بتوقيت السعودية')">بعد يومين، 11:30 ص</button>
            </div>
            <form class="inchat-booking-form" onsubmit="window.allzoneChatbot.handleInChatBooking(event, this)">
              <input type="hidden" name="slot" value="غداً الساعة 10:00 صباحاً بتوقيت السعودية" />
              <div class="inchat-form-grid">
                <input type="text" name="name" placeholder="الاسم الكامل *" required class="inchat-input" />
                <input type="email" name="email" placeholder="البريد الإلكتروني للعمل *" required class="inchat-input" />
                <input type="tel" name="phone" placeholder="رقم الهاتف / واتساب" class="inchat-input" />
                <button type="submit" class="btn-confirm-booking">تأكيد حجز الموعد مع مدير المبيعات 📅</button>
              </div>
            </form>
          </div>
        `;
      } else {
        bookingCardHtml = `
          <div class="inchat-booking-card">
            <div class="booking-card-header">
              <div class="manager-badge">
                <div class="manager-avatar">SV</div>
                <div class="manager-meta">
                  <strong>Sarah Vance</strong>
                  <span>Solutions & Sales Engineering Manager</span>
                </div>
              </div>
              <span class="call-duration">⏱️ 20 min strategy call</span>
            </div>
            <div class="booking-prompt-label">Select your preferred date & time:</div>
            <div class="slot-picker-row">
              <button type="button" class="slot-pill-btn active" onclick="window.allzoneChatbot.selectSlot(this, 'Tomorrow at 10:00 AM EST')">Tomorrow, 10:00 AM</button>
              <button type="button" class="slot-pill-btn" onclick="window.allzoneChatbot.selectSlot(this, 'Tomorrow at 02:00 PM EST')">Tomorrow, 02:00 PM</button>
              <button type="button" class="slot-pill-btn" onclick="window.allzoneChatbot.selectSlot(this, 'Tomorrow at 04:30 PM EST')">Tomorrow, 04:30 PM</button>
              <button type="button" class="slot-pill-btn" onclick="window.allzoneChatbot.selectSlot(this, 'In 2 Days at 11:30 AM EST')">In 2 Days, 11:30 AM</button>
            </div>
            <form class="inchat-booking-form" onsubmit="window.allzoneChatbot.handleInChatBooking(event, this)">
              <input type="hidden" name="slot" value="Tomorrow at 10:00 AM EST" />
              <div class="inchat-form-grid">
                <input type="text" name="name" placeholder="Your Name *" required class="inchat-input" />
                <input type="email" name="email" placeholder="Work Email *" required class="inchat-input" />
                <input type="tel" name="phone" placeholder="Phone / WhatsApp" class="inchat-input" />
                <button type="submit" class="btn-confirm-booking">Confirm Booking with Sales Manager 📅</button>
              </div>
            </form>
          </div>
        `;
      }
    }

    let linksHtml = '';
    if (links && links.length > 0) {
      const linkChips = links.map(l => `
        <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="citation-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          ${this.escapeHtml(l.title)}
        </a>
      `).join('');
      linksHtml = `<div class="message-links">${linkChips}</div>`;
    }

    const formattedHtml = this.renderMarkdown(markdownText);

    row.innerHTML = `
      <div class="bot-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <div class="message-bubble">
        ${formattedHtml}
        ${bookingCardHtml}
        ${linksHtml}
        ${actionBtnHtml}
      </div>
    `;

    this.messagesContainer.appendChild(row);
    this.renderChips(chips);
    this.scrollToBottom();
  }

  selectSlot(btn, slotText) {
    const parent = btn.closest('.inchat-booking-card');
    if (!parent) return;
    parent.querySelectorAll('.slot-pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const hiddenSlot = parent.querySelector('input[name="slot"]');
    if (hiddenSlot) hiddenSlot.value = slotText;
  }

  handleInChatBooking(e, form) {
    e.preventDefault();
    const formData = new FormData(form);
    const isAr = this.currentLang === 'ar' || (this.engine && this.engine.lang === 'ar');
    const name = formData.get('name') || (isAr ? 'العميل الكريم' : 'Valued Client');
    const email = formData.get('email') || '';
    const phone = formData.get('phone') || (isAr ? 'غير محدد' : 'Not provided');
    const slot = formData.get('slot') || (isAr ? 'غداً الساعة 10:00 صباحاً' : 'Tomorrow at 10:00 AM EST');
    const projectType = (this.engine.leadData && this.engine.leadData.projectType) || (isAr ? 'بنية وهندسة أنظمة الذكاء الاصطناعي' : 'AI Systems & Architecture');

    if (this.engine) {
      this.engine.consultationStage = 'CONFIRMED';
      if (!this.engine.leadData) this.engine.leadData = {};
      this.engine.leadData.fullName = name;
      this.engine.leadData.email = email;
      this.engine.leadData.phone = phone;
      this.engine.leadData.slot = slot;
    }

    const card = form.closest ? form.closest('.inchat-booking-card') : null;
    if (card) {
      if (isAr) {
        card.innerHTML = `
          <div class="booking-confirmed-card">
            <div class="confirmed-header">
              <span class="confirmed-icon">✅</span>
              <div>
                <h4>تم تأكيد حجز جلستك الاستراتيجية بنجاح!</h4>
                <p>تم إرسال دعوة التقويم إلى <strong>${this.escapeHtml(email)}</strong></p>
              </div>
            </div>
            <div class="confirmed-details-grid">
              <div class="detail-item"><strong>المضيف:</strong> سارة فانس (مديرة المبيعات والحلول الهندسية)</div>
              <div class="detail-item"><strong>الموعد:</strong> ${this.escapeHtml(slot)}</div>
              <div class="detail-item"><strong>الحاضر:</strong> ${this.escapeHtml(name)}</div>
              <div class="detail-item"><strong>موضوع النقاش:</strong> ${this.escapeHtml(projectType)}</div>
            </div>
            <p class="confirmed-footer-note">تم إرسال رابط Google Meet وملاحظات التحضير عبر البريد الإلكتروني. نتطلع للتحدث معكم!</p>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="booking-confirmed-card">
            <div class="confirmed-header">
              <span class="confirmed-icon">✅</span>
              <div>
                <h4>1-on-1 Strategy Session Confirmed!</h4>
                <p>Invitation sent to <strong>${this.escapeHtml(email)}</strong></p>
              </div>
            </div>
            <div class="confirmed-details-grid">
              <div class="detail-item"><strong>Host:</strong> Sarah Vance (Sales Engineering Manager)</div>
              <div class="detail-item"><strong>Time:</strong> ${this.escapeHtml(slot)}</div>
              <div class="detail-item"><strong>Attendee:</strong> ${this.escapeHtml(name)}</div>
              <div class="detail-item"><strong>Topic:</strong> ${this.escapeHtml(projectType)}</div>
            </div>
            <p class="confirmed-footer-note">Google Meet link and preparation notes have been emailed. We look forward to speaking with you!</p>
          </div>
        `;
      }
    }

    this.playChime('receive');
    if (isAr) {
      this.renderChips([
        "🤖 حدثني أكثر عن أنظمة الوكلاء المتعددين",
        "🏆 عرض دراسات الحالة المعتمدة",
        "📍 أين تقع مكاتبكم في السعودية وقطر؟"
      ]);
    } else {
      this.renderChips([
        "🤖 Tell me more about Multi-Agent Systems while I wait",
        "🏆 Show relevant Case Studies",
        "📍 Where are your offices located?"
      ]);
    }
  }

  renderChips(chips) {
    if (!this.chipsContainer) return;
    this.chipsContainer.innerHTML = '';
    if (!chips || chips.length === 0) return;

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'chip-btn';
      btn.type = 'button';
      btn.textContent = chip;
      btn.addEventListener('click', () => {
        // Strip emoji icons for cleaner query text
        const query = chip.replace(/^[\p{Emoji}\s]+/u, '').trim();
        this.sendPrompt(query || chip);
      });
      this.chipsContainer.appendChild(btn);
    });
  }

  showTypingIndicator() {
    const existing = document.getElementById('typing-indicator-row');
    if (existing) existing.remove();

    const row = document.createElement('div');
    row.className = 'message-row bot';
    row.id = 'typing-indicator-row';
    row.innerHTML = `
      <div class="bot-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <div class="message-bubble typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    this.messagesContainer.appendChild(row);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const existing = document.getElementById('typing-indicator-row');
    if (existing) existing.remove();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  renderMarkdown(text) {
    if (!text) return '';
    let html = this.escapeHtml(text);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Inline Code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Markdown links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists
    html = html.replace(/^\s*[-•]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
    // Deduplicate nested <ul>
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<div') || p.startsWith('<li')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  openConsultationModal() {
    if (this.leadModal) {
      this.leadModal.classList.add('active');
    }
  }

  closeConsultationModal() {
    if (this.leadModal) {
      this.leadModal.classList.remove('active');
    }
  }

  handleLeadSubmit(formData) {
    const name = formData.get('fullName') || 'Valued Client';
    const email = formData.get('email') || '';
    const phone = formData.get('phone') || '';
    const details = formData.get('projectDetails') || '';
    const service = formData.get('serviceType') || 'Agentic AI / Multi-Agent Systems';

    this.closeConsultationModal();

    const summaryText = `### ✅ Consultation Request Received!

Thank you, **${name}**! Your project inquiry for **${service}** has been registered.

**Submitted Details:**
- **Email:** \`${email}\`
- **Phone:** \`${phone || 'Not provided'}\`
- **Requirements:** "${details || 'Technical discovery and architectural discussion'}"

Our senior AI engineering team will review your project requirements and email you within **24 business hours** to schedule a technical discovery workshop.

In the meantime, feel free to explore our multi-agent case studies or ask any technical questions right here!`;

    this.appendBotMessage(summaryText, [
      { title: "View Allzone Case Studies", url: "https://www.allzonetech.com/work/" },
      { title: "Allzone Services Overview", url: "https://www.allzonetech.com/ai-development-services/" }
    ], [
      "🤖 Multi-Agent Systems Case Studies",
      "🎙️ Voice AI Capabilities",
      "📍 Global Office Details"
    ]);
  }
}

// Global hook & CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AllzoneChatbot;
}
if (typeof window !== 'undefined') {
  window.AllzoneChatbot = AllzoneChatbot;
}
