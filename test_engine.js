const fs = require('fs');
const AllzoneKnowledgeEngine = require('./js/knowledge-engine.js');

const kb = JSON.parse(fs.readFileSync('./data/knowledge_base.json', 'utf8'));
const engine = new AllzoneKnowledgeEngine(kb);

async function runTests() {
  const testCases = [
    {
      query: "Do you guys provide multi agent systems or build multi agents?",
      expectedKeyword: "Multi-Agent"
    },
    {
      query: "tell me about ai voice agents for customer support",
      expectedKeyword: "Voice"
    },
    {
      query: "what is RAG and how do you retrieve documents?",
      expectedKeyword: "Retrieval"
    },
    {
      query: "where are your offices located?",
      expectedKeyword: "Cedar Park"
    },
    {
      query: "who is the CEO of Allzone?",
      expectedKeyword: "Irshad Kanwal"
    },
    {
      query: "can I hire dedicated ML engineers?",
      expectedKeyword: "engineers"
    },
    {
      query: "what case studies do you have?",
      expectedKeyword: "Case Studies"
    },
    {
      query: "i want to book a consultation",
      expectedKeyword: "Sales Manager"
    },
    {
      query: "how do you make multi agents?",
      expectedKeyword: "multi-agent"
    },
    {
      query: "how much does a project cost?",
      expectedKeyword: "pricing"
    },
    {
      query: "how long does it take to build an MVP?",
      expectedKeyword: "weeks"
    },
    {
      query: "can you build a custom website with React and Node?",
      expectedKeyword: "Web"
    },
    {
      query: "what LLM models do you use?",
      expectedKeyword: "OpenAI"
    },
    {
      query: "i want to schedule an appointment with your sales manager",
      expectedKeyword: "Sarah Vance"
    },
    {
      query: "هل تقدمون انظمة الوكلاء المتعددين والذكاء الاصطناعي؟",
      expectedKeyword: "الوكلاء المتعددين"
    },
    {
      query: "أين تقع مكاتبكم في السعودية وقطر؟",
      expectedKeyword: "الرياض"
    },
    {
      query: "أريد حجز موعد مع مدير المبيعات",
      expectedKeyword: "سارة فانس"
    },
    {
      query: "حدثني عن وكلاء الصوت للهاتف",
      expectedKeyword: "وكلاء الصوت"
    },
    {
      query: "ما هي خدماتكم؟",
      expectedKeyword: "الخدمات"
    },
    {
      query: "ماذا تقدمون؟",
      expectedKeyword: "الخدمات"
    },
    {
      query: "من هو المدير التنفيذي؟",
      expectedKeyword: "إرشاد قنوال"
    },
    {
      query: "كم يستغرق المشروع؟",
      expectedKeyword: "المدة الزمنية"
    },
    {
      query: "توظيف مطورين ومهندسين",
      expectedKeyword: "توظيف"
    },
    {
      query: "دراسات الحالة",
      expectedKeyword: "دراسات الحالة"
    },
    {
      query: "القطاعات والصناعات",
      expectedKeyword: "القطاعات"
    },
    {
      query: "تطوير تطبيقات الجوال والويب",
      expectedKeyword: "تطبيقات"
    }
  ];

  let passed = 0;
  console.log("=== RUNNING ENGINE TESTS ===");
  for (const tc of testCases) {
    const isolatedEngine = new AllzoneKnowledgeEngine(kb);
    const res = await isolatedEngine.processQuery(tc.query);
    const containsKeyword = res.text.toLowerCase().includes(tc.expectedKeyword.toLowerCase());
    if (containsKeyword) {
      console.log(`[PASS] "${tc.query}" -> matched keyword: "${tc.expectedKeyword}"`);
      passed++;
    } else {
      console.error(`[FAIL] "${tc.query}" -> DID NOT match: "${tc.expectedKeyword}"\nGot:\n${res.text}\n`);
    }
  }

  console.log(`\nResult: ${passed}/${testCases.length} single-query tests passed.`);

  // Test multi-turn conversational discovery funnel (English)
  console.log("\n=== RUNNING ENGLISH MULTI-TURN DISCOVERY FUNNEL TEST ===");
  const freshEngine = new AllzoneKnowledgeEngine(kb);
  
  const step1 = await freshEngine.processQuery("hi");
  console.log("[Turn 1 - Greeting]:", step1.text.substring(0, 70) + "...");
  if (!step1.text.includes("Alex")) throw new Error("Greeting did not include Alex");

  const step2 = await freshEngine.processQuery("I need an autonomous multi-agent system");
  console.log("[Turn 2 - Project Type]:", step2.text.substring(0, 70) + "...");
  if (!step2.text.includes("Autonomous Multi-Agent System")) throw new Error("Step 2 did not acknowledge Multi-Agent");

  const step3 = await freshEngine.processQuery("connect to our existing CRM and databases");
  console.log("[Turn 3 - Scope]:", step3.text.substring(0, 70) + "...");
  if (!step3.text.includes("Existing Systems")) throw new Error("Step 3 did not acknowledge integrations");

  const step4 = await freshEngine.processQuery("Rapid MVP in 3-4 weeks");
  console.log("[Turn 4 - Timeline & Booking]:", step4.text.substring(0, 70) + "...");
  if (!step4.text.includes("Sarah Vance")) throw new Error("Step 4 did not transition to Sales Manager Sarah Vance");
  if (step4.action !== 'render_booking_card') throw new Error("Step 4 did not trigger render_booking_card");

  console.log("ENGLISH MULTI-TURN CONSULTATIVE FUNNEL VERIFIED! 🏆");

  // Test multi-turn conversational discovery funnel (Arabic)
  console.log("\n=== RUNNING ARABIC MULTI-TURN DISCOVERY FUNNEL TEST ===");
  const arabicEngine = new AllzoneKnowledgeEngine(kb);
  arabicEngine.setLanguage("ar");

  const arGreeting = arabicEngine.handleGreeting();
  console.log("[Arabic Turn 1 - Greeting]:", arGreeting.text.substring(0, 70) + "...");
  if (!arGreeting.text.includes("أليكس")) throw new Error("Arabic greeting did not include أليكس");

  const arStep2 = await arabicEngine.processQuery("نظام وكلاء أذكياء لخدمة العملاء");
  console.log("[Arabic Turn 2 - Project Type]:", arStep2.text.substring(0, 70) + "...");
  if (!arStep2.text.includes("اختيار متميز")) throw new Error("Arabic Step 2 did not acknowledge project selection");
  if (arabicEngine.consultationStage !== 'SCOPE') throw new Error("Arabic Step 2 did not advance stage to SCOPE");

  const arStep3 = await arabicEngine.processQuery("الربط مع نظام CRM وقواعد بيانات SQL وبوابة الدفع");
  console.log("[Arabic Turn 3 - Scope]:", arStep3.text.substring(0, 70) + "...");
  if (!arStep3.text.includes("تم تسجيل نطاق العمل")) throw new Error("Arabic Step 3 did not acknowledge integrations");
  if (arabicEngine.consultationStage !== 'TIMELINE') throw new Error("Arabic Step 3 did not advance stage to TIMELINE");

  const arStep4 = await arabicEngine.processQuery("نستهدف إطلاق النموذج الأولي خلال 4 أسابيع");
  console.log("[Arabic Turn 4 - Timeline & Booking]:", arStep4.text.substring(0, 70) + "...");
  if (!arStep4.text.includes("سارة فانس")) throw new Error("Arabic Step 4 did not transition to Sales Manager Sarah Vance");
  if (arStep4.action !== 'render_booking_card') throw new Error("Arabic Step 4 did not trigger render_booking_card");

  console.log("ARABIC MULTI-TURN CONSULTATIVE FUNNEL VERIFIED! 🏆");

  if (passed === testCases.length) {
    console.log("\nALL KNOWLEDGE & CONSULTATIVE ENGINE TESTS PASSED (ENGLISH & ARABIC)! 🚀");
  } else {
    process.exit(1);
  }
}

runTests();

