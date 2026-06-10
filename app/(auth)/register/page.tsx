'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/lib/AuthContext'
import { GoogleSignInButton } from '@/components/auth/social-auth/AuthButtonsGoogle'
import { TelegramSignIn } from '@/components/auth/social-auth/AuthButtonsTelegram'

// =====================================================
// 🔐 PASSWORD STRENGTH
// =====================================================

type StrengthLevel = 'weak' | 'medium' | 'strong'

function getStrength(p: string): StrengthLevel {
    if (!p || p.length < 8) return 'weak'
    if (/^\d+$/.test(p) || /^[a-zA-Z]+$/.test(p)) return 'weak'
    if (['12345678', 'password', 'qwerty123'].includes(p.toLowerCase())) return 'weak'
    if (p.length >= 12 && /[A-Z]/.test(p) && /\d/.test(p)) return 'strong'
    return 'medium'
}

// =====================================================
// 🔧 UTILS
// =====================================================

function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { detail?: string } } }).response
        if (res?.data?.detail) return res.data.detail
    }
    if (err instanceof Error) return err.message
    return 'Registration failed. Please try again.'
}

type Form = {
    full_name: string
    username: string
    email: string
    password: string
    confirm: string
}

// =====================================================
// 📄 PAGE
// =====================================================

