"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from '@/lib/api/auth'
import { useAdminAuth } from "@/lib/AdminAuthContext"

/* ─────────────────────────────────────────────────────────────
   SETUP
   1. Copy "world-map-white.svg" to your /public folder
   2. Copy "logo-transparent.png" to your /public folder
   3. npm i lucide-react  (if not already installed)
   4. Place this file at:  app/(admin)/admin/login/page.tsx
───────────────────────────────────────────────────────────── */

// ── Floating particle config: [cx, cy, r, duration, delay]
const PARTICLES: [number, number, number, string, string][] = [
    [44, 615, 2.8, "11s", "0s"],
    [136, 640, 3.2, "14s", "1.8s"],
    [232, 660, 2.4, "10s", "3.5s"],
    [318, 628, 3.6, "15s", ".9s"],
    [96, 648, 2.6, "12s", "2.6s"],
    [278, 672, 2.9, "9s", "5s"],
    [370, 608, 2.4, "10s", "4s"],
    [162, 656, 3.0, "13s", "1.4s"],
]

/* ═══════════════════════════════════════════════════════════
   LEFT PANEL – SVG BACKGROUND
═══════════════════════════════════════════════════════════ */
function LeftBG() {
    return (
        <svg
            viewBox="0 0 400 820"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                {/* World map fade mask — fade edges only, keep center bright */}
                <radialGradient id="mfade" cx="50%" cy="44%" r="55%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="65%" stopColor="white" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="mmask">
                    <rect width="400" height="820" fill="url(#mfade)" />
                </mask>

                <radialGradient id="ringglow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(160,175,255,0.35)" />
                    <stop offset="100%" stopColor="rgba(160,175,255,0)" />
                </radialGradient>

                {/* Pure white filter — removes all color, renders map as white */}
                <filter id="whiteFilter" colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1
                                0 0 0 0 1
                                0 0 0 0 1
                                0 0 0 1 0"
                    />
                </filter>
            </defs>

            {/* World Map – pure white */}
            <g mask="url(#mmask)" style={{ opacity: 0.55 }}>
                <image
                    href="/world-map-white.svg"
                    x="-8"
                    y="70"
                    width="416"
                    height="310"
                    preserveAspectRatio="xMidYMid meet"
                    filter="url(#whiteFilter)"
                />
            </g>

            {/* City glow dots */}
            <circle cx="196" cy="168" r="4" fill="rgba(200,210,255,0.7)" className="l-d1" />
            <circle cx="264" cy="182" r="3.5" fill="rgba(200,210,255,0.55)" className="l-d2" style={{ animationDelay: ".6s" }} />
            <circle cx="90" cy="188" r="3.5" fill="rgba(200,210,255,0.55)" className="l-d1" style={{ animationDelay: "1.1s" }} />
            <circle cx="336" cy="178" r="3" fill="rgba(200,210,255,0.5)" className="l-d2" style={{ animationDelay: "1.6s" }} />
            <circle cx="326" cy="358" r="3" fill="rgba(200,210,255,0.42)" className="l-d1" style={{ animationDelay: "2s" }} />
            <circle cx="112" cy="345" r="2.5" fill="rgba(200,210,255,0.42)" className="l-d2" style={{ animationDelay: "2.4s" }} />

            {/* Connection lines */}
            <line x1="90" y1="188" x2="196" y2="168" stroke="rgba(200,210,255,0.14)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="196" y1="168" x2="264" y2="182" stroke="rgba(200,210,255,0.14)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="264" y1="182" x2="336" y2="178" stroke="rgba(200,210,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="196" y1="168" x2="112" y2="345" stroke="rgba(200,210,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="336" y1="178" x2="326" y2="358" stroke="rgba(200,210,255,0.07)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Glow + rings – top right */}
            <circle cx="380" cy="-10" r="180" fill="url(#ringglow)" className="l-rgrow" />
            <circle cx="380" cy="-10" r="148" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" className="l-r1" />
            <circle cx="380" cy="-10" r="112" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" className="l-r1" style={{ animationDelay: ".3s" }} />
            <circle cx="380" cy="-10" r="78" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" className="l-r1" style={{ animationDelay: ".5s" }} />

            {/* Rings – bottom left */}
            <circle cx="18" cy="800" r="130" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" className="l-r2" />
            <circle cx="18" cy="800" r="95" stroke="rgba(255,255,255,0.055)" strokeWidth="1" fill="none" className="l-r2" style={{ animationDelay: ".4s" }} />
            <circle cx="18" cy="800" r="60" stroke="rgba(255,255,255,0.035)" strokeWidth="1" fill="none" className="l-r2" style={{ animationDelay: ".7s" }} />

            {/* Plus accents */}
            <line x1="200" y1="126" x2="200" y2="138" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="194" y1="132" x2="206" y2="132" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="76" y1="290" x2="76" y2="298" stroke="rgba(255,255,255,0.18)" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="72" y1="294" x2="80" y2="294" stroke="rgba(255,255,255,0.18)" strokeWidth="1.3" strokeLinecap="round" />

            {/* Bottom waves */}
            <path className="l-wv" d="M0 660 Q48 630 122 654 Q210 680 294 638 Q356 606 400 626 L400 820 L0 820 Z" fill="rgba(255,255,255,0.08)" />
            <path className="l-wv" d="M0 698 Q80 672 168 692 Q266 714 350 680 Q380 666 400 680 L400 820 L0 820 Z" fill="rgba(255,255,255,0.055)" style={{ animationDelay: ".4s" }} />
            <path className="l-wv" d="M0 736 Q98 718 196 734 Q294 752 378 726 L400 820 L0 820 Z" fill="rgba(255,255,255,0.036)" style={{ animationDelay: ".8s" }} />

            {/* Floating particles */}
            {PARTICLES.map(([cx, cy, r, dur, del], i) => (
                <circle
                    key={i}
                    cx={cx} cy={cy} r={r}
                    fill="rgba(255,255,255,0.2)"
                    className="l-pt"
                    style={{ animationDuration: dur, animationDelay: del }}
                />
            ))}
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD MOCKUP (inside left panel)
═══════════════════════════════════════════════════════════ */
function DashMock() {
    return (
        <div className="dm">
            <div className="dm-chrome">
                <span className="dm-dot r" /><span className="dm-dot y" /><span className="dm-dot g" />
                <div className="dm-tabs">
                    <div className="dm-tab on" /><div className="dm-tab" /><div className="dm-tab" />
                </div>
            </div>
            <div className="dm-body">
                <div className="dm-sb">
                    <div className="dm-sb-av" />
                    {[68, 52, 78, 60, 70].map((w, i) => (
                        <div key={i} className="dm-sb-row">
                            <div className="dm-sb-ic" />
                            <div className="dm-sb-ln" style={{ width: `${w}%` }} />
                        </div>
                    ))}
                </div>
                <div className="dm-cnt">
                    <div className="dm-stats">
                        {[50, 62, 44].map((w, i) => (
                            <div key={i} className="dm-stat">
                                <div className="dm-st-l" />
                                <div className="dm-st-n" style={{ width: `${w}%` }} />
                                <div className="dm-st-s" />
                            </div>
                        ))}
                    </div>
                    <div className="dm-charts">
                        <div className="dm-donut-w">
                            <svg viewBox="0 0 52 52" width="40" height="40">
                                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="7" />
                                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth="7"
                                    strokeDasharray="63 63" strokeLinecap="round"
                                    transform="rotate(-90 26 26)" className="dm-arc1" />
                                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="7"
                                    strokeDasharray="31 95" strokeDashoffset="-63"
                                    strokeLinecap="round" transform="rotate(-90 26 26)" className="dm-arc2" />
                            </svg>
                        </div>
                        <div className="dm-bars">
                            {[34, 56, 40, 78, 52, 68, 42, 86, 58, 72].map((h, i) => (
                                <div key={i} className="dm-bar" style={{
                                    height: `${h}%`,
                                    background: i % 2 === 0 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.14)",
                                    animationDelay: `${.88 + i * .04}s`,
                                }} />
                            ))}
                        </div>
                    </div>
                    <div className="dm-tbl">
                        {[{ w: 68, b: 13 }, { w: 52, b: 16 }, { w: 62, b: 12 }].map((r, i) => (
                            <div key={i} className="dm-tr">
                                <div className="dm-tr-dot" />
                                <div className="dm-tr-ln" style={{ width: `${r.w}%` }} />
                                <div className="dm-tr-bg" style={{ width: `${r.b}%` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   SHIELD ICON
═══════════════════════════════════════════════════════════ */
function ShieldIcon({ size = 10, color = "currentColor" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M8 2L3 4.5v4c0 2.8 2.1 5.2 5 5.8 2.9-.6 5-3 5-5.8v-4L8 2z" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════
   GOOGLE ICON
═══════════════════════════════════════════════════════════ */
function GoogleIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════
   BADGE
═══════════════════════════════════════════════════════════ */
function Badge({ variant = "light" }: { variant?: "light" | "dark" }) {
    const isDark = variant === "dark"
    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: isDark ? "rgba(255,255,255,0.12)" : "rgba(76,87,236,0.07)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(76,87,236,0.12)"}`,
                borderRadius: 100,
                padding: "3px 11px",
                backdropFilter: isDark ? "blur(8px)" : undefined,
                animation: "badgeBounce .48s cubic-bezier(.34,1.56,.64,1) both .82s",
            }}
        >
            <ShieldIcon size={10} color={isDark ? "#bfcfff" : "#4c57ec"} />
            <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: isDark ? "#d4e0ff" : "#4c57ec",
                letterSpacing: ".3px",
            }}>
                Admin Panel
            </span>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   LOGO COMPONENT — uses logo-transparent.png from /public
═══════════════════════════════════════════════════════════ */
function Logo({ size = 36, variant = "light" }: { size?: number; variant?: "light" | "dark" }) {
    return (
        <img
            src="/logo-transparent.png"
            alt="LEXIS Logo"
            width={size}
            height={size}
            style={{
                objectFit: "contain",
                /* On dark (left panel) — keep as-is or brighten.
                   On light (right panel) — add indigo shadow/glow */
                filter: variant === "dark"
                    ? "brightness(0) invert(1) drop-shadow(0 0 8px rgba(160,180,255,0.5))"
                    : "drop-shadow(0 2px 8px rgba(76,87,236,0.35)) drop-shadow(0 0 16px rgba(99,111,240,0.2))",
                borderRadius: 8,
            }}
        />
    )
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function AdminLoginPage() {
    const router = useRouter()

    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { login } = useAdminAuth()

    const handleLogin = async () => {
        setError(null)
        if (!identifier.trim()) return setError("Please enter your email address")
        if (!password) return setError("Please enter your password")
        setLoading(true)
        try {
            const user = await login(identifier.trim(), password)

            // ✅ Rol tekshiruvi — ADMIN emas bo'lsa, kirishni rad etish
            if (user?.role !== "ADMIN") {
                setError("Access denied. Admin privileges required.")
                // Tokenni tozalash (agar login() saqlagan bo'lsa)
                logout?.()
                return
            }

            router.replace("/admin/dashboard")
        } catch (err: any) {
            const detail = err?.response?.data?.detail
            const msg = typeof detail === "string"
                ? detail
                : err?.message ?? "Login failed"
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
html,body{height:100%;overflow:hidden;margin:0;padding:0}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Keyframes ── */
@keyframes floatUp{0%{transform:translateY(0);opacity:0}8%{opacity:.7}90%{opacity:.3}100%{transform:translateY(-650px);opacity:0}}
@keyframes rpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.06)}}
@keyframes dotbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes waveslide{0%,100%{transform:translateX(0)}50%{transform:translateX(-10px)}}
@keyframes pulseRing{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.05)}}
@keyframes bd1{0%,100%{transform:translate(0,0)}40%{transform:translate(2%,-3%)}}
@keyframes enterLeft{from{opacity:0;transform:translateX(-100%)}to{opacity:1;transform:translateX(0)}}
@keyframes enterRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes cardPop{0%{opacity:0;transform:scale(.92) translateY(20px)}65%{transform:scale(1.01) translateY(-1px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes badgeBounce{0%{opacity:0;transform:scale(.5) translateY(6px)}70%{transform:scale(1.08) translateY(-2px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes shimmer{0%{transform:translateX(-130%)}100%{transform:translateX(260%)}}
@keyframes spin360{to{transform:rotate(360deg)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes checkPop{0%{transform:scale(0) rotate(-25deg)}65%{transform:scale(1.3) rotate(5deg)}100%{transform:scale(1) rotate(0deg)}}
@keyframes gridFade{from{opacity:0}to{opacity:1}}
@keyframes arcDraw1{from{stroke-dasharray:0 126}to{stroke-dasharray:63 63}}
@keyframes arcDraw2{from{stroke-dasharray:0 126}to{stroke-dasharray:31 95}}
@keyframes barGrow{from{height:0!important;opacity:0}}
@keyframes logoGlow{0%,100%{filter:drop-shadow(0 2px 8px rgba(76,87,236,0.35)) drop-shadow(0 0 16px rgba(99,111,240,0.2))}50%{filter:drop-shadow(0 2px 12px rgba(76,87,236,0.55)) drop-shadow(0 0 28px rgba(99,111,240,0.35))}}
@keyframes logoPop{0%{opacity:0;transform:scale(0.6) rotate(-10deg)}65%{transform:scale(1.12) rotate(3deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}}

/* SVG animation classes */
.l-rgrow{animation:pulseRing 8s ease-in-out infinite;transform-origin:380px -10px}
.l-r1{animation:rpulse 6.5s ease-in-out infinite;transform-origin:380px -10px}
.l-r2{animation:rpulse 9s ease-in-out infinite;transform-origin:18px 800px}
.l-d1{animation:dotbob 6s ease-in-out infinite}
.l-d2{animation:dotbob 8s ease-in-out infinite}
.l-wv{animation:waveslide 13s ease-in-out infinite}
.l-pt{animation:floatUp linear infinite}
.dm-arc1{animation:arcDraw1 .8s cubic-bezier(.22,1,.36,1) both .95s}
.dm-arc2{animation:arcDraw2 .8s cubic-bezier(.22,1,.36,1) both 1.1s}
.dm-bar{animation:barGrow .6s cubic-bezier(.22,1,.36,1) both}

/* ── Layout ── */
.lx{font-family:'Sora',sans-serif;height:100vh;display:flex;overflow:hidden}

/* ══ LEFT PANEL ══ */
.lp{
  display:none;position:relative;overflow:hidden;
  flex-direction:column;justify-content:space-between;
  width:32%;flex-shrink:0;padding:28px 24px 22px;
  background:linear-gradient(155deg,#1a24b8 0%,#2a38d8 30%,#3f4eea 58%,#5462f0 80%,#6370f5 100%);
  animation:enterLeft .65s cubic-bezier(.22,1,.36,1) both;
}
@media(min-width:900px){.lp{display:flex}}

.lp-a{position:relative;z-index:2;animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both .55s}
.lp-b{position:relative;z-index:2;animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both .68s}
.lp-c{position:relative;z-index:2;animation:fadeUp .45s ease both 1s}
.lp-logo-wrap{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.lp-logo-txt{font-size:22px;font-weight:900;color:#fff;letter-spacing:-1.2px}
.lp-logo-txt b{color:#a0afff}
.lp-title{color:#fff;font-size:1.45rem;font-weight:800;line-height:1.22;letter-spacing:-.3px;margin-bottom:6px}
.lp-sub{color:rgba(192,210,255,.76);font-size:11px;line-height:1.65;max-width:200px;margin-bottom:18px}
.lp-c p{font-size:9.5px;color:rgba(165,188,255,.32)}

/* Dashboard mockup */
.dm{
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);
  border-radius:12px;padding:10px;backdrop-filter:blur(10px);
  box-shadow:0 16px 48px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.13);
}
.dm-chrome{display:flex;align-items:center;gap:4px;margin-bottom:8px}
.dm-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.dm-dot.r{background:rgba(255,255,255,.45)}.dm-dot.y{background:rgba(255,255,255,.28)}.dm-dot.g{background:rgba(255,255,255,.14)}
.dm-tabs{display:flex;gap:3px;margin-left:6px}
.dm-tab{height:4px;width:22px;border-radius:100px;background:rgba(255,255,255,.13)}
.dm-tab.on{background:rgba(255,255,255,.34);width:28px}
.dm-body{display:flex;gap:7px}
.dm-sb{width:36px;flex-shrink:0;display:flex;flex-direction:column;gap:4px}
.dm-sb-av{width:20px;height:20px;border-radius:6px;background:rgba(255,255,255,.26);margin-bottom:5px}
.dm-sb-row{height:11px;border-radius:3px;background:rgba(255,255,255,.1);display:flex;align-items:center;gap:2px;padding:0 2px}
.dm-sb-ic{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.32);flex-shrink:0}
.dm-sb-ln{height:3px;border-radius:100px;background:rgba(255,255,255,.2)}
.dm-cnt{flex:1;min-width:0}
.dm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:6px}
.dm-stat{border-radius:5px;padding:4px 3px;background:rgba(255,255,255,.07);display:flex;flex-direction:column;gap:2px}
.dm-st-l{height:2.5px;border-radius:100px;background:rgba(255,255,255,.24)}
.dm-st-n{height:6px;border-radius:100px;background:rgba(255,255,255,.46);margin:1px 0}
.dm-st-s{height:2.5px;border-radius:100px;background:rgba(255,255,255,.14)}
.dm-charts{display:flex;gap:6px;height:40px;margin-bottom:5px}
.dm-donut-w{width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.dm-bars{flex:1;display:flex;align-items:flex-end;gap:1.5px}
.dm-bar{flex:1;border-radius:2px 2px 0 0}
.dm-tbl{display:flex;flex-direction:column;gap:3px}
.dm-tr{display:flex;align-items:center;gap:4px;height:8px}
.dm-tr-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.32);flex-shrink:0}
.dm-tr-ln{height:3px;border-radius:100px;background:rgba(255,255,255,.18);flex:1}
.dm-tr-bg{height:6px;border-radius:2px;background:rgba(255,255,255,.12);flex-shrink:0}

/* ══ RIGHT PANEL ══ */
.rp{
  flex:1;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  background:#eef0f8;padding:24px 18px;
  position:relative;overflow:hidden;height:100vh;
  animation:enterRight .65s cubic-bezier(.22,1,.36,1) both;
}
.rp-grid{
  position:absolute;inset:0;
  background-image:linear-gradient(rgba(99,111,240,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,111,240,.07) 1px,transparent 1px);
  background-size:40px 40px;
  animation:gridFade 1s ease both .3s;opacity:0;
}
.rp-grid::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 70% 60% at 65% 42%,rgba(238,240,248,0) 30%,rgba(238,240,248,.85) 70%,rgba(238,240,248,1) 100%);
}
.rp-blob{position:absolute;border-radius:50%;background:rgba(76,87,236,.13);animation:bd1 14s ease-in-out infinite}

/* Mobile logo */
.mob-logo{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:18px;position:relative;z-index:2;animation:fadeUp .48s ease both .36s}
@media(min-width:900px){.mob-logo{display:none}}

/* Card */
.card{
  width:100%;max-width:420px;background:#fff;border-radius:22px;
  padding:28px 30px 24px;
  box-shadow:
    0 0 0 1px rgba(90,99,240,.08),
    0 4px 8px rgba(0,0,0,.04),
    0 12px 28px rgba(90,99,240,.12),
    0 28px 60px rgba(90,99,240,.08),
    0 0 80px rgba(99,111,240,.06);
  position:relative;z-index:2;
  animation:cardPop .65s cubic-bezier(.22,1,.36,1) both .24s;
}
@media(max-width:480px){.card{padding:20px 14px 18px;border-radius:18px;max-width:100%}}

/* Card top — logo + badge centered */
.card-top{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:16px;animation:fadeUp .45s ease both .48s}

/* Logo wrapper — indigo glow on white bg */
.logo-glow-wrap{
  display:flex;align-items:center;justify-content:center;
  width:64px;height:64px;border-radius:16px;
  background:#fff;
  box-shadow:
    0 0 0 1px rgba(99,111,240,.12),
    0 4px 16px rgba(76,87,236,.22),
    0 8px 32px rgba(99,111,240,.16),
    0 0 48px rgba(99,111,240,.1);
  animation:logoPop .55s cubic-bezier(.34,1.56,.64,1) both .4s;
  transition:box-shadow .25s ease;
}
.logo-glow-wrap:hover{
  box-shadow:
    0 0 0 1px rgba(99,111,240,.18),
    0 4px 20px rgba(76,87,236,.32),
    0 12px 40px rgba(99,111,240,.24),
    0 0 60px rgba(99,111,240,.18);
}

/* Logo glow animation on card */
.logo-glow-wrap img{animation:logoGlow 4s ease-in-out infinite .5s}

.card-hd{text-align:center;margin-bottom:20px;animation:fadeUp .45s ease both .54s}
.card-hd h1{font-size:18px;font-weight:800;color:#0c1422;letter-spacing:-.25px;margin-bottom:3px}
.card-hd p{font-size:12px;color:#9ca3af}

/* Error */
.err{
  display:flex;align-items:center;gap:7px;
  background:#fef2f2;border:1px solid #fecaca;
  border-radius:10px;padding:9px 11px;
  margin-bottom:13px;animation:shake .36s ease;
}
.err span{font-size:11px;color:#dc2626;line-height:1.4}

/* Fields */
.fields{display:flex;flex-direction:column;gap:11px}
.field{display:flex;flex-direction:column;gap:4px;animation:fadeUp .42s ease both}
.field:nth-child(1){animation-delay:.6s}.field:nth-child(2){animation-delay:.68s}
.flbl{font-size:9.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.55px}
.fwrap{position:relative;transition:transform .13s ease}
.fwrap:focus-within{transform:translateY(-1px)}
.fwrap:focus-within .fi-icon{color:#4c57ec}
.fi-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:#c5cedd;pointer-events:none;transition:color .18s}
.fi{
  width:100%;border:1.5px solid #e4e8f2;border-radius:11px;
  padding:11px 12px 11px 38px;font-size:13px;font-family:inherit;
  color:#0c1422;background:#f7f8fd;outline:none;-webkit-appearance:none;
  transition:border-color .16s,box-shadow .16s,background .16s;
}
.fi::placeholder{color:#bdc5d5}
.fi:focus{
  border-color:#6366f1;
  box-shadow:0 0 0 3px rgba(99,102,241,.12),0 0 12px rgba(99,102,241,.08);
  background:#fff;
}
.fi-rpad{padding-right:40px}
.eye-btn{
  position:absolute;right:11px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;padding:3px;color:#c5cedd;
  transition:color .13s;display:flex;align-items:center;border-radius:4px;
}
.eye-btn:hover{color:#64748b}

.row-mid{display:flex;align-items:center;justify-content:space-between;animation:fadeUp .42s ease both .74s}
.rem-lbl{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none}
.chk{
  width:15px;height:15px;border-radius:4px;
  border:1.5px solid #dde1f0;background:#fff;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:background .13s,border-color .13s;
}
.chk.on{
  background:linear-gradient(135deg,#4f46e5,#6366f1);
  border-color:#4f46e5;
  box-shadow:0 2px 8px rgba(99,102,241,.35);
}
.chk.on svg{animation:checkPop .2s ease}
.rem-txt{font-size:11.5px;color:#64748b}
.forgot{font-size:11.5px;color:#4c57ec;font-weight:600;background:none;border:none;cursor:pointer;font-family:inherit;padding:0;transition:color .13s}
.forgot:hover{color:#2f3bc0}

.btn-w{animation:fadeUp .42s ease both .8s}
.sign-btn{
  width:100%;display:flex;align-items:center;justify-content:center;gap:7px;
  padding:13px 16px;border-radius:12px;border:none;cursor:pointer;
  font-size:13px;font-weight:700;font-family:inherit;color:#fff;
  background:linear-gradient(135deg,#2f3edc 0%,#4a55ee 45%,#5862f3 100%);
  box-shadow:
    0 5px 20px rgba(47,62,220,.38),
    0 2px 5px rgba(47,62,220,.16),
    0 0 32px rgba(99,111,240,.2);
  position:relative;overflow:hidden;
  transition:transform .12s,box-shadow .12s;
}
.sign-btn:hover:not(:disabled){
  transform:translateY(-2px);
  box-shadow:
    0 8px 26px rgba(47,62,220,.44),
    0 0 40px rgba(99,111,240,.28);
}
.sign-btn:active:not(:disabled){transform:translateY(0);box-shadow:0 3px 12px rgba(47,62,220,.26)}
.sign-btn:disabled{opacity:.62;cursor:not-allowed}
.btn-sh{position:absolute;top:0;bottom:0;width:42%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:shimmer 2.6s linear infinite;pointer-events:none}
.spin{animation:spin360 .75s linear infinite}

.divider{display:flex;align-items:center;gap:8px;animation:fadeUp .42s ease both .86s}
.div-l{flex:1;height:1px;background:#eceff6}
.div-t{font-size:10.5px;color:#c4c9d6;font-weight:500}

.sso-w{animation:fadeUp .42s ease both .9s;display:flex;flex-direction:column;gap:7px}
.sso-btn,.google-btn{
  width:100%;display:flex;align-items:center;justify-content:center;gap:7px;
  padding:11px 16px;border-radius:11px;border:1.5px solid #e4e8f2;
  cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;
  color:#374151;background:#fff;
  transition:background .13s,border-color .13s,transform .11s;
}
.sso-btn:hover,.google-btn:hover{background:#f4f5ff;border-color:#cdd0ee;transform:translateY(-1px)}

.card-ft{margin-top:16px;text-align:center;animation:fadeUp .42s ease both .96s}
.card-ft p{font-size:11px;color:#9ca3af}
.card-ft a{color:#4c57ec;font-weight:600;text-decoration:none}
.card-ft a:hover{color:#2f3bc0;text-decoration:underline}

.page-ft{position:absolute;bottom:12px;font-size:10px;color:#c0c6d4;z-index:2;animation:fadeUp .48s ease both 1.05s}

@media(max-width:600px){
  .rp{padding:18px 10px;justify-content:flex-start;padding-top:28px}
  .fi{font-size:16px}
  .sign-btn{font-size:14px;padding:14px 16px}
}
      `}</style>

            <div className="lx">

                {/* ══ LEFT PANEL ══ */}
                <div className="lp">
                    <LeftBG />

                    <div className="lp-a">
                        {/* Logo + text side by side */}
                        <div className="lp-logo-wrap">
                            <Logo size={36} variant="dark" />
                            <span className="lp-logo-txt">LEX<b>IS</b></span>
                        </div>
                        <Badge variant="dark" />
                    </div>

                    <div className="lp-b">
                        <h2 className="lp-title">Welcome<br />back!</h2>
                        <p className="lp-sub">Sign in to manage your platform securely.</p>
                        <DashMock />
                    </div>

                    <div className="lp-c">
                        <p>© 2025 LEXIS. All rights reserved.</p>
                    </div>
                </div>

                {/* ══ RIGHT PANEL ══ */}
                <div className="rp">
                    {/* Grid background */}
                    <div className="rp-grid" />

                    {/* Decorative blobs */}
                    <div className="rp-blob" style={{ width: 260, height: 260, top: -60, right: -60, animationDuration: "14s", opacity: .5 }} />
                    <div className="rp-blob" style={{ width: 180, height: 180, bottom: 40, left: -40, animationDuration: "18s", animationDelay: "3s", opacity: .35 }} />
                    <div className="rp-blob" style={{ width: 100, height: 100, bottom: 160, right: 60, animationDuration: "12s", animationDelay: "1.5s", opacity: .25 }} />

                    {/* Scattered grid accent dots */}
                    {[
                        { top: "18%", left: "8%", s: 6, delay: "0s", dur: "7s" },
                        { top: "28%", right: "12%", s: 8, delay: "1s", dur: "9s" },
                        { top: "65%", left: "14%", s: 5, delay: "2s", dur: "8s" },
                        { top: "72%", right: "18%", s: 7, delay: ".5s", dur: "11s" },
                        { top: "12%", left: "45%", s: 5, delay: "1.8s", dur: "10s" },
                        { bottom: "18%", left: "38%", s: 6, delay: "3.2s", dur: "8.5s" },
                    ].map((d, i) => (
                        <div key={i} style={{
                            position: "absolute",
                            width: d.s, height: d.s,
                            borderRadius: 2,
                            background: "rgba(76,87,236,.1)",
                            animation: `rpulse ${d.dur} ease-in-out infinite`,
                            animationDelay: d.delay,
                            zIndex: 1,
                            ...d,
                        }} />
                    ))}

                    {/* Mobile logo (hidden on desktop) */}
                    <div className="mob-logo">
                        <Logo size={48} variant="light" />
                        <Badge variant="light" />
                    </div>

                    {/* ── LOGIN CARD ── */}
                    <div className="card">

                        {/* Logo with indigo glow box */}
                        <div className="card-top">
                            <div className="logo-glow-wrap">
                                <Logo size={44} variant="light" />
                            </div>
                            <Badge variant="light" />
                        </div>

                        <div className="card-hd">
                            <h1>Welcome Admin</h1>
                            <p>Please sign in to continue</p>
                        </div>

                        {error && (
                            <div className="err">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0 }}>
                                    <circle cx="8" cy="8" r="6" /><path d="M8 5v3M8 10.5v.5" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="fields">

                            {/* Email */}
                            <div className="field">
                                <label className="flbl" htmlFor="admin-email">Email Address</label>
                                <div className="fwrap">
                                    <svg className="fi-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                                        <path d="M1.5 6l6.5 4 6.5-4" />
                                    </svg>
                                    <input
                                        id="admin-email"
                                        className="fi"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={identifier}
                                        onChange={e => setIdentifier(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                                        autoFocus
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="field">
                                <label className="flbl" htmlFor="admin-pass">Password</label>
                                <div className="fwrap">
                                    <svg className="fi-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <rect x="3" y="7" width="10" height="7" rx="1.5" />
                                        <path d="M5 7V5a3 3 0 016 0v2" />
                                    </svg>
                                    <input
                                        id="admin-pass"
                                        type={showPass ? "text" : "password"}
                                        className="fi fi-rpad"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() => setShowPass(s => !s)}
                                        aria-label={showPass ? "Hide password" : "Show password"}
                                    >
                                        {showPass ? (
                                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                                <path d="M2 2l12 12M6.5 6.6A3 3 0 0010.4 10M4.3 4.4A7 7 0 001 8s2.5 5 7 5a6.9 6.9 0 003.7-1.1" />
                                            </svg>
                                        ) : (
                                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me + Forgot */}
                            <div className="row-mid">
                                <label className="rem-lbl" onClick={() => setRememberMe(v => !v)}>
                                    <div className={`chk${rememberMe ? " on" : ""}`}>
                                        {rememberMe && (
                                            <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="rem-txt">Remember me</span>
                                </label>
                                <button type="button" className="forgot">Forgot password?</button>
                            </div>

                            {/* Sign In */}
                            <div className="btn-w">
                                <button onClick={handleLogin} disabled={loading} className="sign-btn">
                                    <div className="btn-sh" />
                                    {loading ? (
                                        <>
                                            <svg className="spin" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                                                <circle cx="8" cy="8" r="6" />
                                                <path d="M8 2a6 6 0 016 6" stroke="white" strokeLinecap="round" />
                                            </svg>
                                            Signing in…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                                <path d="M3 8h10M9 4l4 4-4 4" />
                                            </svg>
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="card-ft">
                            <p>Need help? <a href="#">Contact Super Admin</a></p>
                        </div>
                    </div>

                    <p className="page-ft">© 2026 LEXIS. All rights reserved.</p>
                </div>

            </div>
        </>
    )
}