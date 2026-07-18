import React, { useState, useEffect } from "react";

const FREE_DAILY_LIMIT = 5;
const todayKey = () => new Date().toISOString().slice(0, 10);

function RedCircle({ className = "" }) {
  return (
    <svg viewBox="0 0 200 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 40 C 8 18, 40 6, 100 8 C 165 10, 195 22, 188 36 C 180 52, 130 56, 90 54 C 45 52, 10 48, 14 36"
        stroke="#C0392B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RedUnderline({ className = "" }) {
  return (
    <svg viewBox="0 0 220 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10 Q 60 18, 110 9 T 216 11" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function RedArrow({ className = "" }) {
  return (
    <svg viewBox="0 0 80 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4 C 30 20, 40 35, 46 52" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 44 L46 52 L40 36" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const RULED_BG = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent, transparent 35px, rgba(90,110,170,0.28) 36px)",
  backgroundColor: "#FAF4D3",
};

function Nav() {
  return (
    <nav className="w-full flex items-center justify-between px-6 md:px-12 py-5 relative z-20">
      <div className="flex items-center gap-2">
        <span
          className="text-2xl tracking-tight"
          style={{ fontFamily: "'Zilla Slab', serif", fontWeight: 700, color: "#1E2A4A" }}
        >
          Hookline
        </span>
        <span
          className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
          style={{ color: "#C0392B", border: "1px solid #C0392B" }}
        >
          v1
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "#1E2A4A", fontFamily: "'Inter', sans-serif" }}>
        <a href="#demo" className="hover:opacity-70">Try it</a>
        <a href="#how" className="hover:opacity-70">How it works</a>
        <a href="#pricing" className="hover:opacity-70">Pricing</a>
      </div>
      <button
        className="text-sm font-medium px-4 py-2 rounded-sm"
        style={{ backgroundColor: "#1E2A4A", color: "#FAF4D3", fontFamily: "'Inter', sans-serif" }}
      >
        Get started
      </button>
    </nav>
  );
}

function Demo() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState(null);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [usedToday, setUsedToday] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`usage:${todayKey()}`);
      setUsedToday(stored ? parseInt(stored, 10) : 0);
    } catch {
      setUsedToday(0);
    }
    try {
      const stored = localStorage.getItem("history");
      setHistory(stored ? JSON.parse(stored) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const remaining = Math.max(FREE_DAILY_LIMIT - usedToday, 0);

  const saveToHistory = (draft, generatedHooks) => {
    const entry = { draft, hooks: generatedHooks, at: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem("history", JSON.stringify(updated));
    } catch {}
  };

  const bumpUsage = () => {
    const next = usedToday + 1;
    setUsedToday(next);
    try {
      localStorage.setItem(`usage:${todayKey()}`, String(next));
    } catch {}
  };

  const runDemo = async () => {
    if (!input.trim()) return;
    if (remaining <= 0) {
      setError(`You've used today's ${FREE_DAILY_LIMIT} free hooks. Upgrade to Pro for unlimited.`);
      return;
    }
    setLoading(true);
    setError("");
    setHooks(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: input }),
      });
      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.error);
      setHooks(parsed.hooks || []);
      bumpUsage();
      saveToHistory(input, parsed.hooks || []);
    } catch (e) {
      setError("Couldn't generate hooks right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div id="demo" className="w-full max-w-xl mx-auto md:mx-0 relative">
      <div
        className="rounded-sm p-6 md:p-7 relative"
        style={{ ...RULED_BG, border: "1px solid rgba(30,42,74,0.25)", boxShadow: "3px 4px 0px rgba(30,42,74,0.15)" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: "#C0392B", opacity: 0.6 }} />
        <div className="flex items-center justify-between pl-3 mb-3">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "#1E2A4A", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Paste your draft
          </p>
          <span
            className="text-xs"
            style={{ color: remaining === 0 ? "#C0392B" : "#1E2A4A", opacity: 0.6, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {remaining}/{FREE_DAILY_LIMIT} free today
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Just launched our new skincare line, made with all natural ingredients..."
          className="w-full pl-3 bg-transparent outline-none resize-none text-[15px] leading-[36px]"
          style={{ fontFamily: "'Inter', sans-serif", color: "#1E2A4A", height: "108px" }}
        />
        <div className="pl-3 flex items-center justify-between mt-1">
          <span className="text-xs" style={{ color: "#1E2A4A", opacity: 0.5, fontFamily: "'Inter', sans-serif" }}>
            {input.length} characters
          </span>
          <button
            onClick={runDemo}
            disabled={loading || !input.trim() || remaining <= 0}
            className="text-sm font-medium px-5 py-2 rounded-sm disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: "#C0392B", color: "#FAF4D3", fontFamily: "'Inter', sans-serif" }}
          >
            {loading ? "Finding your hook..." : "Find my hook"}
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="mt-3 text-xs underline"
          style={{ color: "#1E2A4A", opacity: 0.6, fontFamily: "'Inter', sans-serif" }}
        >
          {showHistory ? "Hide" : "Show"} saved history ({history.length})
        </button>
      )}

      {showHistory && (
        <div className="mt-3 space-y-3 max-h-64 overflow-y-auto pr-1">
          {history.map((h, i) => (
            <div key={i} className="text-sm p-3 rounded-sm" style={{ backgroundColor: "rgba(30,42,74,0.06)" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "#1E2A4A", opacity: 0.6 }} className="text-xs mb-1 truncate">
                {h.draft}
              </p>
              {h.hooks?.map((hk, j) => (
                <p key={j} style={{ fontFamily: "'Zilla Slab', serif", color: "#1E2A4A" }} className="text-[13px]">
                  {hk.text}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm" style={{ color: "#C0392B", fontFamily: "'Inter', sans-serif" }}>
          {error}
        </p>
      )}

      {hooks && (
        <div className="mt-6 space-y-4">
          {hooks.map((h, idx) => (
            <div key={idx} className="flex items-start gap-3 relative">
              <span
                className="text-xs uppercase tracking-widest mt-1.5 whitespace-nowrap"
                style={{ color: "#C0392B", fontFamily: "'IBM Plex Mono', monospace", width: "72px", flexShrink: 0 }}
              >
                {h.style}
              </span>
              <button
                onClick={() => copyText(h.text, idx)}
                className="text-left text-[15px] leading-snug flex-1 group"
                style={{ fontFamily: "'Zilla Slab', serif", color: "#1E2A4A" }}
              >
                {h.text}
                <span
                  className="ml-2 text-xs opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {copiedIdx === idx ? "copied" : "click to copy"}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="px-6 md:px-12 pt-8 pb-20 md:pt-12 md:pb-28 grid md:grid-cols-2 gap-12 items-center relative">
      <div>
        <h1
          className="text-[2.6rem] md:text-[3.4rem] leading-[1.05] relative"
          style={{ fontFamily: "'Zilla Slab', serif", fontWeight: 700, color: "#1E2A4A" }}
        >
          Your caption is fine.
          <br />
          <span className="relative inline-block">
            Your hook isn't there yet.
            <RedUnderline className="absolute left-0 -bottom-2 w-full h-3" />
          </span>
        </h1>
        <p
          className="mt-6 text-lg max-w-md"
          style={{ fontFamily: "'Inter', sans-serif", color: "#1E2A4A", opacity: 0.75 }}
        >
          Paste what you've already written. Get three opening lines built to
          stop the scroll on Instagram, TikTok, and LinkedIn — try it below,
          no signup required.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <RedArrow className="w-10 h-10 hidden md:block" />
          <span
            className="text-sm"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#C0392B" }}
          >
            live demo, right here
          </span>
        </div>
      </div>
      <Demo />
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Paste your draft",
      body: "Drop in a rough caption, product description, or just a few bullet points about your post.",
    },
    {
      n: "02",
      title: "Get three hooks",
      body: "Hookline rewrites the opening line three ways — bold, curious, and relatable — so you're never stuck with one option.",
    },
    {
      n: "03",
      title: "Copy and post",
      body: "Pick the one that fits, copy it, and drop it into whatever you're already writing.",
    },
  ];
  return (
    <section id="how" className="px-6 md:px-12 py-20" style={{ backgroundColor: "#F1EAC0" }}>
      <p
        className="text-xs uppercase tracking-widest mb-10"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#C0392B" }}
      >
        How it works
      </p>
      <div className="grid md:grid-cols-3 gap-10">
        {steps.map((s) => (
          <div key={s.n}>
            <span
              className="text-4xl"
              style={{ fontFamily: "'Zilla Slab', serif", fontWeight: 700, color: "#1E2A4A", opacity: 0.25 }}
            >
              {s.n}
            </span>
            <h3
              className="text-xl mt-3 mb-2"
              style={{ fontFamily: "'Zilla Slab', serif", fontWeight: 600, color: "#1E2A4A" }}
            >
              {s.title}
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "#1E2A4A", opacity: 0.7, lineHeight: 1.6 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { title: "Tuned per platform", body: "Hooks written for how people actually scroll IG, TikTok, X, and LinkedIn differently." },
    { title: "Remembers your voice", body: "Save a brand voice once. Every hook after that sounds like you, not a generic template." },
    { title: "Hashtags included", body: "Each hook comes with a matched set of tags, not a separate tool you have to jump to." },
    { title: "Built for speed", body: "No long forms. Paste, generate, copy — under ten seconds per post." },
  ];
  return (
    <section className="px-6 md:px-12 py-20">
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-3xl">
        {items.map((f) => (
          <div key={f.title} className="flex gap-4">
            <RedCircle className="w-10 h-10 flex-shrink-0 mt-1" />
            <div>
              <h3 style={{ fontFamily: "'Zilla Slab', serif", fontWeight: 600, color: "#1E2A4A" }} className="text-lg mb-1">
                {f.title}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "#1E2A4A", opacity: 0.7, lineHeight: 1.6 }}>
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Starter", price: "Free", detail: "5 hooks a day, one platform style", cta: "Start free" },
    { name: "Pro", price: "$19/mo", detail: "Unlimited hooks, every platform, saved history", cta: "Go Pro", highlight: true },
    { name: "Business", price: "$49/mo", detail: "Team seats, brand voice presets, priority support", cta: "Talk to us" },
  ];
  return (
    <section id="pricing" className="px-6 md:px-12 py-20" style={{ backgroundColor: "#F1EAC0" }}>
      <p
        className="text-xs uppercase tracking-widest mb-10"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#C0392B" }}
      >
        Pricing
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div
            key={t.name}
            className="p-6 rounded-sm relative"
            style={{
              backgroundColor: t.highlight ? "#1E2A4A" : "#FAF4D3",
              border: t.highlight ? "none" : "1px solid rgba(30,42,74,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Zilla Slab', serif",
                fontWeight: 600,
                color: t.highlight ? "#FAF4D3" : "#1E2A4A",
              }}
              className="text-xl mb-1"
            >
              {t.name}
            </h3>
            <p
              style={{
                fontFamily: "'Zilla Slab', serif",
                fontWeight: 700,
                color: t.highlight ? "#FAF4D3" : "#1E2A4A",
              }}
              className="text-3xl mb-3"
            >
              {t.price}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                color: t.highlight ? "#FAF4D3" : "#1E2A4A",
                opacity: 0.75,
              }}
              className="mb-6 text-sm leading-relaxed"
            >
              {t.detail}
            </p>
            <button
              className="w-full py-2.5 rounded-sm text-sm font-medium"
              style={{
                backgroundColor: t.highlight ? "#C0392B" : "#1E2A4A",
                color: "#FAF4D3",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <span style={{ fontFamily: "'Zilla Slab', serif", fontWeight: 700, color: "#1E2A4A" }}>Hookline</span>
      <span style={{ fontFamily: "'Inter', sans-serif", color: "#1E2A4A", opacity: 0.6 }} className="text-sm">
        Better openings, faster.
      </span>
    </footer>
  );
}

export default function App() {
  return (
    <div style={{ backgroundColor: "#FAF4D3", minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
