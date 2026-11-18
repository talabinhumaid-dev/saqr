
import { useState } from "react";
import {
  Shield, Search, FileWarning, ClipboardList, BookOpen,
  ArrowLeft, Lock, Menu, X, Sparkles, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock, Link2, Phone,
  CreditCard, Send, RefreshCw, Fingerprint
} from "lucide-react";
import "./App.css";

const tips = [
  {
    icon: Link2,
    title: "تحقق من الروابط",
    description: "لا تضغط على الروابط المجهولة، وتأكد من عنوان الموقع."
  },
  {
    icon: Lock,
    title: "احمِ رمز التحقق",
    description: "لا تشارك رمز OTP مع أي شخص مهما كانت صفته."
  },
  {
    icon: Phone,
    title: "احذر المكالمات المشبوهة",
    description: "لا تثق بالمكالمات التي تطلب بيانات بطاقتك."
  },
  {
    icon: CreditCard,
    title: "احمِ بياناتك المالية",
    description: "لا تشارك بيانات حسابك مع جهات غير موثوقة."
  }
];

function App() {
  const [page, setPage] = useState("home");
  const [menu, setMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [reports, setReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saqr_reports") || "[]");
    } catch {
      return [];
    }
  });
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [report, setReport] = useState({
    type: "رسالة احتيالية",
    details: "",
    contact: ""
  });

  const navigation = [
    ["home", "الرئيسية"],
    ["analyze", "فحص الاحتيال"],
    ["report", "الإبلاغ"],
    ["tracking", "متابعة البلاغ"],
    ["awareness", "التوعية"]
  ];

  function navigate(target) {
    setPage(target);
    setMenu(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveReports(next) {
    setReports(next);
    localStorage.setItem("saqr_reports", JSON.stringify(next));
  }

  async function analyzeMessage() {
    if (!message.trim()) {
      setError("فضلاً أدخل الرسالة أو الرابط أولاً.");
      return;
    }

    const webhook = import.meta.env.VITE_SCAMLENS_WEBHOOK_URL;

    if (!webhook) {
      setError("خدمة ScamLens غير متصلة. أضف رابط Webhook في ملف البيئة.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          source: "SAQR",
          language: "ar"
        })
      });

      if (!response.ok) throw new Error("تعذر الاتصال بخدمة التحليل.");

      const result = await response.json();
      const data = result.output ?? result;

      if (
        !data.riskLevel ||
        !data.explanation ||
        !Array.isArray(data.indicators) ||
        !Array.isArray(data.recommendations)
      ) {
        throw new Error("استجابة ScamLens غير مكتملة.");
      }

      setAnalysis(data);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التحليل.");
    } finally {
      setLoading(false);
    }
  }

  function submitReport(e) {
    e.preventDefault();

    const reference =
      "SQR-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const newReport = {
      reference,
      type: report.type,
      details: report.details,
      contact: report.contact,
      status: "تم استلام البلاغ",
      date: new Date().toLocaleDateString("ar-SA")
    };

    saveReports([newReport, ...reports]);
    setTrackingId(reference);
    setTrackingResult(newReport);
    setReport({
      type: "رسالة احتيالية",
      details: "",
      contact: ""
    });
    navigate("tracking");
    setTrackingResult(newReport);
  }

  function trackReport(e) {
    e.preventDefault();

    const found = reports.find(
      r => r.reference.toLowerCase() === trackingId.trim().toLowerCase()
    );

    setTrackingResult(found || false);
  }

  return (
    <div className="app" dir="rtl">

      <header className="navbar">
        <div className="brand" onClick={() => navigate("home")}>
          <div className="brand-symbol">ص</div>
          <div>
            <h2>صقر <span>SAQR</span></h2>
            <small>وعي يحمي أموالك</small>
          </div>
        </div>

        <nav className={menu ? "nav-links open" : "nav-links"}>
          {navigation.map(([id, label]) => (
            <button
              key={id}
              className={page === id ? "nav-link active" : "nav-link"}
              onClick={() => navigate(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="nav-status">
          <span className="status-dot"></span>
          منصة توعوية مستقلة
        </div>

        <button className="menu-button" onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      <main>

        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">SAQR DIGITAL PROTECTION</span>

                <h1>
                  أموالك تستاهل
                  <br />
                  <span>حماية أذكى.</span>
                </h1>

                <p>
                  اكتشف مؤشرات الاحتيال قبل أن تقع ضحيتها.
                  افحص الرسائل والروابط المشبوهة بمساعدة
                  ScamLens، وخلّ وعيك أول خط دفاع.
                </p>

                <div className="hero-actions">
                  <button className="btn-gold" onClick={() => navigate("analyze")}>
                    ابدأ الفحص <ArrowLeft size={17} />
                  </button>

                  <button className="btn-outline" onClick={() => navigate("awareness")}>
                    تعرف على طرق الحماية
                  </button>
                </div>

                <div className="hero-trust">
                  <ShieldCheck size={17} />
                  لا نطلب كلمات المرور أو بياناتك البنكية
                </div>
              </div>

              <div className="hero-visual">
                <div className="visual-ring ring-1"></div>
                <div className="visual-ring ring-2"></div>
                <div className="visual-ring ring-3"></div>

                <div className="hero-shield">
                  <Shield size={105} />
                  <span>ص</span>
                </div>

                <div className="visual-label label-top">
                  <ShieldCheck size={17} /> حماية رقمية
                </div>

                <div className="visual-label label-bottom">
                  <span className="status-dot"></span>
                  الوعي أول خط دفاع
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <span className="eyebrow">OUR SERVICES</span>
                <h2>كل ما تحتاجه لحماية أموالك</h2>
                <p>خدمات ذكية تساعدك على التعرف على محاولات الاحتيال.</p>
              </div>

              <div className="service-grid">
                {[
                  [Search, "كشف الاحتيال", "افحص الرسائل والروابط المشبوهة.", "analyze"],
                  [FileWarning, "الإبلاغ عن الاحتيال", "سجل تفاصيل محاولة الاحتيال.", "report"],
                  [ClipboardList, "متابعة البلاغ", "استعلم عن حالة البلاغ.", "tracking"],
                  [BookOpen, "التوعية المالية", "تعرف على طرق الاحتيال والحماية.", "awareness"]
                ].map(([Icon, title, desc, target]) => (
                  <button className="service-card" key={target} onClick={() => navigate(target)}>
                    <div className="service-icon"><Icon size={25} /></div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <span>اكتشف المزيد ←</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="wide-callout">
              <div>
                <span className="eyebrow">THINK BEFORE YOU CLICK</span>
                <h2>وصلك شيء مريب؟ توقف قبل ما تضغط.</h2>
                <p>انسخ الرسالة وافحصها قبل اتخاذ أي خطوة.</p>
              </div>
              <button className="btn-green" onClick={() => navigate("analyze")}>
                افحص الآن <ArrowLeft size={17} />
              </button>
            </section>
          </>
        )}

        {page === "analyze" && (
          <section className="page-wrap">
            <PageTitle
              eyebrow="AI FRAUD DETECTION"
              title="خلّ صقر يفحصها لك"
              description="الصق الرسالة أو الرابط المشبوه ودع ScamLens يساعدك."
            />

            <div className="main-card">
              <div className="field-heading">
                <div className="service-icon"><Sparkles /></div>
                <div>
                  <h3>محتوى الرسالة أو الرابط</h3>
                  <p>أدخل المحتوى الذي تريد تحليله</p>
                </div>
              </div>

              <textarea
                rows="7"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="الصق الرسالة أو الرابط المشبوه هنا..."
              />

              <div className="textarea-footer">
                <span>{message.length} حرف</span>
                <span><Lock size={13} /> لا تدخل بياناتك السرية</span>
              </div>

              {error && <div className="error-alert"><AlertTriangle /> {error}</div>}

              <button className="btn-green full-btn" onClick={analyzeMessage} disabled={loading}>
                {loading ? <><RefreshCw className="spin" /> جاري التحليل</> :
                  <><Sparkles size={18} /> تحليل المحتوى</>}
              </button>

              <p className="privacy-note">
                يتم إرسال النص إلى خدمة ScamLens عند الضغط على تحليل.
              </p>
            </div>

            {loading && (
              <div className="loading-card">
                <div className="loader"></div>
                <h3>جاري فحص المحتوى</h3>
                <p>ننتظر استجابة ScamLens...</p>
              </div>
            )}

            {analysis && (
              <div className="main-card result-card">
                <span className="eyebrow">SCAMLENS ANALYSIS</span>
                <h2>نتيجة التحليل</h2>

                <div className="risk-box">
                  <span>مستوى الخطورة</span>
                  <strong>{analysis.riskLevel}</strong>
                </div>

                <h3>المؤشرات المكتشفة</h3>
                {analysis.indicators.map((item, i) => (
                  <div className="indicator" key={i}>
                    <AlertTriangle size={17} /> {item}
                  </div>
                ))}

                <h3>تفسير النتيجة</h3>
                <p className="result-description">{analysis.explanation}</p>

                <h3>التوصيات الأمنية</h3>
                {analysis.recommendations.map((item, i) => (
                  <div className="recommendation" key={i}>
                    <CheckCircle2 size={17} /> {item}
                  </div>
                ))}

                <p className="disclaimer">
                  التحليل مساعد توعوي ولا يضمن اكتشاف جميع محاولات الاحتيال.
                </p>
              </div>
            )}
          </section>
        )}

        {page === "report" && (
          <section className="page-wrap">
            <PageTitle
              eyebrow="FRAUD REPORTING"
              title="الإبلاغ عن محاولة احتيال"
              description="ساهم في التوعية والإبلاغ عن محاولات الاحتيال الإلكتروني."
            />

            <form className="main-card form-card" onSubmit={submitReport}>
              <div className="field-heading">
                <div className="service-icon"><FileWarning /></div>
                <div>
                  <h3>تفاصيل البلاغ</h3>
                  <p>أدخل تفاصيل المحاولة</p>
                </div>
              </div>

              <label>نوع البلاغ</label>
              <select value={report.type}
                onChange={e => setReport({...report, type:e.target.value})}>
                <option>رسالة احتيالية</option>
                <option>رابط مشبوه</option>
                <option>مكالمة احتيالية</option>
                <option>انتحال شخصية أو جهة</option>
                <option>محاولة سرقة بيانات</option>
                <option>أخرى</option>
              </select>

              <label>تفاصيل البلاغ</label>
              <textarea rows="6" required minLength="10"
                value={report.details}
                onChange={e => setReport({...report, details:e.target.value})}
                placeholder="اشرح ما حدث دون مشاركة بياناتك السرية..." />

              <label>البريد الإلكتروني (اختياري)</label>
              <input type="email" value={report.contact}
                onChange={e => setReport({...report, contact:e.target.value})}
                placeholder="example@email.com" />

              <div className="notice">
                <AlertTriangle size={17} />
                نموذج تجريبي يحفظ البلاغ محلياً على جهازك فقط، ولا يرسله إلى جهة رسمية.
              </div>

              <button className="btn-green full-btn" type="submit">
                <Send size={17} /> إرسال البلاغ
              </button>
            </form>
          </section>
        )}

        {page === "tracking" && (
          <section className="page-wrap">
            <PageTitle
              eyebrow="REPORT TRACKING"
              title="متابعة البلاغ"
              description="أدخل الرقم المرجعي لمعرفة حالة البلاغ المحفوظ على هذا الجهاز."
            />

            <form className="main-card tracking-form" onSubmit={trackReport}>
              <div className="field-heading">
                <div className="service-icon"><ClipboardList /></div>
                <div>
                  <h3>الرقم المرجعي</h3>
                  <p>أدخل رقم البلاغ الذي حصلت عليه</p>
                </div>
              </div>

              <input value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                placeholder="SQR-XXXXXX" required />

              <button className="btn-green full-btn">
                تتبع البلاغ <ArrowLeft size={17} />
              </button>
            </form>

            {trackingResult === false && (
              <div className="error-alert">لم يتم العثور على البلاغ. تحقق من الرقم.</div>
            )}

            {trackingResult && trackingResult !== false && (
              <div className="main-card result-card">
                <span className="eyebrow">REPORT DETAILS</span>
                <h2>تفاصيل البلاغ</h2>
                <Detail label="الرقم المرجعي" value={trackingResult.reference} />
                <Detail label="نوع البلاغ" value={trackingResult.type} />
                <Detail label="تاريخ التقديم" value={trackingResult.date} />
                <Detail label="الحالة" value={trackingResult.status} />
                <div className="notice">
                  هذه حالة تجريبية محفوظة على جهازك، وليست تحديثاً من جهة رسمية.
                </div>
              </div>
            )}
          </section>
        )}

        {page === "awareness" && (
          <section className="page-wrap">
            <PageTitle
              eyebrow="FINANCIAL AWARENESS"
              title="وعيك هو خط دفاعك الأول"
              description="تعرف على أساليب الاحتيال وكيف تحمي معلوماتك المالية."
            />

            <div className="tips-grid">
              {tips.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div className="tip-card" key={i}>
                    <div className="service-icon"><Icon size={25} /></div>
                    <h3>{tip.title}</h3>
                    <p>{tip.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="main-card awareness-box">
              <Fingerprint size={45} />
              <span className="eyebrow">REMEMBER</span>
              <h2>توقف، تحقق، ثم قرر.</h2>
              <p>لحظات من التحقق قد تحميك من خسارة كبيرة.</p>
              <button className="btn-green" onClick={() => navigate("analyze")}>
                افحص رسالة مشبوهة
              </button>
            </div>
          </section>
        )}

      </main>

      <footer className="footer">
        <div className="footer-brand">
          <div className="brand-symbol">ص</div>
          <h3>صقر SAQR</h3>
        </div>
        <p>وعي يحمي أموالك. منصة توعوية مستقلة لمكافحة الاحتيال الإلكتروني.</p>
        <p className="footer-disclaimer">
          صقر منصة مستقلة غير تابعة للبنك الأهلي السعودي أو أي مؤسسة مالية.
          لا تقدم خدمات مصرفية ولا تطلب بيانات الدخول.
        </p>
        <small>© 2026 SAQR. جميع الحقوق محفوظة.</small>
      </footer>

    </div>
  );
}

function PageTitle({ eyebrow, title, description }) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
