'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/lib/AuthContext'
import { GoogleSignInButton } from '@/components/auth/social-auth/AuthButtonsGoogle'
import { TelegramSignIn } from '@/components/auth/social-auth/AuthButtonsTelegram'
import { useSearchParams } from 'next/navigation'

function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { detail?: string } } }).response
        if (res?.data?.detail) return res.data.detail
    }
    if (err instanceof Error) return err.message
    return 'Something went wrong. Please try again.'
}

export default function LoginPage() {
    const router = useRouter()
    const { refresh } = useAuth()

    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    const searchParams = useSearchParams()
    const redirectFromQuery = searchParams.get('redirect')
    const redirectFromStorage =
        typeof window !== 'undefined' ? sessionStorage.getItem('redirect_after_login') : null
    const redirect = redirectFromQuery || redirectFromStorage
    const [redirectPath, setRedirectPath] = useState<string | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        if (redirect && !redirectPath) setRedirectPath(redirect)
    }, [redirect, redirectPath])

    const login = async () => {
        setError(null)
        if (!identifier.trim()) return setError('Email, username or phone is required')
        if (!password) return setError('Password is required')
        setLoading(true)
        try {
            await authApi.login(identifier.trim(), password)
            await refresh()
            const safeRedirect = redirectPath?.startsWith('/') ? redirectPath : '/dashboard'
            router.replace(safeRedirect)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) login()
    }

    const onSocialSuccess = async () => {
        await refresh()
        const safeRedirect = redirectPath?.startsWith('/') ? redirectPath : '/dashboard'
        router.replace(safeRedirect)
    }

    return (
        <>
            <style>{`
                @keyframes lxFadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes lxCardPop {
                    0%   { opacity: 0; transform: scale(.94) translateY(18px); }
                    65%  { transform: scale(1.01) translateY(-1px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes lxShimmer {
                    0%   { transform: translateX(-130%); }
                    100% { transform: translateX(260%); }
                }
                @keyframes lxSpin {
                    to { transform: rotate(360deg); }
                }
                @keyframes lxShake {
                    0%,100% { transform: translateX(0); }
                    20%     { transform: translateX(-5px); }
                    40%     { transform: translateX(5px); }
                    60%     { transform: translateX(-3px); }
                    80%     { transform: translateX(3px); }
                }
                @keyframes lxPulse {
                    0%,100% { opacity: .5; transform: scale(1); }
                    50%     { opacity: .9; transform: scale(1.05); }
                }
                @keyframes lxGridIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                html, body { height: 100%; margin: 0; padding: 0; }
                *, *::before, *::after { box-sizing: border-box; }

                /* ── Root ── */
                .lx-root {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px 16px;
                    background: #eef0f8;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Grid bg ── */
                .lx-grid {
                    position: fixed; inset: 0; pointer-events: none; z-index: 0;
                    background-image:
                        linear-gradient(rgba(99,111,240,.07) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,111,240,.07) 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: lxGridIn 1s ease both .2s; opacity: 0;
                }
                .lx-grid::after {
                    content: '';
                    position: absolute; inset: 0;
                    background: radial-gradient(ellipse 80% 70% at 50% 50%,
                        rgba(238,240,248,0) 20%,
                        rgba(238,240,248,.7) 65%,
                        rgba(238,240,248,1) 100%);
                }

                /* ── Blobs ── */
                .lx-blob {
                    position: fixed; border-radius: 50%;
                    background: rgba(76,87,236,.12);
                    pointer-events: none; z-index: 0;
                    animation: lxPulse 14s ease-in-out infinite;
                }

                /* ── Back button ── */
                .lx-back {
                    position: fixed; top: 20px; left: 20px; z-index: 20;
                    display: flex; align-items: center; gap: 6px;
                    background: none; border: none; cursor: pointer;
                    font-size: 12px; font-weight: 500; color: #9ca3af;
                    padding: 6px 10px; border-radius: 8px;
                    transition: color .15s, background .15s, transform .15s;
                }
                .lx-back:hover {
                    color: #4c57ec;
                    background: rgba(76,87,236,.07);
                    transform: translateX(-2px);
                }
                .lx-back:active { transform: translateX(0) scale(.96); }

                /* ── Card ── */
                .lx-card {
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
                    animation: lxCardPop .6s cubic-bezier(.22,1,.36,1) both .15s;
                }
                @media (max-width: 520px) {
                    .lx-card { padding: 24px 18px 22px; border-radius: 20px; }
                }

                /* ── Card header ── */
                .lx-head {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 10px; margin-bottom: 22px;
                    animation: lxFadeUp .45s ease both .3s;
                }
                .lx-icon-wrap {
                    width: 56px; height: 56px; border-radius: 16px;
                    background: #eef2ff;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 14px rgba(99,102,241,.18);
                    transition: transform .25s ease, box-shadow .25s ease, background .2s;
                    cursor: default;
                }
                .lx-icon-wrap:hover {
                    transform: scale(1.1) rotate(-4deg);
                    box-shadow: 0 6px 22px rgba(99,102,241,.28);
                    background: #e0e7ff;
                }
                .lx-title {
                    font-size: 20px; font-weight: 700;
                    color: #0c1422; letter-spacing: -.3px; margin: 0;
                }
                .lx-sub {
                    font-size: 13px; color: #9ca3af; margin: 0;
                }

                /* ── Error ── */
                .lx-err-wrap {
                    overflow: hidden;
                    transition: max-height .3s ease, opacity .3s ease, margin-bottom .3s ease;
                }
                .lx-err {
                    display: flex; align-items: flex-start; gap: 8px;
                    background: #eef2ff; border: 1px solid rgba(99,111,240,.2);
                    border-radius: 12px; padding: 10px 13px;
                    animation: lxShake .36s ease;
                }
                .lx-err span { font-size: 12px; color: #4338ca; line-height: 1.5; }

                /* ── Fields ── */
                .lx-fields { display: flex; flex-direction: column; gap: 12px; }

                .lx-field { display: flex; flex-direction: column; gap: 5px; }
                .lx-field:nth-child(1) { animation: lxFadeUp .4s ease both .4s; }
                .lx-field:nth-child(2) { animation: lxFadeUp .4s ease both .48s; }

                .lx-lbl {
                    font-size: 10px; font-weight: 700; color: #6b7280;
                    text-transform: uppercase; letter-spacing: .55px;
                }
                .lx-fwrap {
                    position: relative;
                    transition: transform .15s cubic-bezier(.22,1,.36,1);
                }
                .lx-fwrap:focus-within { transform: translateY(-1px); }
                .lx-fwrap:focus-within .lx-ficon { color: #6366f1; }

                .lx-ficon {
                    position: absolute; left: 13px; top: 50%;
                    transform: translateY(-50%);
                    width: 15px; height: 15px;
                    color: #c5cedd; pointer-events: none;
                    transition: color .18s;
                }
                .lx-fi {
                    width: 100%;
                    border: 1.5px solid #e4e8f2;
                    border-radius: 12px;
                    padding: 12px 13px 12px 40px;
                    font-size: 13px; color: #0c1422;
                    background: #f7f8fd; outline: none;
                    -webkit-appearance: none;
                    transition: border-color .16s, box-shadow .16s, background .16s;
                }
                .lx-fi::placeholder { color: #bdc5d5; }
                .lx-fi:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99,102,241,.12), 0 0 14px rgba(99,102,241,.07);
                    background: #fff;
                }
                .lx-fi-pr { padding-right: 42px; }

                .lx-eye {
                    position: absolute; right: 12px; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    padding: 4px; color: #c5cedd; border-radius: 4px;
                    display: flex; align-items: center;
                    transition: color .13s, transform .13s;
                }
                .lx-eye:hover { color: #64748b; transform: translateY(-50%) scale(1.15); }
                .lx-eye:active { transform: translateY(-50%) scale(.9); }

                /* ── Row mid ── */
                .lx-row-mid {
                    display: flex; align-items: center; justify-content: space-between;
                    animation: lxFadeUp .4s ease both .54s;
                }
                .lx-rem {
                    display: flex; align-items: center; gap: 7px;
                    cursor: pointer; user-select: none;
                }
                .lx-chk {
                    width: 16px; height: 16px; border-radius: 5px;
                    border: 1.5px solid #dde1f0; background: #fff;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    transition: background .14s, border-color .14s, box-shadow .14s, transform .12s;
                }
                .lx-chk.on {
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    border-color: #4f46e5;
                    box-shadow: 0 2px 8px rgba(99,102,241,.35);
                }
                .lx-rem:hover .lx-chk { transform: scale(1.1); }
                .lx-rem:active .lx-chk { transform: scale(.92); }
                .lx-rem-txt { font-size: 12px; color: #64748b; }

                .lx-forgot {
                    font-size: 12px; font-weight: 600;
                    color: #6366f1; text-decoration: none;
                    position: relative;
                    transition: color .13s;
                }
                .lx-forgot::after {
                    content: ''; position: absolute;
                    bottom: -1px; left: 0; right: 0;
                    height: 1.5px; background: #6366f1;
                    transform: scaleX(0); transform-origin: left;
                    transition: transform .2s cubic-bezier(.22,1,.36,1);
                }
                .lx-forgot:hover::after { transform: scaleX(1); }
                .lx-forgot:hover { color: #4338ca; }

                /* ── Submit button ── */
                .lx-btn-wrap { animation: lxFadeUp .4s ease both .6s; }
                .lx-btn {
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
                .lx-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow:
                        0 8px 26px rgba(47,62,220,.44),
                        0 0 42px rgba(99,111,240,.26);
                }
                .lx-btn:active:not(:disabled) {
                    transform: translateY(0) scale(.98);
                    box-shadow: 0 3px 12px rgba(47,62,220,.26);
                }
                .lx-btn:disabled { opacity: .6; cursor: not-allowed; }

                .lx-btn-sh {
                    position: absolute; top: 0; bottom: 0; width: 45%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
                    animation: lxShimmer 2.8s linear infinite;
                    pointer-events: none;
                }
                .lx-spin { animation: lxSpin .75s linear infinite; }

                /* ── Divider ── */
                .lx-divider {
                    display: flex; align-items: center; gap: 10px;
                    animation: lxFadeUp .4s ease both .66s;
                }
                .lx-div-line { flex: 1; height: 1px; background: #eceff6; }
                .lx-div-txt { font-size: 11px; color: #c4c9d6; font-weight: 500; white-space: nowrap; }

                /* ── Social ── */
                .lx-social {
                    display: flex; flex-direction: column; gap: 9px;
                    animation: lxFadeUp .4s ease both .72s;
                }
                .lx-social-btn {
                    transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease;
                    border-radius: 12px;
                }
                .lx-social-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(0,0,0,.09);
                }
                .lx-social-btn:active {
                    transform: translateY(0) scale(.98);
                    box-shadow: none;
                }

                /* ── Register ── */
                .lx-register {
                    text-align: center;
                    animation: lxFadeUp .4s ease both .78s;
                }
                .lx-register p { font-size: 13px; color: #9ca3af; }
                .lx-register a {
                    color: #6366f1; font-weight: 600; text-decoration: none;
                    position: relative;
                    transition: color .13s;
                }
                .lx-register a::after {
                    content: ''; position: absolute;
                    bottom: -1px; left: 0; right: 0;
                    height: 1.5px; background: #6366f1;
                    transform: scaleX(0); transform-origin: left;
                    transition: transform .2s cubic-bezier(.22,1,.36,1);
                }
                .lx-register a:hover { color: #4338ca; }
                .lx-register a:hover::after { transform: scaleX(1); }
            `}</style>

            <div className="lx-root">

                {/* Grid */}
                <div className="lx-grid" />

                {/* Blobs */}
                <div className="lx-blob" style={{ width: 320, height: 320, top: -80, right: -80, animationDuration: '14s', opacity: .4 }} />
                <div className="lx-blob" style={{ width: 200, height: 200, bottom: 20, left: -60, animationDuration: '18s', animationDelay: '3s', opacity: .28 }} />
                <div className="lx-blob" style={{ width: 120, height: 120, bottom: 160, right: 40, animationDuration: '11s', animationDelay: '1.5s', opacity: .2 }} />

                {/* Back */}
                <button className="lx-back" onClick={() => router.back()}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 3L5 8l5 5" />
                    </svg>
                    Back
                </button>

                {/* Card */}
                <div
                    className="lx-card"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transition: 'opacity .3s ease',
                    }}
                >
                    {/* Header */}
                    <div className="lx-head">
                        <div className="lx-icon-wrap">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                                    fill="#6366f1"
                                />
                            </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h1 className="lx-title">Welcome back</h1>
                            <p className="lx-sub" style={{ marginTop: 4 }}>Sign in to continue learning</p>
                        </div>
                    </div>

                    {/* Error */}
                    <div
                        className="lx-err-wrap"
                        style={{
                            maxHeight: error ? '80px' : '0px',
                            opacity: error ? 1 : 0,
                            marginBottom: error ? '16px' : '0px',
                        }}
                    >
                        <div className="lx-err">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#4338ca" strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                <circle cx="8" cy="8" r="6" />
                                <path d="M8 5v3M8 10.5v.5" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="lx-fields" onKeyDown={onKeyDown} style={{ marginBottom: 14 }}>

                        {/* Identifier */}
                        <div className="lx-field">
                            <label className="lx-lbl">Email / Username / Phone</label>
                            <div className="lx-fwrap">
                                <svg className="lx-ficon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                                    <path d="M1.5 6l6.5 4 6.5-4" />
                                </svg>
                                <input
                                    className="lx-fi"
                                    placeholder="Enter email, username or phone"
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="lx-field">
                            <label className="lx-lbl">Password</label>
                            <div className="lx-fwrap">
                                <svg className="lx-ficon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <rect x="3" y="7" width="10" height="7" rx="1.5" />
                                    <path d="M5 7V5a3 3 0 016 0v2" />
                                </svg>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="lx-fi lx-fi-pr"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="lx-eye"
                                    onClick={() => setShowPass(s => !s)}
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                >
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
                        </div>

                        {/* Remember + Forgot */}
                        <div className="lx-row-mid">
                            <label className="lx-rem">
                                <div className="lx-chk on">
                                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="lx-rem-txt">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="lx-forgot">Forgot password?</Link>
                        </div>

                        {/* Submit */}
                        <div className="lx-btn-wrap">
                            <button className="lx-btn" onClick={login} disabled={loading}>
                                <div className="lx-btn-sh" />
                                {loading ? (
                                    <>
                                        <svg className="lx-spin" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2">
                                            <circle cx="8" cy="8" r="6" />
                                            <path d="M8 2a6 6 0 016 6" stroke="white" strokeLinecap="round" />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                            <path d="M3 8h10M9 4l4 4-4 4" />
                                        </svg>
                                        Sign in
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="lx-divider" style={{ marginBottom: 12 }}>
                        <div className="lx-div-line" />
                        <span className="lx-div-txt">or continue with</span>
                        <div className="lx-div-line" />
                    </div>

                    {/* Social */}
                    <div className="lx-social" style={{ marginBottom: 20 }}>
                        <div className="lx-social-btn">
                            <GoogleSignInButton onSuccess={onSocialSuccess} onError={setError} />
                        </div>
                        <div className="lx-social-btn">
                            <TelegramSignIn onSuccess={onSocialSuccess} onError={setError} />
                        </div>
                    </div>

                    {/* Register */}
                    <div className="lx-register">
                        <p>
                            Don&apos;t have an account?{' '}
                            <Link href="/register">Create one</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}