export default function RegisterPage() {
    const router = useRouter()
    const { refresh } = useAuth()

    const [form, setForm] = useState<Form>({
        full_name: '',
        username: '',
        email: '',
        password: '',
        confirm: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const set = (key: keyof Form, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    const suggestions = useMemo(() => {
        if (!form.full_name || form.username) return []
        const base = form.full_name
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '')
        return base ? [base, `${base}1`, `${base}_uz`] : []
    }, [form.full_name, form.username])

    const strength = form.password ? getStrength(form.password) : null
    const passwordsMatch = form.confirm.length > 0 && form.password === form.confirm

    const validate = (): string | null => {
        if (!form.full_name.trim()) return 'Full name is required'
        if (!form.username.trim()) return 'Username is required'
        if (!form.email.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email address'
        if (!form.password) return 'Password is required'
        if (getStrength(form.password) === 'weak') return 'Password is too weak — use 8+ chars with letters and numbers'
        if (form.password !== form.confirm) return 'Passwords do not match'
        return null
    }

    const register = async () => {
        setError(null)
        const err = validate()
        if (err) return setError(err)
        setLoading(true)
        try {
            await authApi.register({
                full_name: form.full_name.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            })
            await refresh()
            router.replace('/dashboard')
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const onSocialSuccess = async () => {
        await refresh()
        router.replace('/dashboard')
    }

    const strengthMeta = {
        weak: { label: 'Weak', color: '#6366f1', width: '33%' },
        medium: { label: 'Medium', color: '#eab308', width: '66%' },
        strong: { label: 'Strong', color: '#22c55e', width: '100%' },
    }

    return (
        <>
            <style>{`
                @keyframes rxFadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes rxCardPop {
                    0%   { opacity: 0; transform: scale(.94) translateY(18px); }
                    65%  { transform: scale(1.01) translateY(-1px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes rxShimmer {
                    0%   { transform: translateX(-130%); }
                    100% { transform: translateX(260%); }
                }
                @keyframes rxSpin {
                    to { transform: rotate(360deg); }
                }
                @keyframes rxShake {
                    0%,100% { transform: translateX(0); }
                    20%     { transform: translateX(-5px); }
                    40%     { transform: translateX(5px); }
                    60%     { transform: translateX(-3px); }
                    80%     { transform: translateX(3px); }
                }
                @keyframes rxPulse {
                    0%,100% { opacity: .5; transform: scale(1); }
                    50%     { opacity: .9; transform: scale(1.05); }
                }
                @keyframes rxGridIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes rxBarGrow {
                    from { width: 0 !important; opacity: 0; }
                }

                html, body { height: 100%; margin: 0; padding: 0; }
                *, *::before, *::after { box-sizing: border-box; }

                .rx-root {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 16px;
                    background: #eef0f8;
                    position: relative;
                    overflow: hidden;
                }

                .rx-grid {
                    position: fixed; inset: 0; pointer-events: none; z-index: 0;
                    background-image:
                        linear-gradient(rgba(99,111,240,.07) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,111,240,.07) 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: rxGridIn 1s ease both .2s; opacity: 0;
                }
                .rx-grid::after {
                    content: ''; position: absolute; inset: 0;
                    background: radial-gradient(ellipse 80% 70% at 50% 50%,
                        rgba(238,240,248,0) 20%,
                        rgba(238,240,248,.7) 65%,
                        rgba(238,240,248,1) 100%);
                }

                .rx-blob {
                    position: fixed; border-radius: 50%;
                    background: rgba(76,87,236,.12);
                    pointer-events: none; z-index: 0;
                    animation: rxPulse 14s ease-in-out infinite;
                }

                .rx-back {
                    position: fixed; top: 20px; left: 20px; z-index: 20;
                    display: flex; align-items: center; gap: 6px;
                    background: none; border: none; cursor: pointer;
                    font-size: 12px; font-weight: 500; color: #9ca3af;
                    padding: 6px 10px; border-radius: 8px;
                    transition: color .15s, background .15s, transform .15s;
                }
                .rx-back:hover {
                    color: #4c57ec;
                    background: rgba(76,87,236,.07);
                    transform: translateX(-2px);
                }
                .rx-back:active { transform: translateX(0) scale(.96); }

                .rx-card {
                    width: 100%; max-width: 430px;
                    background: #fff;
                    border-radius: 24px;
                    padding: 32px 34px 28px;
                    position: relative; z-index: 2;
                    box-shadow:
                        0 0 0 1px rgba(90,99,240,.08),
                        0 4px 8px rgba(0,0,0,.04),
                        0 12px 28px rgba(90,99,240,.11),
                        0 28px 60px rgba(90,99,240,.07);
                    animation: rxCardPop .6s cubic-bezier(.22,1,.36,1) both .15s;
                }
                @media (max-width: 520px) {
                    .rx-card { padding: 24px 18px 22px; border-radius: 20px; }
                }

                .rx-head {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 10px; margin-bottom: 22px;
                    animation: rxFadeUp .45s ease both .3s;
                }
                .rx-icon-wrap {
                    width: 56px; height: 56px; border-radius: 16px;
                    background: #eef2ff;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 14px rgba(99,102,241,.18);
                    transition: transform .25s ease, box-shadow .25s ease, background .2s;
                    cursor: default;
                }
                .rx-icon-wrap:hover {
                    transform: scale(1.1) rotate(-4deg);
                    box-shadow: 0 6px 22px rgba(99,102,241,.28);
                    background: #e0e7ff;
                }
                .rx-title {
                    font-size: 20px; font-weight: 700;
                    color: #0c1422; letter-spacing: -.3px; margin: 0;
                }
                .rx-sub { font-size: 13px; color: #9ca3af; margin: 0; }

                .rx-err-wrap {
                    overflow: hidden;
                    transition: max-height .3s ease, opacity .3s ease, margin-bottom .3s ease;
                }
                .rx-err {
                    display: flex; align-items: flex-start; gap: 8px;
                    background: #eef2ff; border: 1px solid rgba(99,111,240,.2);
                    border-radius: 12px; padding: 10px 13px;
                    animation: rxShake .36s ease;
                }
                .rx-err span { font-size: 12px; color: #4338ca; line-height: 1.5; }

                .rx-fields { display: flex; flex-direction: column; gap: 12px; }

                .rx-field { display: flex; flex-direction: column; gap: 5px; }
                .rx-field:nth-child(1) { animation: rxFadeUp .4s ease both .38s; }
                .rx-field:nth-child(2) { animation: rxFadeUp .4s ease both .44s; }
                .rx-field:nth-child(3) { animation: rxFadeUp .4s ease both .50s; }
                .rx-field:nth-child(4) { animation: rxFadeUp .4s ease both .56s; }
                .rx-field:nth-child(5) { animation: rxFadeUp .4s ease both .62s; }

                .rx-lbl {
                    font-size: 10px; font-weight: 700; color: #6b7280;
                    text-transform: uppercase; letter-spacing: .55px;
                }
                .rx-fwrap {
                    position: relative;
                    transition: transform .15s cubic-bezier(.22,1,.36,1);
                }
                .rx-fwrap:focus-within { transform: translateY(-1px); }
                .rx-fwrap:focus-within .rx-ficon { color: #6366f1; }

                .rx-ficon {
                    position: absolute; left: 13px; top: 50%;
                    transform: translateY(-50%);
                    width: 15px; height: 15px;
                    color: #c5cedd; pointer-events: none;
                    transition: color .18s;
                }
                .rx-fi {
                    width: 100%;
                    border: 1.5px solid #e4e8f2;
                    border-radius: 12px;
                    padding: 12px 13px 12px 40px;
                    font-size: 13px; color: #0c1422;
                    background: #f7f8fd; outline: none;
                    -webkit-appearance: none;
                    transition: border-color .16s, box-shadow .16s, background .16s;
                }
                .rx-fi::placeholder { color: #bdc5d5; }
                .rx-fi:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99,102,241,.12), 0 0 14px rgba(99,102,241,.07);
                    background: #fff;
                }
                .rx-fi-pr { padding-right: 42px; }

                .rx-eye {
                    position: absolute; right: 12px; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    padding: 4px; color: #c5cedd; border-radius: 4px;
                    display: flex; align-items: center;
                    transition: color .13s, transform .13s;
                }
                .rx-eye:hover { color: #64748b; transform: translateY(-50%) scale(1.15); }
                .rx-eye:active { transform: translateY(-50%) scale(.9); }

                /* Username suggestions */
                .rx-suggestions {
                    display: flex; flex-wrap: wrap; gap: 6px;
                    animation: rxFadeUp .3s ease both;
                }
                .rx-sug-btn {
                    padding: 4px 10px;
                    font-size: 11px; color: #6b7280;
                    background: #f7f8fd;
                    border: 1.5px solid #e4e8f2;
                    border-radius: 8px; cursor: pointer;
                    transition: border-color .15s, color .15s, transform .12s, background .15s;
                }
                .rx-sug-btn:hover {
                    border-color: #6366f1; color: #6366f1;
                    background: #eef2ff; transform: translateY(-1px);
                }
                .rx-sug-btn:active { transform: translateY(0) scale(.96); }

                /* Strength bar */
                .rx-strength { display: flex; flex-direction: column; gap: 5px; }
                .rx-strength-track {
                    height: 5px; background: #f0f1f6; border-radius: 100px; overflow: hidden;
                }
                .rx-strength-bar {
                    height: 100%; border-radius: 100px;
                    transition: width .4s cubic-bezier(.22,1,.36,1), background .3s;
                    animation: rxBarGrow .5s cubic-bezier(.22,1,.36,1) both;
                }
                .rx-strength-lbl { font-size: 11px; font-weight: 500; }

                /* Match indicator */
                .rx-match {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 11px; font-weight: 500;
                    animation: rxFadeUp .25s ease both;
                }

                /* Submit */
                .rx-btn-wrap { animation: rxFadeUp .4s ease both .68s; }
                .rx-btn {
                    width: 100%;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 14px 16px;
                    border-radius: 13px; border: none; cursor: pointer;
                    font-size: 13.5px; font-weight: 700; color: #fff;
                    background: linear-gradient(135deg, #2f3edc 0%, #4a55ee 45%, #5862f3 100%);
                    box-shadow:
                        0 5px 20px rgba(47,62,220,.38),
                        0 2px 5px rgba(47,62,220,.16),
                        0 0 32px rgba(99,111,240,.18);
                    position: relative; overflow: hidden;
                    transition: transform .15s, box-shadow .15s;
                }
                .rx-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 26px rgba(47,62,220,.44), 0 0 42px rgba(99,111,240,.26);
                }
                .rx-btn:active:not(:disabled) {
                    transform: translateY(0) scale(.98);
                    box-shadow: 0 3px 12px rgba(47,62,220,.26);
                }
                .rx-btn:disabled { opacity: .6; cursor: not-allowed; }
                .rx-btn-sh {
                    position: absolute; top: 0; bottom: 0; width: 45%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
                    animation: rxShimmer 2.8s linear infinite;
                    pointer-events: none;
                }
                .rx-spin { animation: rxSpin .75s linear infinite; }

                .rx-divider {
                    display: flex; align-items: center; gap: 10px;
                    animation: rxFadeUp .4s ease both .74s;
                }
                .rx-div-line { flex: 1; height: 1px; background: #eceff6; }
                .rx-div-txt { font-size: 11px; color: #c4c9d6; font-weight: 500; white-space: nowrap; }

                .rx-social {
                    display: flex; flex-direction: column; gap: 9px;
                    animation: rxFadeUp .4s ease both .8s;
                }
                .rx-social-btn {
                    transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease;
                    border-radius: 12px;
                }
                .rx-social-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(0,0,0,.09);
                }
                .rx-social-btn:active { transform: translateY(0) scale(.98); box-shadow: none; }

                .rx-login {
                    text-align: center;
                    animation: rxFadeUp .4s ease both .86s;
                }
                .rx-login p { font-size: 13px; color: #9ca3af; }
                .rx-login a {
                    color: #6366f1; font-weight: 600; text-decoration: none;
                    position: relative; transition: color .13s;
                }
                .rx-login a::after {
                    content: ''; position: absolute;
                    bottom: -1px; left: 0; right: 0;
                    height: 1.5px; background: #6366f1;
                    transform: scaleX(0); transform-origin: left;
                    transition: transform .2s cubic-bezier(.22,1,.36,1);
                }
                .rx-login a:hover { color: #4338ca; }
                .rx-login a:hover::after { transform: scaleX(1); }
            `}</style>

            <div className="rx-root">
                <div className="rx-grid" />

                {/* Blobs */}
                <div className="rx-blob" style={{ width: 320, height: 320, top: -80, right: -80, animationDuration: '14s', opacity: .4 }} />
                <div className="rx-blob" style={{ width: 200, height: 200, bottom: 20, left: -60, animationDuration: '18s', animationDelay: '3s', opacity: .28 }} />
                <div className="rx-blob" style={{ width: 120, height: 120, bottom: 160, right: 40, animationDuration: '11s', animationDelay: '1.5s', opacity: .2 }} />

                {/* Back */}
                <button className="rx-back" onClick={() => router.back()}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 3L5 8l5 5" />
                    </svg>
                    Back
                </button>

                {/* Card */}
                <div className="rx-card">

                    {/* Header */}
                    <div className="rx-head">
                        <div className="rx-icon-wrap">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                <path d="M15 12c2.7 0 4.8-2.1 4.8-4.8S17.7 2.4 15 2.4s-4.8 2.1-4.8 4.8S12.3 12 15 12zm-9.6 0C7.8 12 9.6 10.2 9.6 7.8S7.8 3.6 5.4 3.6 1.2 5.4 1.2 7.8 3 12 5.4 12zm0 2.4C2.4 14.4 0 15.6 0 18v1.2h10.8V18c0-2.4-2.4-3.6-5.4-3.6zm9.6 0c-3 0-9 1.5-9 4.8v1.2H24V19.2c0-3.3-6-4.8-9-4.8z" fill="#6366f1" />
                            </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h1 className="rx-title">Create account</h1>
                            <p className="rx-sub" style={{ marginTop: 4 }}>Start learning with us today</p>
                        </div>
                    </div>

                    {/* Error */}
                    <div
                        className="rx-err-wrap"
                        style={{
                            maxHeight: error ? '80px' : '0px',
                            opacity: error ? 1 : 0,
                            marginBottom: error ? '16px' : '0px',
                        }}
                    >
                        <div className="rx-err">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#4338ca" strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                <circle cx="8" cy="8" r="6" />
                                <path d="M8 5v3M8 10.5v.5" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="rx-fields" style={{ marginBottom: 14 }}>

                        {/* Full name */}
                        <div className="rx-field">
                            <label className="rx-lbl">Full name</label>
                            <div className="rx-fwrap">
                                <svg className="rx-ficon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <circle cx="8" cy="5" r="3" />
                                    <path d="M1.5 14c0-3 3-5 6.5-5s6.5 2 6.5 5" />
                                </svg>
                                <input
                                    className="rx-fi"
                                    placeholder="Enter your full name"
                                    value={form.full_name}
                                    onChange={e => set('full_name', e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="rx-field">
                            <label className="rx-lbl">Username</label>
                            <div className="rx-fwrap">
                                <svg className="rx-ficon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1z" />
                                    <path d="M10.5 8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10.5 8c0 1.5.5 2.5 1.5 2.5" />
                                </svg>
                                <input
                                    className="rx-fi"
                                    placeholder="Choose a username"
                                    value={form.username}
                                    onChange={e => set('username', e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                            {suggestions.length > 0 && (
                                <div className="rx-suggestions">
                                    {suggestions.map(s => (
                                        <button key={s} type="button" className="rx-sug-btn" onClick={() => set('username', s)}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="rx-field">
                            <label className="rx-lbl">Email address</label>
                            <div className="rx-fwrap">
                                <svg className="rx-ficon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                                    <path d="M1.5 6l6.5 4 6.5-4" />
                                </svg>
                                <input
                                    type="email"
                                    className="rx-fi"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="rx-field">
                            <label className="rx-lbl">Password</label>
                            <div className="rx-fwrap">
                                <svg className="rx-ficon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <rect x="3" y="7" width="10" height="7" rx="1.5" />
                                    <path d="M5 7V5a3 3 0 016 0v2" />
                                </svg>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="rx-fi rx-fi-pr"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <button type="button" className="rx-eye" onClick={() => setShowPass(s => !s)} aria-label="Toggle password">
                                    {showPass ? (
                                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <path d="M2 2l12 12M6.5 6.6A3 3 0 0010.4 10M4.3 4.4A7 7 0 001 8s2.5 5 7 5a6.9 6.9 0 003.7-1.1" />
                                        </svg>
                                    ) : (
                                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                                            <circle cx="8" cy="8" r="2" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Strength */}
                            {strength && (
                                <div className="rx-strength">
                                    <div className="rx-strength-track">
                                        <div
                                            className="rx-strength-bar"
                                            style={{
                                                width: strengthMeta[strength].width,
                                                background: strengthMeta[strength].color,
                                            }}
                                        />
                                    </div>
                                    <span className="rx-strength-lbl" style={{ color: strengthMeta[strength].color }}>
                                        {strengthMeta[strength].label} password
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="rx-field">
                            <label className="rx-lbl">Confirm password</label>
                            <div className="rx-fwrap">
                                <svg className="rx-ficon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <rect x="3" y="7" width="10" height="7" rx="1.5" />
                                    <path d="M5 7V5a3 3 0 016 0v2" />
                                    <path d="M6 10.5l1.5 1.5 3-3" />
                                </svg>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    className="rx-fi rx-fi-pr"
                                    placeholder="Repeat your password"
                                    value={form.confirm}
                                    onChange={e => set('confirm', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <button type="button" className="rx-eye" onClick={() => setShowConfirm(s => !s)} aria-label="Toggle confirm password">
                                    {showConfirm ? (
                                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <path d="M2 2l12 12M6.5 6.6A3 3 0 0010.4 10M4.3 4.4A7 7 0 001 8s2.5 5 7 5a6.9 6.9 0 003.7-1.1" />
                                        </svg>
                                    ) : (
                                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                                            <circle cx="8" cy="8" r="2" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Match indicator */}
                            {form.confirm.length > 0 && (
                                <div className="rx-match" style={{ color: passwordsMatch ? '#16a34a' : '#6366f1' }}>
                                    {passwordsMatch ? (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
                                                <path d="M2 8l4 4 8-8" />
                                            </svg>
                                            Passwords match
                                        </>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                                                <path d="M3 3l10 10M13 3L3 13" />
                                            </svg>
                                            Passwords do not match
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="rx-btn-wrap">
                            <button className="rx-btn" onClick={register} disabled={loading}>
                                <div className="rx-btn-sh" />
                                {loading ? (
                                    <>
                                        <svg className="rx-spin" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2">
                                            <circle cx="8" cy="8" r="6" />
                                            <path d="M8 2a6 6 0 016 6" stroke="white" strokeLinecap="round" />
                                        </svg>
                                        Creating account…
                                    </>
                                ) : (
                                    <>
                                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                            <path d="M8 2v12M2 8h12" />
                                        </svg>
                                        Create account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="rx-divider" style={{ marginBottom: 12 }}>
                        <div className="rx-div-line" />
                        <span className="rx-div-txt">or continue with</span>
                        <div className="rx-div-line" />
                    </div>

                    {/* Social */}
                    <div className="rx-social" style={{ marginBottom: 20 }}>
                        <div className="rx-social-btn">
                            <GoogleSignInButton onSuccess={onSocialSuccess} onError={setError} />
                        </div>
                        <div className="rx-social-btn">
                            <TelegramSignIn onSuccess={onSocialSuccess} onError={setError} />
                        </div>
                    </div>

                    {/* Login link */}
                    <div className="rx-login">
                        <p>
                            Already have an account?{' '}
                            <Link href="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}