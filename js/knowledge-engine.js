/**
 * Allzone Technologies - Knowledge & Retrieval Engine
 * Provides client-side semantic & token-based retrieval augmented question answering
 * based on the official allzonetech.com sitemap and services.
 */

class AllzoneKnowledgeEngine {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase || (typeof window !== 'undefined' && window.ALLZONE_KB) || null;
    this.history = [];
    this.leadData = {
      projectType: null,
      integrationNeed: null,
      timeline: null,
      fullName: null,
      email: null,
      phone: null,
      slot: null,
      date: null
    };
    this.consultationStage = 'INIT'; // INIT -> DISCOVERY -> SCOPE -> TIMELINE -> BOOKING -> CONFIRMED
    this.lang = 'en'; // 'en' or 'ar'
  }

  setLanguage(lang) {
    this.lang = lang;
  }

  isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
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

  normalizeArabic(text) {
    if (!text) return '';
    return String(text)
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/\u0640/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .trim();
  }

  setKnowledgeBase(data) {
    this.kb = data;
  }

  /**
   * Main query handler
   * @param {string} userQuery
   * @returns {Promise<Object>} Formatted response object with text, cards, chips, and links
   */
  async processQuery(userQuery) {
    if (!this.kb) {
      return {
        text: "The knowledge base is currently loading. Please wait a moment...",
        chips: ["Tell me about Multi-Agent Systems", "What services do you offer?"]
      };
    }

    const query = userQuery.trim().toLowerCase();
    this.history.push({ role: 'user', content: userQuery });

    // Auto-detect Arabic or honor set language
    if (this.isArabic(userQuery) || this.lang === 'ar') {
      this.lang = 'ar';
      return this.processArabicQuery(query, userQuery);
    }

    // 1. Direct Sales Manager Appointment Request
    if (this.isSalesManagerBookingIntent(query)) {
      return this.handleSalesManagerBooking();
    }

    // 2. Direct informational questions should always be answered first
    const isDirectQuestion = query.startsWith('what is') || query.startsWith('tell me') || query.startsWith('explain') || 
                             query.startsWith('how does') || query.startsWith('where') || query.startsWith('who is') || 
                             query.startsWith('can i') || query.startsWith('can you') || query.includes('case studies') || 
                             query.includes('how do you');

    // 3. If NOT a direct technical question, check if user is answering discovery qualification steps
    if (!isDirectQuestion) {
      const discoveryResponse = this.checkDiscoveryProgression(query);
      if (discoveryResponse) {
        return discoveryResponse;
      }
    }

    // 3. Check for Agent Building / Multi-agent query
    if (this.isAgentBuildingIntent(query)) {
      return this.handleAgentBuildingIntent();
    }

    // 4. Check for Lead / Consultation intent
    if (this.isConsultationIntent(query)) {
      return this.handleSalesManagerBooking();
    }

    // 5. Check for Pricing / Cost intent
    if (this.isPricingIntent(query)) {
      return this.handlePricingIntent();
    }

    // 6. Check for Project Timeline intent
    if (this.isTimelineIntent(query)) {
      return this.handleTimelineIntent();
    }

    // 7. Check for Web & App Development intent
    if (this.isWebDevIntent(query)) {
      return this.handleWebDevIntent();
    }

    // 8. Check for LLM Models & AI Frameworks intent
    if (this.isLLMModelsIntent(query)) {
      return this.handleLLMModelsIntent();
    }

    // 9. Check for Startup & MVP intent
    if (this.isStartupIntent(query)) {
      return this.handleStartupIntent();
    }

    // 10. Check for Greetings
    if (this.isGreeting(query)) {
      return this.handleGreeting();
    }

    // 11. Check for Office / Location questions
    if (this.isLocationIntent(query)) {
      return this.handleLocationIntent();
    }

    // 12. Check for CEO / Company info
    if (this.isCompanyIntent(query)) {
      return this.handleCompanyIntent();
    }

    // 13. Search FAQs
    const faqMatch = this.searchFaqs(query);
    if (faqMatch && faqMatch.score > 0.6) {
      return this.formatFaqResponse(faqMatch.faq);
    }

    // 14. Search Services (Multi-Agent, Voice AI, RAG, etc.)
    const serviceMatch = this.searchServices(query);
    if (serviceMatch && serviceMatch.score > 0.35) {
      return this.formatServiceResponse(serviceMatch.service, query);
    }

    // 15. Search Industries
    const industryMatch = this.searchIndustries(query);
    if (industryMatch) {
      return this.formatIndustryResponse(industryMatch);
    }

    // 16. Search Case Studies
    const caseStudyMatch = this.searchCaseStudies(query);
    if (caseStudyMatch) {
      return this.formatCaseStudyResponse(caseStudyMatch);
    }

    // 17. If query matched an FAQ with lower threshold
    if (faqMatch && faqMatch.score > 0.25) {
      return this.formatFaqResponse(faqMatch.faq);
    }

    // 18. Fallback with consultative engagement
    return this.handleFallback(userQuery);
  }

  processArabicQuery(query, userQuery) {
    const norm = this.normalizeArabic(userQuery);

    // 1. Direct Sales Manager Appointment / Booking in Arabic
    if (
      norm.includes('حجز') || norm.includes('موعد') || norm.includes('مدير المبيعات') ||
      norm.includes('استشاره') || norm.includes('اجتماع') || norm.includes('جلسه') ||
      norm.includes('مكالمه') || norm.includes('ساره فانس') || norm.includes('ساره') ||
      norm.includes('لقاء') || norm.includes('مقابله')
    ) {
      this.consultationStage = 'BOOKING';
      return {
        text: `### 📅 حجز جلسة استراتيجية مع مدير المبيعات والحلول الهندسية

يسرنا ترتيب استشارة تقنية مجانية مدتها 20 دقيقة عبر مكالمة فيديو مع **سارة فانس (Sarah Vance)**، **مديرة المبيعات والحلول الهندسية في أولزون تكنولوجيز**.

خلال هذه الجلسة الاستراتيجية:
- سنناقش أهداف الأتمتة والمتطلبات التقنية لمنشأتكم.
- سنعرض حلولاً معمارية ودراسات حالة واقعية مماثلة لمشاريعنا.
- سنقدم خطة زمنية وتقديرات مبدئية للميزانية ونماذج التعاقد.

يرجى اختيار الوقت المناسب من المواعيد المتاحة أدناه لتأكيد الحجز:`,
        action: "render_booking_card",
        actionLabel: "📅 حجز موعد استراتيجي مع مدير المبيعات",
        chips: [
          "غداً الساعة 10:00 صباحاً",
          "غداً الساعة 02:00 مساءً",
          "غداً الساعة 04:30 مساءً",
          "بعد يومين الساعة 11:30 صباحاً",
          "📍 أين تقع مكاتبكم في السعودية وقطر؟"
        ]
      };
    }

    // 2. Greetings in Arabic
    const greetings = ['مرحبا', 'السلام عليكم', 'سلام', 'اهلا', 'هلا', 'صباح الخير', 'مساء الخير', 'هاي', 'اهلين', 'تحياتي'];
    if (greetings.some(g => norm === g || norm.startsWith(g + ' ') || (g === 'السلام عليكم' && norm.includes(g)))) {
      this.consultationStage = 'DISCOVERY';
      return {
        text: `أهلاً بك! 👋 أنا **أليكس**، مستشار الحلول التقنية في **أولزون تكنولوجيز** (Allzone Technologies).

نحن متخصصون في هندسة وتطوير أنظمة ذكاء اصطناعي حقيقية وبرمجيات مؤسسية متقدمة:
- **أنظمة الوكلاء المتعددين (Autonomous Multi-Agent Systems)**
- **وكلاء الصوت التفاعليون للهواتف (AI Voice Agents)**
- **أنظمة استرجاع المعرفة المؤسسية (RAG)**
- **البرمجيات السحابية والمنصات المؤسسية وتطبيقات الجوال**

لمساعدتك في اختيار البنية المعمارية والجدول الزمني الأنسب لمشروعك، **ما هو نوع النظام أو الأتمتة التي تخطط لبنائها؟**`,
        chips: [
          "🤖 أنظمة الوكلاء المتعددين (Multi-Agent)",
          "🎙️ وكلاء الصوت بالذكاء الاصطناعي",
          "🔍 أنظمة استرجاع المعرفة RAG",
          "💼 ما هي خدماتكم الشاملة؟",
          "📍 مكاتبنا في الرياض والدوحة",
          "📅 حجز موعد مع مدير المبيعات"
        ]
      };
    }

    // Direct questions should always be answered first
    const isDirectQuestion = norm.startsWith('ما ') || norm.startsWith('ماذا') || norm.startsWith('اين') ||
                             norm.startsWith('من ') || norm.startsWith('كيف') || norm.startsWith('هل') ||
                             norm.startsWith('حدثني') || norm.startsWith('اشرح') || norm.startsWith('اريد ان اعرف') ||
                             norm.includes('خدماتكم') || norm.includes('مكاتبكم') || norm.includes('اسعاركم') ||
                             norm.includes('دراسات');

    // If NOT a direct question, check if user is answering the consultative discovery steps
    if (!isDirectQuestion) {
      // Step A: In SCOPE stage -> User provides integrations/tools
      if (this.consultationStage === 'SCOPE') {
        this.leadData.integrationNeed = userQuery;
        this.consultationStage = 'TIMELINE';
        return {
          text: `### ⚙️ تم تسجيل نطاق العمل والتكاملات: **${this.escapeHtml(userQuery)}**

ممتاز! الربط مع هذه الأنظمة مدعوم بالكامل ضمن معايير الأمان المؤسسية وحواجز الحماية (Guardrails).

السؤال التالي: **ما هو الإطار الزمني المستهدف لإطلاق هذا المشروع أو النموذج الأولي (MVP)؟**`,
          chips: [
            "⚡ نموذج أولي سريع (3 إلى 4 أسابيع)",
            "🚀 إطلاق كامل للإنتاج (2 إلى 3 أشهر)",
            "🏢 توسع مؤسسي شامل (3 إلى 6 أشهر)",
            "📅 حجز موعد مع مدير المبيعات مباشرة"
          ]
        };
      }

      // Step B: In TIMELINE stage -> User provides timeline
      if (this.consultationStage === 'TIMELINE') {
        this.leadData.timeline = userQuery;
        this.consultationStage = 'BOOKING';
        return {
          text: `### 📅 جدولكم الزمني متوافق تماماً!

يسرنا ترتيب استشارة تقنية مجانية مدتها 20 دقيقة مع **سارة فانس (Sarah Vance)**، **مديرة المبيعات والحلول الهندسية في أولزون تكنولوجيز** لمراجعة المتطلبات وتقديم تقديرات دقيقة للميزانية وخطة الإطلاق لمشروع **${this.escapeHtml(this.leadData.projectType || 'الذكاء الاصطناعي')}**:

يرجى اختيار الموعد المناسب وتأكيد الحجز أدناه:`,
          action: "render_booking_card",
          actionLabel: "📅 تأكيد الموعد مع مدير المبيعات",
          chips: [
            "غداً الساعة 10:00 صباحاً",
            "غداً الساعة 02:00 مساءً",
            "غداً الساعة 04:30 مساءً",
            "بعد يومين الساعة 11:30 صباحاً"
          ]
        };
      }

      // Step C: In DISCOVERY stage -> User answers project type / what they want to build
      const arabicProjectTypeKeywords = {
        'أنظمة الوكلاء المتعددين (Multi-Agent)': ['وكلاء', 'وكيل', 'متعدد', 'اتمته', 'agent', 'multi agent', 'انظمه الوكلاء'],
        'وكلاء الصوت بالذكاء الاصطناعي (AI Voice)': ['صوت', 'مكالمات', 'هاتف', 'اتصال صوتي', 'هاتفي', 'voice', 'وكيل صوتي'],
        'أنظمة استرجاع المعرفة المؤسسية (RAG)': ['rag', 'استرجاع', 'مستندات', 'وثائق', 'بحث دلالي', 'قاعده معرفه'],
        'تطوير البرمجيات والمنصات وتطبيقات الجوال': ['تطوير', 'مواقع', 'تطبيقات', 'تطبيق', 'موقع', 'جوال', 'ويب', 'برمجه', 'منصه'],
        'توظيف مهندسي الذكاء الاصطناعي': ['توظيف', 'مهندسين', 'مطورين', 'فريق عمل', 'تعيين', 'كفاءات', 'staff augmentation']
      };

      if (this.consultationStage === 'DISCOVERY' || !this.leadData.projectType) {
        for (const [type, triggers] of Object.entries(arabicProjectTypeKeywords)) {
          if (triggers.some(t => norm.includes(t))) {
            this.leadData.projectType = type;
            this.consultationStage = 'SCOPE';
            return {
              text: `### 🎯 اختيار متميز: **${type}**

تمتلك **أولزون تكنولوجيز** خبرة هندسية واسعة في هذا المجال مع ضمان أعلى معايير الأمان وحواجز الحماية (Guardrails).

لمساعدتنا في تحديد البنية المعمارية الأنسب لمشروعك بدقة:

**هل تخطط لربط هذا النظام مع أدواتكم وأنظمتكم الحالية** *(مثل: نظام CRM، قواعد بيانات SQL، Slack، واتساب، أو واجهات API)* **أم ترغب في بناء منصة جديدة مستقلة بالكامل من الصفر؟**`,
              chips: [
                "🔌 الربط مع CRM وقواعد البيانات الحالية",
                "🚀 منصة مستقلة بالكامل من الصفر",
                "🛡️ نحتاج استشارتكم لتحديد البنية الأفضل",
                "📅 تخطي والتحدث مع مدير المبيعات مباشرة"
              ]
            };
          }
        }
      }
    }

    // 3. Services Overview in Arabic (Checked before pricing so 'خدماتكم' is not matched by 'كم')
    if (
      norm.includes('خدماتكم') || norm.includes('خدمات') || norm.includes('ماذا تقدمون') ||
      norm.includes('ماذا تعملون') || norm.includes('مجالات عملكم') || norm.includes('تخصصاتكم') ||
      norm.includes('حلولكم') || norm.includes('ما هي خدمات') || norm.includes('مجالاتكم') ||
      norm.includes('ما هي الخدمات')
    ) {
      return {
        text: `### 🚀 الخدمات والحلول الهندسية لشركة أولزون تكنولوجيز (Allzone Technologies)

تغطي خدماتنا دورة حياة تطوير البرمجيات والذكاء الاصطناعي بالكامل، مع تركيز خاص على الأنظمة ذات الأثر التشغيلي المباشر:

1. **🤖 أنظمة الوكلاء المتعددين والذكاء الاصطناعي الفاعل (Agentic AI):**
   - شبكات وكلاء مستقلة للتخطيط والتنفيذ الذاتي للمهام المعقدة وربطها بقواعد البيانات وواجهات API.
2. **🎙️ وكلاء الصوت بالذكاء الاصطناعي (AI Voice Agents):**
   - روبوتات هاتفية فورية دون تأخير للاتصالات الواردة والصادرة مع دعم المقاطعة (Barge-in) والربط مع Twilio و CRM.
3. **🔍 أنظمة استرجاع المعرفة المؤسسية (RAG Systems):**
   - بحث دلالي فائق الدقة في وثائق وملفات الشركة الخاصة دون أي هلوسة وبإسناد كامل للمصادر.
4. **🏢 تطوير البرمجيات المؤسسية والمنصات المخصصة:**
   - تطبيقات الويب الحديثة (React, Next.js, Node, Python)، وتطبيقات الجوال، وأنظمة الـ ERP والـ CRM.
5. **👥 توظيف مهندسي الذكاء الاصطناعي (Dedicated ML Engineering Squads):**
   - فرق عمل متفرغة من كبار مهندسي الذكاء الاصطناعي والمطورين تندمج مباشرة مع فريقك خلال 3-5 أيام عمل.
6. **☁️ البنية التحتية السحابية وعمليات DevOps و FinOps:**
   - بنية تحتية سحابية عالية الأمان على AWS و Azure و GCP مع خفض تكاليف الاستهلاك السحابي.`,
        links: [
          { title: "خدمات الذكاء الاصطناعي - Allzone", url: "https://www.allzonetech.com/ai-development-services/" },
          { title: "تطوير وكلاء الصوت - Allzone", url: "https://www.allzonetech.com/ai-voice-agent-development/" },
          { title: "تطوير أنظمة RAG - Allzone", url: "https://www.allzonetech.com/rag-development/" }
        ],
        chips: [
          "🤖 حدثني عن أنظمة الوكلاء المتعددين",
          "🎙️ كيف تعمل روبوتات الصوت الهاتفية؟",
          "💰 ما هي نماذج التعاقد والأسعار؟",
          "📅 حجز موعد مع مدير المبيعات"
        ]
      };
    }

    // 4. AI Voice Agents in Arabic (Check before Multi-Agent so 'وكلاء الصوت' matches Voice)
    if (
      norm.includes('صوت') || norm.includes('مكالمات') || norm.includes('هاتف') ||
      norm.includes('اتصال صوتي') || norm.includes('هاتفي') || norm.includes('voice') ||
      norm.includes('مكالمه')
    ) {
      return {
        text: `### 🎙️ وكلاء الصوت بالذكاء الاصطناعي (AI Voice Agents)

نقوم في **أولزون تكنولوجيز** بتطوير وكلاء صوتيين حقيقيين مجهزين للاتصالات الهاتفية الفورية دون تأخير:

- **مكالمات واردة وصادرة:** استقبال مكالمات العملاء، حجز المواعيد، وتأهيل العملاء المحتملين تلقائياً.
- **التعامل مع المقاطعة (Barge-in):** استجابة فائقة السرعة تتيح للمتصل مقاطعة الوكيل الصوتي والتحدث بشكل طبيعي تماماً.
- **الربط مع شبكات الهاتف والـ CRM:** تكامل مباشر مع Twilio وأنظمة Salesforce و HubSpot.
- **التحويل السلس للموظفين:** كشف ذكي لدرجة رضا العميل وتحويل المكالمة إلى موظف بشري عند الحاجة.`,
        links: [{ title: "وكلاء الصوت الذكاء الاصطناعي - Allzone", url: "https://www.allzonetech.com/ai-voice-agent-development/" }],
        chips: [
          "🤖 حدثني عن أنظمة الوكلاء المتعددين",
          "📅 حجز جلسة استشارية مع مدير المبيعات",
          "📍 مكاتب أولزون في السعودية وقطر"
        ]
      };
    }

    // 5. Multi-Agent Systems & Agentic AI in Arabic
    if (
      norm.includes('وكلاء') || norm.includes('وكيل') || norm.includes('متعدد') ||
      norm.includes('اتمته') || norm.includes('agent') || norm.includes('بناء وكيل') ||
      norm.includes('صنع وكيل') || norm.includes('انظمه الوكلاء')
    ) {
      return {
        text: `### 🤖 أنظمة الوكلاء المتعددين والذكاء الاصطناعي الفاعل (Agentic AI)

تعتبر **أنظمة الوكلاء المتعددين (Multi-Agent Systems)** التخصص الجوهري لشركة **أولزون تكنولوجيز** (Allzone Technologies). نحن لا نبني مجرد روبوتات محادثة تقليدية، بل نصمم شبكات مستقلة من الوكلاء الأذكياء القادرين على التخطيط، استخدام الأدوات، والتنفيذ الذاتي للمهام المؤسسية المعقدة.

#### 🏗️ قدراتنا في هندسة الوكلاء:
1. **تنسيق سير العمل (Orchestration):** وكيل رئيسي يقوم بتقسيم الأهداف الكبيرة وتوزيع المهام على وكلاء فرعيين متخصصين.
2. **استدعاء الأدوات والواجهات البرمجية (Tool & API Calling):** ربط الوكلاء بقواعد بيانات المؤسسة، أنظمة الـ ERP، الـ CRM، والبوابات السحابية.
3. **حواجز الأمان والمراجعة البشرية (Guardrails & Human-in-the-Loop):** نقاط تدقيق مشروطة تمنع القرارات الحساسة دون موافقة المشرف البشري.
4. **الذاكرة وإدارة الحالة:** ذاكرة مشتركة عبر خطوات الوكلاء باستخدام Redis و PostgreSQL.

#### 🏆 أمثلة واقعية من مشاريعنا:
- **[منصة الهندسة الوكيلة](https://www.allzonetech.com/work/agentic-engineering-platform/):** أتمتة كتابة الكود ومراجعته واختباره وتطبيقه.
- **[منصة وكلاء التصنيع](https://www.allzonetech.com/work/manufacturing-agent-platform/):** تتبع خطوط الإنتاج والتنبؤ بسلاسل التوريد.
- **[منصة دعم العملاء الذكية](https://www.allzonetech.com/work/customer-support-agentic-platform/):** حل التذاكر ومعالجة الاسترجاع تلقائياً.`,
        links: [
          { title: "منصة الهندسة الوكيلة - Allzone", url: "https://www.allzonetech.com/work/agentic-engineering-platform/" },
          { title: "خدمات الذكاء الاصطناعي - Allzone", url: "https://www.allzonetech.com/ai-development-services/" }
        ],
        chips: [
          "📅 حجز موعد مع مدير المبيعات لمناقشة مشروع وكيل ذكي",
          "🎙️ ما هي قدراتكم في وكلاء الصوت؟",
          "🔍 كيف يعمل نظام استرجاع المعرفة (RAG)؟",
          "📍 أين تقع مكاتبكم؟"
        ]
      };
    }

    // 6. RAG Knowledge Systems in Arabic
    if (
      norm.includes('rag') || norm.includes('استرجاع') || norm.includes('مستندات') ||
      norm.includes('وثائق') || norm.includes('معرفه') || norm.includes('بحث دلالي') ||
      norm.includes('فهرسه') || norm.includes('ملفات')
    ) {
      return {
        text: `### 🔍 أنظمة استرجاع المعرفة المؤسسية (RAG Systems)

تتيح أنظمة الـ RAG لنماذج الذكاء الاصطناعي الإجابة الدقيقة على استفسارات الموظفين والعملاء اعتماداً على وثائق ومستندات شركتكم الحصرية مع ذكر المصادر:

- **فهرسة وتجزئة المستندات:** معالجة ملفات PDF، جداول البيانات، والويكي الداخلي بدقة عالية.
- **بحث هجين وموجه (Hybrid Vector Search):** بحث دلالي دقيق يجمع بين الكلمات المفتاحية والمتجهات الرياضية (Pinecone / Qdrant / pgvector).
- **منع الهلوسة:** إجابات موثقة 100% بالإشارة المباشرة إلى رقم الصفحة والفقرة.
- **صلاحيات الوصول (RBAC):** لا يرى الموظف إلا البيانات المصرح له بالاطلاع عليها.`,
        links: [{ title: "تطوير أنظمة RAG - Allzone", url: "https://www.allzonetech.com/rag-development/" }],
        chips: [
          "🤖 هل يمكن دمج RAG مع الوكلاء المتعددين؟",
          "📅 حجز جلسة عمل مع مدير المبيعات",
          "🏢 خدمات البرمجيات المؤسسية"
        ]
      };
    }

    // 7. Dedicated ML Engineers & Staff Augmentation in Arabic
    if (
      norm.includes('توظيف') || norm.includes('مهندسين') || norm.includes('مطورين') ||
      norm.includes('فريق عمل') || norm.includes('استئجار') || norm.includes('تعيين') ||
      norm.includes('كفاءات') || norm.includes('مهندس') || norm.includes('مطور')
    ) {
      return {
        text: `### 👥 توظيف فرق ومهندسي الذكاء الاصطناعي المتفرغين (Dedicated Engineers)

توفر **أولزون تكنولوجيز** كوادر هندسية ومطوري ذكاء اصطناعي من النخبة للانضمام إلى فرق عملكم بدوام كامل:

- **سرعة الانضمام:** بدء العمل الفعلي خلال **3 إلى 5 أيام عمل** فقط.
- **المهارات والخبرات:** كبار مهندسي Python و LangGraph و PyTorch و Full-stack (React/Node) و Cloud DevOps.
- **الاندماج التام:** يعمل المطورون وفق توقيتكم الزمني، ويتواصلون مباشرة عبر Slack و Jira و GitHub.
- **نماذج تعاقد مرنة:** اشتراك شهري ثابت دون أي تكاليف توظيف خفية أو التزامات طويلة الأجل غير مرنة.`,
        links: [{ title: "تواصل لتوظيف مهندسين", url: "https://www.allzonetech.com/contact-us/" }],
        chips: [
          "📅 حجز موعد لمناقشة احتياجات التوظيف",
          "💰 ما هي تكلفة الفريق المتفرغ؟",
          "🤖 ما هي مشاريعكم في الوكلاء المتعددين؟"
        ]
      };
    }

    // 8. Web & App Development in Arabic
    if (
      norm.includes('مواقع') || norm.includes('تطبيقات') || norm.includes('تطبيق') ||
      norm.includes('موقع') || norm.includes('جوال') || norm.includes('ويب') ||
      norm.includes('برمجه') || norm.includes('برمجيات') || norm.includes('react') ||
      norm.includes('next') || norm.includes('flutter') || norm.includes('منصه')
    ) {
      return {
        text: `### 🌐 تطوير تطبيقات الويب والجوال والمنصات المؤسسية

تبني **أولزون تكنولوجيز** منصات رقمية متقدمة وتطبيقات عالية الأداء وقابلة للتوسع:

#### 💻 التقنيات المستخدمة:
- **الواجهات الأمامية:** React, Next.js, TypeScript, Vue.js, Tailwind CSS.
- **الواجهات الخلفية:** Node.js, Python (FastAPI/Django), ASP.NET, Go.
- **تطبيقات الجوال:** Flutter, React Native, iOS (Swift), Android (Kotlin).
- **قواعد البيانات والسحابة:** PostgreSQL, MongoDB, Redis, AWS, Azure, Google Cloud.

نلتزم بأعلى معايير الأمان وتشفير البيانات، مع تسليم واجهات مستخدم جذابة وسريعة للغاية.`,
        links: [{ title: "خدمات تطوير البرمجيات - Allzone", url: "https://www.allzonetech.com/software-product-development/" }],
        chips: [
          "📅 حجز استشارة تقنية لمشروعك",
          "⏱️ كم يستغرق تسليم تطبيق أو موقع؟",
          "💰 ما هي نماذج الأسعار؟"
        ]
      };
    }

    // 9. Office Locations in Arabic (Highlighting Saudi Arabia and Qatar)
    if (
      norm.includes('مكاتب') || norm.includes('مكتب') || norm.includes('اين') ||
      norm.includes('موقع') || norm.includes('الرياض') || norm.includes('السعوديه') ||
      norm.includes('قطر') || norm.includes('الدوحه') || norm.includes('امريكا') ||
      norm.includes('باكستان') || norm.includes('عنوان') || norm.includes('فروع')
    ) {
      return {
        text: `### 🌍 المكاتب العالمية لشركة أولزون تكنولوجيز (Allzone Technologies)

تنتشر مكاتبنا في **4 دول رئيسية** لتقديم أعلى مستويات الدعم لعملائنا في الخليج وأمريكا:

- 🇸🇦 **المملكة العربية السعودية (الرياض):** مكتب رقم 4027/4028، الطابق الثاني، برج فيو العليا، طريق الملك فهد، الرياض.
- 🇶🇦 **دولة قطر (الدوحة):** مكتب رقم 1، الطابق التاسع، برج مركز قطر للمال 1، الدوحة.
- 🇺🇸 **الولايات المتحدة الأمريكية:** 1200 Willowbrook Dr, Cedar Park, Texas 78613.
- 🇵🇰 **باكستان (لاهور):** Sunflower Housing Society, Johar Town, Lahore.

📞 **رقم الهاتف الموحد:** \`+1 (408) 850-5081\`
📧 **البريد الإلكتروني:** \`services@allzonetech.com\``,
        links: [{ title: "تواصل مع مكاتب أولزون", url: "https://www.allzonetech.com/contact-us/" }],
        chips: [
          "📅 حجز موعد مع مدير المبيعات لفرع الرياض أو الدوحة",
          "🤖 ما هي خدمات الوكلاء المتعددين؟",
          "💰 ما هي نماذج الأسعار والتعاقد؟"
        ]
      };
    }

    // 10. Company Profile & CEO in Arabic
    if (
      norm.includes('من انتم') || norm.includes('عن الشركه') || norm.includes('من هي اولزون') ||
      norm.includes('ارشاد قنوال') || norm.includes('ارشاد') || norm.includes('المدير التنفيذي') ||
      norm.includes('الرئيس') || norm.includes('تاريخ') || norm.includes('تاسيس') ||
      norm.includes('خبره') || norm.includes('ceo') || norm.includes('من تكون')
    ) {
      return {
        text: `### 🏢 عن شركة أولزون تكنولوجيز (Allzone Technologies)

تأسست **أولزون تكنولوجيز** عام **2014** (أكثر من 10 سنوات من الخبرة البرمجية والهندسية) بقيادة الرئيس التنفيذي **إرشاد قنوال (Irshad Kanwal)**.

- **الرؤية:** بناء أنظمة ذكاء اصطناعي فاعلة وبرمجيات متقدمة تعمل في العالم الحقيقي وتحدث أثراً مالياً وتشغيلياً ملموساً.
- **الإنجازات:** تسليم أكثر من **250 مشروعاً برمجياً ناجحاً** لشركات ناشئة ومؤسسات كبرى في الولايات المتحدة، السعودية، قطر، وأوروبا.
- **التخصص الجوهري:** أنظمة الذكاء الاصطناعي الوكيل (Agentic AI)، روبوتات الصوت، حلول RAG، وتطوير المنتجات السحابية الكاملة.`,
        links: [{ title: "الموقع الرسمي لأولزون", url: "https://www.allzonetech.com/" }],
        chips: [
          "🤖 ما هي قدراتكم في الوكلاء المتعددين؟",
          "📍 مكاتب أولزون في السعودية وقطر",
          "📅 حجز جلسة استراتيجية مع مدير المبيعات"
        ]
      };
    }

    // 11. Case Studies & Portfolio in Arabic (Checked before timeline and pricing)
    if (
      norm.includes('دراسات') || norm.includes('دراسه') || norm.includes('سابقه اعمال') ||
      norm.includes('مشاريع سابقه') || norm.includes('المشاريع') || norm.includes('نماذج اعمال') ||
      norm.includes('portfolio') || norm.includes('case studies')
    ) {
      return {
        text: `### 🏆 دراسات الحالة وسابقة أعمال أولزون تكنولوجيز

نفذت أولزون مشاريع رائدة أثبتت كفاءتها في بيئات الإنتاج الفعلية:

1. **[منصة الهندسة الوكيلة (Agentic Engineering Platform)](https://www.allzonetech.com/work/agentic-engineering-platform/):**
   - شبكة وكلاء أذكياء لأتمتة دورة حياة هندسة البرمجيات بالكامل (كتابة الكود، الفحص، والاختبار).
2. **[منصة وكلاء التصنيع (Manufacturing Agent Platform)](https://www.allzonetech.com/work/manufacturing-agent-platform/):**
   - منصة وكلاء متعددين لمراقبة خطوط الإنتاج والتنبؤ بالأعطال وسلاسل الإمداد.
3. **[منصة دعم العملاء الذكية (Customer Support Agentic Platform)](https://www.allzonetech.com/work/customer-support-agentic-platform/):**
   - وكلاء ذكاء اصطناعي لحل تذاكر الدعم ومعالجة المرتجعات تلقائياً.`,
        links: [
          { title: "جميع دراسات الحالة - Allzone", url: "https://www.allzonetech.com/work/" }
        ],
        chips: [
          "🤖 كيف تبنون أنظمة الوكلاء المتعددين؟",
          "📅 حجز موعد مع مدير المبيعات",
          "💰 ما هي تكلفة بناء مشروع مماثل؟"
        ]
      };
    }

    // 12. Project Timeline in Arabic (Checked before pricing so 'كم يستغرق' matches timeline)
    if (
      norm.includes('يستغرق') || norm.includes('مده') || norm.includes('وقت') ||
      norm.includes('زمن') || norm.includes('جدول زمني') || norm.includes('اسابيع') ||
      norm.includes('شهور') || norm.includes('فتره')
    ) {
      return {
        text: `### ⏱️ المدة الزمنية لتسليم المشاريع في أولزون

نعتمد منهجية أطر العمل الرشيقة (Agile Sprints) على فترات مدتها أسبوعان:

- **مرحلة الاكتشاف والنموذج الأولي (2 – 3 أسابيع):** تحديد المخطط المعماري واختبار الجدوى وبناء نموذج أولي وظيفي.
- **إطلاق النموذج الإنتاجي MVP (6 – 8 أسابيع):** نظام ذكاء اصطناعي متكامل مع تكاملات قواعد البيانات وواجهات API واختبارات الأداء.
- **التوسع والجاهزية المؤسسية (10 – 14 أسبوعاً):** حواجز أمان متقدمة، موازنة الأحمال، واختبارات الأمان العالية.

أما بالنسبة لتوظيف المطورين والمهندسين، فيمكن بدء العمل خلال **3 إلى 5 أيام عمل**.`,
        chips: [
          "💰 ما هي نماذج الأسعار والتعاقد؟",
          "👥 توظيف مهندسين متفرغين",
          "📅 حجز موعد مع مدير المبيعات"
        ]
      };
    }

    // 13. Pricing & Cost in Arabic
    const isPricing = norm.includes('تكلفه') || norm.includes('سعر') || norm.includes('اسعار') ||
                      norm.includes('ميزانيه') || norm.includes('تسعير') || norm.includes('كم يكلف') ||
                      norm.includes('كم السعر') || /(^|\s)كم(\s|$)/.test(norm);
    if (isPricing) {
      return {
        text: `### 💰 نماذج التعاقد والأسعار في أولزون تكنولوجيز

نقدم نماذج تسعير مرنة ومباشرة تناسب حجم وطبيعة مشروعكم:

1. **تسليم المشاريع بسعر ثابت ونطاق محدد (Fixed-Price Sprints):**
   - مثالي للنماذج الأولية (MVPs)، أنظمة الـ RAG، أو وكلاء الصوت المحددين.
   - مراحل تسليم ومخرجات واضحة مع التزام دقيق بالميزانية المتفق عليها.
2. **فرق عمل مخصصة بنظام الاشتراك الشهري (Dedicated Engineering Squads):**
   - مهندسو ذكاء اصطناعي ومطورون متفرغون يعملون كجزء مباشر من فريقكم.
3. **ورشة عمل الاكتشاف والتصميم المعماري (Discovery Workshop):**
   - دراسة معمقة لمدة أسبوعين لتقييم الجدوى وتحديد المعمارية وحساب التكاليف الدقيقة.

للحصول على عرض سعر مفصل ودقيق لمشروعك، يسعدنا ترتيب جلسة استشارية مباشرة:`,
        action: "render_booking_card",
        actionLabel: "طلب عرض سعر وجلسة استشارية مع مدير المبيعات",
        chips: [
          "📅 حجز موعد مع مدير المبيعات لمناقشة الأسعار",
          "⏱️ كم يستغرق تسليم المشروع؟",
          "🤖 أنظمة الوكلاء المتعددين"
        ]
      };
    }

    // 14. Industries in Arabic
    if (
      norm.includes('قطاعات') || norm.includes('صناعات') || norm.includes('الرعايه الصحيه') ||
      norm.includes('التجاره الالكترونيه') || norm.includes('الماليه') || norm.includes('البنوك') ||
      norm.includes('التعليم') || norm.includes('التصنيع') || norm.includes('العقارات')
    ) {
      return {
        text: `### 🏢 القطاعات والصناعات التي تخدمها أولزون تكنولوجيز

نقدم حلولاً مخصصة تلبي متطلبات ومعايير الامتثال في عدة قطاعات رئيسية:

- **🏥 الرعاية الصحية والطبية:** أنظمة إدارة المرضى، أتمتة الوثائق السريرية، ومعايير HIPAA.
- **🛍️ التجارة الإلكترونية والتجزئة:** روبوتات المبيعات الذكية، أنظمة التوصيات الشخصية، وإدارة المخزون.
- **💳 الخدمات المالية والمصرفية (Fintech):** كشف الاحتيال، معالجة القروض، والامتثال المالي.
- **🏭 التصنيع والخدمات اللوجستية:** الصيانة التنبؤية، مراقبة الجودة بالرؤية الحاسوبية، وتتبع الإمداد.
- **🎓 التعليم والتدريب:** منصات التعلم الذكية وتصحيح المهام التلقائي.`,
        chips: [
          "🤖 ما هي حلول الذكاء الاصطناعي لقطاعنا؟",
          "📅 حجز جلسة استشارية متخصصة",
          "🏆 دراسات الحالة السابقة"
        ]
      };
    }

    // 15. Consultative Discovery Stage Progression in Arabic (Capture project type if not a direct question)
    if (!isDirectQuestion && (this.consultationStage === 'DISCOVERY' || !this.leadData.projectType)) {
      this.leadData.projectType = userQuery;
      this.consultationStage = 'SCOPE';
      return {
        text: `### 🎯 اختيار متميز: **${this.escapeHtml(userQuery)}**

تمتلك **أولزون تكنولوجيز** خبرة هندسية واسعة في هذا المجال مع ضمان أعلى معايير الأمان وحواجز الحماية (Guardrails).

لمساعدتنا في تحديد البنية المعمارية الأنسب لمشروعك بدقة:

**هل تخطط لربط هذا النظام مع أدواتكم وأنظمتكم الحالية** *(مثل: نظام CRM، قواعد بيانات SQL، Slack، واتساب، أو واجهات API)* **أم ترغب في بناء منصة جديدة مستقلة بالكامل؟**`,
        chips: [
          "🔌 الربط مع CRM وقواعد البيانات الحالية",
          "🚀 منصة مستقلة بالكامل من الصفر",
          "🛡️ نحتاج استشارتكم لتحديد البنية الأفضل",
          "📅 تخطي والتحدث مع مدير المبيعات مباشرة"
        ]
      };
    }

    // 16. Fallback in Arabic
    return {
      text: `يسرني مساعدتك في كل ما يتعلق بـ *"**${this.escapeHtml(userQuery)}**"*.

تقدم **أولزون تكنولوجيز** حلولاً تقنية شاملة عبر تخصصاتنا الأساسية:
1. **🤖 أنظمة الوكلاء المتعددين (Multi-Agent):** تخطيط ذاتي وتنفيذ مهام معقدة مع حواجز أمان مؤسسية.
2. **🎙️ وكلاء الصوت بالذكاء الاصطناعي:** روبوتات هاتفية سريعة دون تأخير مع دعم المقاطعة الفورية.
3. **🔍 أنظمة استرجاع المعرفة RAG:** إجابات موثقة بدقة من مستنداتك دون هلوسة.
4. **🏢 البرمجيات المؤسسية والمنصات السحابية:** بناء منصات قابلة للتوسع وتطبيقات الجوال والويب.
5. **👥 توظيف مهندسي الذكاء الاصطناعي:** فرق عمل متفرغة تبدأ خلال 3-5 أيام عمل.

أي من هذه المجالات ترغب في استكشافه أو البدء فيه؟`,
      chips: [
        "🤖 أنظمة الوكلاء المتعددين",
        "🎙️ وكلاء الصوت الذكية",
        "🔍 أنظمة استرجاع المعرفة RAG",
        "📍 مكاتبنا في الرياض والدوحة",
        "📅 حجز موعد مع مدير المبيعات"
      ]
    };
  }

  isAgentBuildingIntent(query) {
    const keywords = ['build agent', 'building agent', 'make agent', 'making agent', 'multi agent', 'multi-agent', 'create agent', 'agentic platform', 'autonomous agent', 'orchestrate agents', 'how to make agent', 'how to build agent'];
    return keywords.some(k => query.includes(k));
  }

  handleAgentBuildingIntent() {
    return {
      text: `### 🤖 How Allzone Builds Production Multi-Agent Systems

At Allzone Technologies, we move beyond simple chatbots to construct **collaborative, autonomous multi-agent networks** that perform real enterprise workflows.

#### 🏗️ Our Multi-Agent Architecture:
1. **Strategic Orchestration:** Master supervisor agents decompose high-level business goals into subtasks and delegate them to specialized sub-agents.
2. **Tool & API Execution:** Agents are empowered to query databases (SQL/Vector), call enterprise APIs (CRM, ERP, payment gateways), and execute code in sandboxes.
3. **Enterprise Guardrails & Human-in-the-Loop:** Safety checkpoints where irreversible actions (e.g., money movement, contract dispatch, database writes) require human approval.
4. **Context & State Management:** Shared persistent memory across agent steps using Redis and PostgreSQL.

#### 🏆 Live Production Examples:
- **[Agentic Engineering Platform](https://www.allzonetech.com/work/agentic-engineering-platform/):** Coordinates code generation, static analysis, automated testing, and CI/CD rollouts.
- **[Manufacturing Agent Platform](https://www.allzonetech.com/work/manufacturing-agent-platform/):** Coordinates equipment telemetry, inventory forecast, and supplier communications.
- **[Customer Support Agentic Platform](https://www.allzonetech.com/work/customer-support-agentic-platform/):** Handles tier 1-2 customer workflows with automated refund authorization and escalation paths.

Would you like to discuss building a multi-agent system for your specific workflow?`,
      links: [
        { title: "Agentic Engineering Platform Case Study", url: "https://www.allzonetech.com/work/agentic-engineering-platform/" },
        { title: "Custom Agent Orchestration Guide", url: "https://www.allzonetech.com/custom-ai-agent-orchestration-for-enterprise/" }
      ],
      chips: [
        "📞 Book an Agentic AI Discovery Call",
        "🎙️ What about Voice AI Agents?",
        "🔍 How does RAG tie into Multi-Agent?",
        "💰 What does it cost to build an agent?"
      ]
    };
  }

  isPricingIntent(query) {
    const keywords = ['cost', 'pricing', 'price', 'rates', 'how much', 'budget', 'hourly', 'quote', 'estimation'];
    return keywords.some(k => query.includes(k));
  }

  handlePricingIntent() {
    return {
      text: `### 💰 Allzone Pricing & Engagement Models

Allzone offers transparent, flexible engagement models tailored to project scope and team requirements:

1. **Fixed-Price Milestone Delivery:**
   - Best for well-defined MVPs, specific multi-agent platforms, or RAG systems.
   - Clear deliverables, predetermined sprints, and agreed acceptance criteria.
2. **Dedicated Engineering Squads (Monthly Retainer):**
   - Full-time dedicated AI/ML engineers, full-stack developers, and solution architects.
   - Fully integrated into your Slack/Jira with transparent monthly rates.
3. **Discovery & Architecture Workshop:**
   - 2-week intensive assessment analyzing feasibility, system design, and cost breakdown before full investment.

To get an accurate estimate for your project, our team can provide a tailored proposal within 24-48 hours.`,
      links: [{ title: "Contact Allzone Sales", url: "https://www.allzonetech.com/contact-us/" }],
      action: "open_lead_modal",
      actionLabel: "Request a Custom Quote / Estimate",
      chips: [
        "📞 Book a Technical Discovery Call",
        "⏱️ How long does a project take?",
        "🤖 Tell me about Multi-Agent Systems"
      ]
    };
  }

  isTimelineIntent(query) {
    const keywords = ['timeline', 'how long', 'duration', 'delivery time', 'weeks', 'schedule', 'turnaround'];
    return keywords.some(k => query.includes(k));
  }

  handleTimelineIntent() {
    return {
      text: `### ⏱️ Typical Project Delivery Timelines

Allzone follows rapid, iterative 2-week sprints:

- **Discovery & Prototyping (2 – 3 Weeks):** Architecture blueprint, tech stack validation, and initial functional prototype.
- **MVP / Production Pilot (6 – 8 Weeks):** Core AI agent orchestration or software application with live integrations and test telemetry.
- **Enterprise Scale-out (10 – 14 Weeks):** Full security guardrails, load testing, high-availability cloud deployment, and SLA handover.

For staff augmentation, dedicated senior engineers can be onboarded in as fast as **3 to 5 business days**.`,
      chips: [
        "💰 How do pricing & engagement work?",
        "👥 Hire Dedicated Engineers",
        "📞 Schedule a Discovery Call"
      ]
    };
  }

  isWebDevIntent(query) {
    const keywords = ['website', 'web dev', 'web application', 'frontend', 'backend', 'full stack', 'fullstack', 'react', 'next.js', 'nextjs', 'custom software'];
    return keywords.some(k => query.includes(k));
  }

  handleWebDevIntent() {
    return {
      text: `### 🌐 Custom Web & Platform Development

Allzone builds enterprise-grade web applications, client portals, and SaaS platforms engineered for high performance, security, and scale.

#### 💻 Modern Tech Stack:
- **Frontend:** React, Next.js, TypeScript, Vue.js, Tailwind CSS
- **Backend:** Node.js (Express/NestJS), Python (FastAPI/Django), ASP.NET, Laravel
- **Databases:** PostgreSQL, MySQL, MongoDB, Redis, Snowflake
- **Cloud & DevOps:** AWS, Azure, GCP, Docker, Kubernetes, Terraform

From customer-facing portals to internal back-office ERP systems, our team handles end-to-end design, development, and hosting.`,
      links: [
        { title: "Enterprise Software Services", url: "https://www.allzonetech.com/enterprise-software-development/" },
        { title: "Allzone Case Studies", url: "https://www.allzonetech.com/work/" }
      ],
      chips: [
        "🤖 Can you integrate Multi-Agent AI into our website?",
        "👥 Hire Web Developers",
        "📞 Book a Consultation"
      ]
    };
  }

  isLLMModelsIntent(query) {
    const keywords = ['model', 'models', 'llm', 'openai', 'gpt', 'claude', 'anthropic', 'llama', 'deepseek', 'gemini'];
    return keywords.some(k => query.includes(k));
  }

  handleLLMModelsIntent() {
    return {
      text: `### 🧠 AI Models & Frameworks We Work With

Allzone is model-agnostic and selects the optimal model based on cost, latency, accuracy, and data residency constraints:

- **Commercial Frontier LLMs:** OpenAI GPT-4o / o1, Anthropic Claude 3.5 Sonnet / Opus, Google Gemini 1.5 Pro.
- **Open-Source & Self-Hosted Models:** Meta Llama 3.1 / 3.3, Mistral / Mixtral, DeepSeek V3 / R1 via vLLM / TensorRT-LLM.
- **Voice & Speech:** Deepgram (Nova-2), ElevenLabs, OpenAI Whisper.
- **Embeddings & Vector Engines:** Pinecone, Qdrant, Milvus, pgvector, Cohere ReRank.
- **Orchestration Frameworks:** LangChain, LangGraph, LlamaIndex, AutoGen, CrewAI.`,
      links: [{ title: "AI Development Services", url: "https://www.allzonetech.com/ai-development-services/" }],
      chips: [
        "🤖 Tell me about Multi-Agent Systems",
        "🔍 Tell me about RAG Development",
        "📞 Talk to an AI Architect"
      ]
    };
  }

  isStartupIntent(query) {
    const keywords = ['startup', 'mvp', 'prototype', 'idea', 'founder', 'new venture'];
    return keywords.some(k => query.includes(k));
  }

  handleStartupIntent() {
    return {
      text: `### 🚀 Building for Startups & Innovators

Allzone partners with venture-backed startups and founders to build production-ready MVPs that attract customers and investors:

- **Rapid MVP Engineering:** Getting from concept to working software in 6–8 weeks.
- **Flexible Scaling:** Start with a focused 2-developer squad and expand as product-market fit is proven.
- **Investor-Ready Architecture:** Built on clean code, secure multi-tenant cloud infrastructure, and clear IP ownership.`,
      links: [{ title: "Start a Project with Allzone", url: "https://www.allzonetech.com/contact-us/" }],
      chips: [
        "💰 How do pricing & estimates work?",
        "🤖 Multi-Agent MVP",
        "📞 Schedule a Founder Discovery Call"
      ]
    };
  }

  isSalesManagerBookingIntent(query) {
    const keywords = [
      'sales manager', 'book appointment', 'book an appointment', 'schedule appointment',
      'schedule call', 'schedule a call', 'talk to sales', 'speak with sales', 'book meeting',
      'schedule meeting', 'book with sales', 'meet sales manager', 'consultation with sales',
      'calendar', 'set up a call', 'book a strategy call', 'book call'
    ];
    return keywords.some(k => query.includes(k));
  }

  handleSalesManagerBooking() {
    this.consultationStage = 'BOOKING';
    const projectSummary = this.leadData.projectType 
      ? `focused on **${this.leadData.projectType}**`
      : 'regarding your AI & software requirements';

    return {
      text: `### 📅 Book a 1-on-1 Strategy Session with our Sales Manager

I'd be glad to arrange a direct 20-minute video consultation with **Sarah Vance**, our **Senior Solutions & Sales Engineering Manager** ${projectSummary}.

During this strategy call:
- We will review your technical architecture and operational workflow goals.
- Share relevant production case studies and live benchmarks.
- Provide tailored sprint timelines and preliminary budget options.

Please pick your preferred slot below or click to confirm your details:`,
      action: "render_booking_card",
      actionLabel: "📅 Book 20-Min Call with Sales Manager",
      chips: [
        "Tomorrow at 10:00 AM EST",
        "Tomorrow at 02:00 PM EST",
        "Tomorrow at 04:30 PM EST",
        "In 2 Days at 11:30 AM EST",
        "📍 Where are your offices located?"
      ]
    };
  }

  checkDiscoveryProgression(query) {
    // Stage 1: User indicates project type / what kind of bot or system they want
    const projectTypeKeywords = {
      'Autonomous Multi-Agent System': ['multi-agent', 'multi agent', 'agentic', 'autonomous agent', 'orchestration', 'task automation bot'],
      'AI Voice Agents & Telephony': ['voice agent', 'voice bot', 'phone bot', 'call bot', 'telephony', 'inbound calls', 'outbound calls', 'voice ai'],
      'RAG & Document Knowledge Base': ['rag', 'retrieval', 'document search', 'search documents', 'company wiki', 'knowledge base bot'],
      'Custom Enterprise Web Platform': ['web platform', 'website', 'portal', 'erp', 'crm', 'enterprise software', 'custom platform', 'fullstack'],
      'Dedicated ML / AI Engineering Squad': ['hire engineers', 'hire developers', 'staff augmentation', 'dedicated squad', 'hire ml team']
    };

    // If in INIT or DISCOVERY or user selects one of the project types:
    for (const [type, triggers] of Object.entries(projectTypeKeywords)) {
      if (triggers.some(t => query.includes(t)) && !this.leadData.projectType) {
        this.leadData.projectType = type;
        this.consultationStage = 'SCOPE';
        return {
          text: `### 🎯 Excellent Choice: **${type}**

Allzone Technologies has deployed production systems in this domain with enterprise guardrails, low-latency streaming, and high reliability.

To help our Sales Engineering Manager prepare the right architecture for you:

**Are you planning to connect this with your existing tools** (such as internal CRMs, SQL databases, ERPs, or third-party APIs), **or are you looking to build a brand new standalone platform from scratch?**`,
          chips: [
            "🔌 Connect to existing CRM / APIs / DB",
            "🚀 Brand New Standalone Platform",
            "🛡️ Need advice on best architecture",
            "📅 Skip to booking with Sales Manager"
          ]
        };
      }
    }

    // Stage 2: User responds about integrations / scope
    if (this.consultationStage === 'SCOPE' || query.includes('connect to') || query.includes('standalone') || query.includes('existing crm') || query.includes('need advice on best architecture')) {
      const scopeSummary = query.includes('standalone') ? 'Brand New Standalone Platform' : 'Integrated with Existing Systems';
      this.leadData.integrationNeed = scopeSummary;
      this.consultationStage = 'TIMELINE';
      return {
        text: `### ⚙️ Scope Noted: **${scopeSummary}**

Got it! Connecting seamlessly into existing pipelines while maintaining data privacy and role-based permissions is standard practice in our reference architecture.

Next question: **What is your target timeline for launching this?** (For instance, do you need a working prototype in 3–4 weeks, or an enterprise release in 2–3 months?)`,
        chips: [
          "⚡ Rapid MVP / Prototype (3-4 weeks)",
          "🚀 Production Release (2-3 months)",
          "🏢 Enterprise Rollout (3-6 months)",
          "📅 Book call with Sales Manager directly"
        ]
      };
    }

    // Stage 3: User specifies timeline
    if (this.consultationStage === 'TIMELINE' || query.includes('rapid mvp') || query.includes('production release') || query.includes('enterprise rollout') || (query.includes('weeks') && !query.includes('how long')) || query.includes('months')) {
      this.leadData.timeline = query.length > 50 ? '2-3 months' : query;
      this.consultationStage = 'BOOKING';
      return this.handleSalesManagerBooking();
    }

    // Stage 4: User picks a time slot from chips
    const slotMatches = ['tomorrow at 10:00 am', 'tomorrow at 02:00 pm', 'tomorrow at 04:30 pm', 'in 2 days at 11:30 am'];
    if (slotMatches.some(s => query.includes(s))) {
      this.leadData.slot = query;
      return {
        text: `### 📅 Selected Slot: **${query}**

You're almost all set to meet with **Sarah Vance**, our Solutions & Sales Engineering Manager! 

Please click the button below to confirm your contact details (Name, Work Email, and Phone/WhatsApp), and we will immediately send over the Google Meet / Calendar invitation:`,
        action: "open_lead_modal",
        actionLabel: `Confirm Booking for ${query}`,
        chips: [
          "📝 Enter Details to Confirm Booking",
          "🤖 Tell me about your Tech Stack first",
          "📍 Where are your offices located?"
        ]
      };
    }

    return null;
  }

  isGreeting(query) {
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what is this'];
    return greetings.some(g => query === g || query.startsWith(g + ' '));
  }

  handleGreeting() {
    this.consultationStage = 'DISCOVERY';
    if (this.lang === 'ar') {
      return {
        text: `أهلاً بك! 👋 أنا **أليكس**، مستشار الحلول التقنية في **أولزون تكنولوجيز** (Allzone Technologies).

نحن نبني أنظمة ذكاء اصطناعي حقيقية وبرمجيات مؤسسية متقدمة:
- **أنظمة الوكلاء المتعددين (Autonomous Multi-Agent Systems)**
- **وكلاء الصوت التفاعليون للهواتف (AI Voice Agents)**
- **أنظمة استرجاع المعرفة المؤسسية (RAG)**
- **البرمجيات السحابية والمنصات المؤسسية وتطبيقات الجوال**

لمساعدتك في اختيار البنية التقنية والجدول الزمني الأنسب لمشروعك، **ما هو نوع النظام أو الأتمتة التي تخطط لبنائها؟**`,
        chips: [
          "🤖 أنظمة الوكلاء المتعددين (Multi-Agent)",
          "🎙️ وكلاء الصوت بالذكاء الاصطناعي",
          "🔍 أنظمة استرجاع المعرفة RAG",
          "💼 ما هي خدماتكم الشاملة؟",
          "📍 مكاتبنا في الرياض والدوحة",
          "📅 حجز موعد مع مدير المبيعات"
        ]
      };
    }
    return {
      text: `Hello! 👋 I'm **Alex**, Solutions Specialist at **Allzone Technologies**. 

We design and build production-grade **Autonomous Multi-Agent Systems**, **Real-Time Voice AI**, **RAG Knowledge Platforms**, and **Custom Enterprise Software** for businesses worldwide.

To point you toward the right architecture and timeline, **what kind of AI system or automation are you looking to build?**`,
      chips: [
        "🤖 Autonomous Multi-Agent System",
        "🎙️ Real-time AI Voice Bot",
        "🔍 RAG & Document Knowledge Base",
        "🏢 Custom Enterprise Web Platform",
        "👥 Hire Dedicated ML Engineers",
        "📅 Schedule Call with Sales Manager"
      ]
    };
  }

  isConsultationIntent(query) {
    // If user is specifically asking to hire engineers or staff augmentation, let service search handle it
    if (query.includes('engineer') || query.includes('developer') || query.includes('team') || query.includes('staff augmentation')) {
      return false;
    }
    const consultationKeywords = ['contact', 'consultation', 'talk to sales', 'schedule call', 'book meeting', 'get in touch', 'start project', 'start a project', 'work with us', 'discovery workshop'];
    return consultationKeywords.some(k => query.includes(k));
  }

  handleConsultationIntent() {
    return {
      text: `### 🚀 Start Your Project with Allzone Technologies

Whether your project is fully scoped or just an initial idea, our senior architects and engineering leads can help assess feasibility, architecture, and timeline.

**Direct Contact Channels:**
- 📧 **Email:** [services@allzonetech.com](mailto:services@allzonetech.com)
- 📞 **Phone:** [+1 (408) 850-5081](tel:+14088505081)
- 🌐 **Web Form:** [allzonetech.com/contact-us](https://www.allzonetech.com/contact-us/)

**Our 4-Stage Delivery Process:**
1. **Discover:** Workflow assessment & technical viability analysis
2. **Define:** Tailored architecture, scope, & milestones
3. **Develop:** Joint sprint execution with safety guardrails
4. **Deploy:** Production rollout, monitoring, and SLA support`,
      action: "open_lead_modal",
      actionLabel: "📅 Book a Technical Discovery Call",
      chips: [
        "🤖 Ask about Multi-Agent Capabilities",
        "💰 How do pricing & engagement work?",
        "📍 Where are your offices?"
      ]
    };
  }

  isLocationIntent(query) {
    const locKeywords = ['where are you', 'location', 'office', 'offices', 'address', 'branches', 'texas', 'usa', 'saudi', 'riyadh', 'qatar', 'pakistan', 'lahore'];
    return locKeywords.some(k => query.includes(k));
  }

  handleLocationIntent() {
    const offices = this.kb.company.offices;
    let listHtml = offices.map(o => `
- **${o.country} (${o.city}):** ${o.address} (Tel: \`${o.phone}\`)
`).join('');

    return {
      text: `### 🌍 Allzone Global Offices & Presence

Allzone Technologies operates across **4 strategic hubs** with seamless timezone coverage:

${listHtml}

All offices are backed by unified delivery squads, supporting clients across North America, the GCC, Europe, and Asia-Pacific.`,
      links: [{ title: "Contact Allzone Offices", url: "https://www.allzonetech.com/contact-us/" }],
      chips: [
        "📞 Book a Consultation",
        "🤖 Explore Multi-Agent Services",
        "👥 Hire Dedicated Teams"
      ]
    };
  }

  isCompanyIntent(query) {
    const compKeywords = ['ceo', 'leadership', 'executive', 'irshad', 'founder', 'history', 'experience', 'about allzone', 'tell me about allzone', 'delivering since'];
    return compKeywords.some(k => query.includes(k));
  }

  handleCompanyIntent() {
    const c = this.kb.company;
    return {
      text: `### 🏢 About Allzone Technologies

**Allzone Technologies** has been delivering production-grade digital and AI solutions since **${c.founded}** (${c.experience}).

- **Chief Executive Officer:** ${c.ceo}
- **Global Presence:** 4 Countries (USA, Saudi Arabia, Qatar, Pakistan)
- **Core Focus:** Building AI systems and enterprise software that perform reliably in the real world.
- **Key Disciplines:** ${c.disciplines.join(' · ')}

Allzone blends state-of-the-art AI capabilities (orchestration, RAG, multi-agent frameworks) with robust software engineering around authentication, guardrails, data governance, and cloud resilience.`,
      links: [
        { title: "About Allzone Technologies", url: "https://www.allzonetech.com/about-us/" },
        { title: "Client Case Studies", url: "https://www.allzonetech.com/work/" }
      ],
      chips: [
        "🤖 What are your Multi-Agent capabilities?",
        "💼 See Enterprise Case Studies",
        "📞 Contact Allzone"
      ]
    };
  }

  searchFaqs(query) {
    let best = null;
    let highestScore = 0;

    for (const faq of this.kb.faqs) {
      let score = 0;
      const qLower = faq.question.toLowerCase();

      // Check keywords
      for (const kw of faq.keywords) {
        if (query.includes(kw)) {
          score += 0.4;
          if (query === kw) score += 0.3;
        }
      }

      // Word overlap with question title
      const queryWords = query.split(/\s+/);
      const qWords = qLower.split(/\s+/);
      let matchCount = 0;
      for (const w of queryWords) {
        if (w.length > 3 && qWords.includes(w)) {
          matchCount++;
        }
      }
      score += (matchCount / queryWords.length) * 0.5;

      if (score > highestScore) {
        highestScore = score;
        best = faq;
      }
    }

    return best ? { faq: best, score: highestScore } : null;
  }

  formatFaqResponse(faq) {
    return {
      text: `### 💡 ${faq.question}

${faq.answer}`,
      links: [{ title: "Learn More on Official Site", url: faq.url }],
      chips: [
        "🤖 Tell me about Multi-Agent Systems",
        "🎙️ What about Voice AI?",
        "🔍 How does your RAG work?",
        "📞 Talk to an Engineer"
      ]
    };
  }

  searchServices(query) {
    let best = null;
    let highestScore = 0;

    for (const s of this.kb.services) {
      let score = 0;
      const titleLower = s.title.toLowerCase();

      // Strong boost for multi-agent if query mentions agents/multi-agent
      if (s.id === 'agentic-ai' && (query.includes('multi agent') || query.includes('multi-agent') || query.includes('agentic') || query.includes('agent') || query.includes('orchestration'))) {
        score += 0.7;
      }

      // Voice agent boost
      if (s.id === 'ai-voice-agents' && (query.includes('voice') || query.includes('phone') || query.includes('call') || query.includes('speech') || query.includes('telephony'))) {
        score += 0.7;
      }

      // RAG boost
      if (s.id === 'rag-knowledge-systems' && (query.includes('rag') || query.includes('knowledge') || query.includes('retrieval') || query.includes('document search') || query.includes('vector'))) {
        score += 0.7;
      }

      // Keyword matches
      for (const kw of s.keywords) {
        if (query.includes(kw)) {
          score += 0.35;
        }
      }

      // Title word matches
      const queryWords = query.split(/\s+/);
      for (const w of queryWords) {
        if (w.length > 3 && titleLower.includes(w)) {
          score += 0.2;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        best = s;
      }
    }

    return best ? { service: best, score: highestScore } : null;
  }

  formatServiceResponse(service, query) {
    const isMultiAgent = service.id === 'agentic-ai';
    
    let capabilitiesList = service.capabilities.map(c => `• **${c.split(':')[0]}:** ${c.split(':')[1] || ''}`).join('\n');
    let techStackPills = service.tech_stack.map(t => `\`${t}\``).join('  ');
    
    let caseStudiesSection = '';
    if (service.case_studies && service.case_studies.length > 0) {
      const items = service.case_studies.map(cs => `
- **[${cs.title}](${cs.url}):** ${cs.description}
`).join('');
      caseStudiesSection = `\n\n#### 🏆 Real Production Case Studies:\n${items}`;
    }

    let intro = isMultiAgent 
      ? `### 🤖 Multi-Agent Systems & Agentic AI at Allzone Technologies

Allzone specializes in building **autonomous multi-agent ecosystems** that do not just chat—they **plan, execute tools, integrate with enterprise APIs, and complete multi-step business workflows**.`
      : `### ⚡ ${service.title}

${service.short_description}`;

    return {
      text: `${intro}

#### 🛠️ What We Build:
${capabilitiesList}
${caseStudiesSection}

#### 💻 Technology Stack:
${techStackPills}`,
      links: [
        { title: `Explore ${service.title} on Allzone`, url: service.url },
        ...(service.article_url ? [{ title: "Deep Dive Architecture Article", url: service.article_url }] : [])
      ],
      chips: isMultiAgent ? [
        "🏆 Show Multi-Agent Case Studies",
        "🛡️ How do you handle guardrails & safety?",
        "🎙️ Tell me about Voice Agents",
        "📞 Schedule an Agentic AI Consultation"
      ] : [
        "🤖 Tell me about Multi-Agent Systems",
        "🔍 Tell me about RAG Development",
        "👥 Hire Engineers for this",
        "📞 Book a Technical Discovery"
      ]
    };
  }

  searchIndustries(query) {
    for (const ind of this.kb.industries) {
      if (query.includes(ind.name.toLowerCase())) {
        return ind;
      }
    }
    if (query.includes('industry') || query.includes('industries') || query.includes('verticals')) {
      return { all: true };
    }
    return null;
  }

  formatIndustryResponse(industry) {
    if (industry.all) {
      const list = this.kb.industries.map(i => `• **[${i.name}](${i.url}):** ${i.solutions}`).join('\n');
      return {
        text: `### 🌐 Industries Allzone Serves

Allzone delivers bespoke AI systems, platforms, and automation tailored to industry regulations:

${list}`,
        links: [{ title: "Explore All Industries", url: "https://www.allzonetech.com/industries/" }],
        chips: [
          "🏥 Healthcare AI",
          "💳 FinTech AI",
          "🛡️ Insurance AI",
          "🤖 Multi-Agent Systems"
        ]
      };
    }

    return {
      text: `### 🏢 Allzone AI Solutions for ${industry.name}

${industry.solutions}

We build HIPAA, SOC2, and PCI-DSS compliant workflows tailored specifically for ${industry.name} enterprises.`,
      links: [{ title: `${industry.name} Solutions Page`, url: industry.url }],
      chips: [
        "🤖 Multi-Agent Systems for this industry",
        "🔍 RAG Knowledge System for documents",
        "📞 Discuss an Industry Project"
      ]
    };
  }

  searchCaseStudies(query) {
    if (!query.includes('case stud') && !query.includes('portfolio') && !query.includes('work') && !query.includes('examples') && !query.includes('projects')) {
      return null;
    }

    let allStudies = [];
    for (const s of this.kb.services) {
      if (s.case_studies) {
        allStudies.push(...s.case_studies);
      }
    }

    return allStudies;
  }

  formatCaseStudyResponse(caseStudies) {
    const list = caseStudies.slice(0, 5).map(cs => `
- **[${cs.title}](${cs.url})**
  ${cs.description}
`).join('');

    return {
      text: `### 🏆 Featured Allzone Real-World Case Studies

Here are some of the high-impact production AI systems and platforms built by Allzone Technologies:

${list}`,
      links: [{ title: "View All 20+ Case Studies on allzonetech.com", url: "https://www.allzonetech.com/work/" }],
      chips: [
        "🤖 Tell me more about the Agentic Engineering Platform",
        "🏭 Tell me about the Manufacturing Agent Platform",
        "📞 Consult with our Engineers"
      ]
    };
  }

  handleFallback(rawQuery) {
    return {
      text: `I understand you are asking about *"**${rawQuery}**"*. 

Allzone Technologies provides end-to-end engineering across AI, multi-agent systems, cloud, and enterprise software. Here are our core specializations:

1. **Agentic AI & Multi-Agent Systems:** Autonomous agent orchestration, tool/API execution, and human guardrails.
2. **AI Voice Agents:** Real-time telephony bots with low-latency interruption handling.
3. **RAG & Enterprise Knowledge:** Grounding answers in company documents with zero hallucinations.
4. **Custom Enterprise Software:** Scalable platforms, ERP/CRM, and legacy modernization.
5. **Dedicated AI Engineers:** Pre-vetted senior squads on flexible engagement models.

Which of these would you like to explore?`,
      chips: [
        "🤖 Multi-Agent Systems",
        "🎙️ AI Voice Agents",
        "🔍 RAG Knowledge Systems",
        "💼 Enterprise Software",
        "📞 Book a Consultation"
      ]
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AllzoneKnowledgeEngine;
}
if (typeof window !== 'undefined') {
  window.AllzoneKnowledgeEngine = AllzoneKnowledgeEngine;
}
