import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const GREEN = "#1D9E75";
const BG = "#0A0A0A";
const CARD = "#141414";
const BORDER = "rgba(29,158,117,0.2)";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: GREEN }}
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 12h6m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 6h6m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 18h6m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-white font-semibold tracking-tight text-lg">SplitArc</span>
    </Link>
  );
}

function LaunchButton({
  solid = false,
  className = "",
  children = "Launch App",
}: {
  solid?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      to="/app"
      className={
        "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 " +
        (solid
          ? "text-white shadow-[0_0_24px_rgba(29,158,117,0.35)] hover:brightness-110"
          : "border text-[color:var(--g)] hover:text-white hover:bg-[color:var(--g)]") +
        " " +
        className
      }
      style={
        {
          background: solid ? GREEN : "transparent",
          borderColor: GREEN,
          ["--g" as any]: GREEN,
        } as React.CSSProperties
      }
    >
      {children}
    </Link>
  );
}

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>("[data-fade]");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("fade-in-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const ref = useFadeIn();

  return (
    <div ref={ref} style={{ background: BG }} className="min-h-screen text-white antialiased">
      <style>{`
        html { scroll-behavior: smooth; }
        [data-fade] { opacity: 0; transform: translateY(12px); transition: opacity .7s ease, transform .7s ease; }
        .fade-in-visible { opacity: 1 !important; transform: none !important; }
        .hero-glow { text-shadow: 0 0 40px rgba(29,158,117,0.35), 0 0 8px rgba(29,158,117,0.2); }
      `}</style>

      {/* Nav */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "rgba(10,10,10,0.75)", borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Logo />
          <LaunchButton />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-28 pb-28 text-center">
        <h1
          data-fade
          className="hero-glow font-bold tracking-tight text-white leading-[1.05]"
          style={{ fontSize: "clamp(40px, 7vw, 72px)" }}
        >
          Split USDC to anyone,
          <br />
          <span style={{ color: GREEN }}>instantly.</span>
        </h1>
        <p
          data-fade
          className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-neutral-400 leading-relaxed"
        >
          Pay your team, split bills, distribute revenue — all in one onchain transaction. Powered by Arc and Circle.
        </p>

        <div data-fade className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <LaunchButton solid />
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium border border-white/15 text-neutral-200 hover:bg-white/5 transition"
          >
            View on ArcScan →
          </a>
        </div>

        <div data-fade className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-400">
          <span>⚡ Sub-second finality</span>
          <span className="text-neutral-700">·</span>
          <span>🔵 USDC gas fees</span>
          <span className="text-neutral-700">·</span>
          <span>🔒 Powered by Circle</span>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 data-fade className="text-center text-3xl md:text-4xl font-bold tracking-tight">
          Simple as 1, 2, 3
        </h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", icon: "🔗", t: "Connect Wallet", d: "Link your EVM wallet in one click." },
            { n: "02", icon: "👥", t: "Add Recipients", d: "Enter addresses and set your split." },
            { n: "03", icon: "🚀", t: "Split & Send", d: "One transaction. Everyone gets paid." },
          ].map((s) => (
            <div
              key={s.n}
              data-fade
              className="rounded-xl p-6 transition hover:-translate-y-0.5"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
            >
              <div className="text-sm font-mono" style={{ color: GREEN }}>{s.n}</div>
              <div className="mt-3 text-2xl">{s.icon}</div>
              <div className="mt-3 text-lg font-semibold">{s.t}</div>
              <div className="mt-1.5 text-sm text-neutral-400">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 data-fade className="text-center text-3xl md:text-4xl font-bold tracking-tight">
          Built for real payments
        </h2>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {[
            { icon: "👥", t: "Team Payroll", d: "Pay multiple contributors in one click." },
            { icon: "🤝", t: "Bill Splitting", d: "Divide expenses fairly, onchain." },
            { icon: "🎨", t: "Creator Revenue", d: "Distribute earnings to collaborators." },
            { icon: "🌍", t: "Global Payouts", d: "Send to anyone, anywhere, instantly." },
          ].map((u) => (
            <div
              key={u.t}
              data-fade
              className="rounded-xl p-7 transition hover:-translate-y-0.5"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
            >
              <div className="text-2xl">{u.icon}</div>
              <div className="mt-3 text-xl font-semibold">{u.t}</div>
              <div className="mt-1.5 text-neutral-400">{u.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Arc */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div
          data-fade
          className="rounded-2xl p-10 md:p-14"
          style={{ background: "#0D2B22", border: `1px solid ${BORDER}` }}
        >
          <div className="grid gap-10 md:grid-cols-3 text-center">
            {[
              { v: "<1s", l: "Finality speed" },
              { v: "USDC", l: "Gas token (no volatility)" },
              { v: "Circle", l: "Infrastructure partner" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  className="text-5xl md:text-6xl font-bold tracking-tight"
                  style={{ color: GREEN }}
                >
                  {s.v}
                </div>
                <div className="mt-2 text-sm text-neutral-300">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            SplitArc is built on Arc — a stablecoin-native L1 blockchain by Circle. Fees are paid in USDC, settlement is instant, and the infrastructure is enterprise-grade.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="text-sm text-neutral-400">
            Built on Arc · Powered by Circle · Testnet
          </div>
          <Link to="/app" className="text-sm font-medium" style={{ color: GREEN }}>
            Launch App →
          </Link>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-neutral-500 text-center">
            Not financial advice. For testnet use only.
          </div>
        </div>
      </footer>
    </div>
  );
}
