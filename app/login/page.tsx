"use client"
import { useState, useEffect, FormEvent, FocusEvent, MouseEvent } from "react";
import { useAuth } from "@/hooks/useAuth"; // ✅ added

export default function LoginPage() {
  const [email, setEmail]     = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  const { loginMutation } = useAuth(); // ✅ replaced local loading state
  const loading = loginMutation.isPending; // alias so JSX stays unchanged

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 60);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    loginMutation.mutate({ email, password }); // ✅ real API call
  }

  function handleInputFocus(e: FocusEvent<HTMLInputElement>): void {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
  }

  function handleInputBlur(e: FocusEvent<HTMLInputElement>): void {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
  }

  function handleAnchorEnter(e: MouseEvent<HTMLAnchorElement>): void {
    e.currentTarget.style.color = "white";
  }

  function handleAnchorLeave(e: MouseEvent<HTMLAnchorElement>): void {
    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
  }

  function handleBtnEnter(e: MouseEvent<HTMLButtonElement>): void {
    if (!loading) {
      e.currentTarget.style.background = "linear-gradient(180deg, rgba(100,100,100,0.9) 0%, rgba(42,42,42,0.95) 100%)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
    }
  }

  function handleBtnLeave(e: MouseEvent<HTMLButtonElement>): void {
    if (!loading) {
      e.currentTarget.style.background = "linear-gradient(180deg, rgba(80,80,80,0.9) 0%, rgba(28,28,28,0.95) 100%)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
    }
  }

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden"
    >
      {/* Dashed outer border box */}
      <div
        className="absolute"
        style={{
          width: "460px",
          height: "420px",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: "4px",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          width: "460px",
          padding: "48px 52px 44px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="white" />
            <path
              d="M19 9H12C10.343 9 9 10.343 9 12C9 13.657 10.343 15 12 15H16C17.657 15 19 16.343 19 18C19 19.657 17.657 21 16 21H9"
              stroke="black"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="text-white font-semibold"
            style={{ fontSize: "20px", letterSpacing: "0.03em" }}
          >
            Seezer.ai
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white" style={{ fontSize: "13px", fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              className="w-full rounded-xl text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                padding: "11px 14px",
                fontSize: "14px",
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white" style={{ fontSize: "13px", fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                padding: "11px 14px",
                fontSize: "14px",
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-white font-semibold transition-all mt-1 flex items-center justify-center gap-2"
            style={{
              background: loading
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(180deg, rgba(80,80,80,0.9) 0%, rgba(28,28,28,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: loading ? "none" : "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.4)",
              padding: "12px",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={handleBtnEnter}
            onMouseLeave={handleBtnLeave}
          >
            {loading ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  style={{ animation: "spin 0.75s linear infinite" }}
                >
                  <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                  <path d="M 7 1.5 A 5.5 5.5 0 0 1 12.5 7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center mt-6"
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}
        >
          No account?{" "}
          <a
            href="/signup"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={handleAnchorEnter}
            onMouseLeave={handleAnchorLeave}
          >
            Create one
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #000 inset !important;
          -webkit-text-fill-color: white !important;
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}