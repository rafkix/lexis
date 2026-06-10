'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'

// =====================================================
// 🔐 PASSWORD STRENGTH
// =====================================================

type StrengthLevel = 'weak' | 'medium' | 'strong'

function getStrength(p: string): StrengthLevel {
  if (!p || p.length < 8) return 'weak'
  if (/^\d+$/.test(p) || /^[a-zA-Z]+$/.test(p)) return 'weak'
  if (p.length >= 12 && /[A-Z]/.test(p) && /\d/.test(p)) return 'strong'
  return 'medium'
}

const strengthMeta = {
  weak: { label: 'Weak', color: '#6366f1', width: '33%' },
  medium: { label: 'Medium', color: '#eab308', width: '66%' },
  strong: { label: 'Strong', color: '#22c55e', width: '100%' },
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
  return 'Something went wrong. Please try again.'
}

// =====================================================
// 🧩 INNER FORM
// =====================================================

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const strength = password ? getStrength(password) : null
  const passwordsMatch = confirm.length > 0 && password === confirm

  const submit = async () => {
    setError(null)
    if (!token) return setError('Reset token is missing. Please use the link from your email.')
    if (!password) return setError('Password is required')
    if (getStrength(password) === 'weak') return setError('Password is too weak — use 8+ chars with letters and numbers')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) submit()
  }

  // ── SUCCESS STATE ──
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0', animation: 'rpFadeUp .45s ease both' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64, borderRadius: 18,
          background: '#f0fdf4',
          boxShadow: '0 4px 14px rgba(34,197,94,.18)',
          marginBottom: 18,
          animation: 'rpIconPop .5s cubic-bezier(.34,1.56,.64,1) both .1s',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0c1422', margin: '0 0 8px', letterSpacing: '-.3px' }}>
          Password updated!
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24, lineHeight: 1.6 }}>
          Your password has been reset successfully.<br />You can now sign in with your new password.
        </p>
        <Link href="/login" style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg,#2f3edc,#5862f3)',
          color: '#fff',
          fontSize: 13, fontWeight: 700,
          padding: '12px 28px',
          borderRadius: 12,
          textDecoration: 'none',
          boxShadow: '0 5px 18px rgba(47,62,220,.32)',
          transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              ; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(47,62,220,.4)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 18px rgba(47,62,220,.32)'
          }}
        >
          Sign in now →
        </Link>
      </div>
    )
  }

  // ── INVALID TOKEN ──
  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0', animation: 'rpFadeUp .45s ease both' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64, borderRadius: 18,
          background: '#eef2ff',
          boxShadow: '0 4px 14px rgba(99,102,241,.18)',
          marginBottom: 18,
          animation: 'rpIconPop .5s cubic-bezier(.34,1.56,.64,1) both .1s',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0c1422', margin: '0 0 8px' }}>
          Invalid reset link
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24, lineHeight: 1.6 }}>
          This link is invalid or has expired.<br />Please request a new password reset.
        </p>
        <Link href="/forgot-password" style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg,#2f3edc,#5862f3)',
          color: '#fff',
          fontSize: 13, fontWeight: 700,
          padding: '12px 28px',
          borderRadius: 12,
          textDecoration: 'none',
          boxShadow: '0 5px 18px rgba(47,62,220,.32)',
          transition: 'transform .15s, box-shadow .15s',
        }}>
          Request new link
        </Link>
      </div>
    )
  }

  // ── MAIN FORM ──
  return (
    <>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 22, animation: 'rpFadeUp .4s ease both .28s' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 16,
          background: '#eef2ff',
          boxShadow: '0 4px 14px rgba(99,102,241,.18)',
          marginBottom: 14,
          cursor: 'default',
          transition: 'transform .25s ease, box-shadow .25s ease, background .2s',
          animation: 'rpIconPop .5s cubic-bezier(.34,1.56,.64,1) both .2s',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.1) rotate(-4deg)'
              ; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(99,102,241,.28)'
              ; (e.currentTarget as HTMLElement).style.background = '#e0e7ff'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              ; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(99,102,241,.18)'
              ; (e.currentTarget as HTMLElement).style.background = '#eef2ff'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0c1422', letterSpacing: '-.3px', margin: '0 0 4px' }}>
          Set new password
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
          Choose a strong password for your account
        </p>
      </div>

      {/* Error */}
      <div style={{
        overflow: 'hidden',
        transition: 'max-height .3s ease, opacity .3s ease, margin-bottom .3s ease',
        maxHeight: error ? '80px' : '0px',
        opacity: error ? 1 : 0,
        marginBottom: error ? '16px' : '0px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          background: '#eef2ff', border: '1px solid rgba(99,111,240,.2)',
          borderRadius: 12, padding: '10px 13px',
          animation: 'rpShake .36s ease',
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#4338ca" strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="8" cy="8" r="6" /><path d="M8 5v3M8 10.5v.5" />
          </svg>
          <span style={{ fontSize: 12, color: '#4338ca', lineHeight: 1.5 }}>{error}</span>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onKeyDown={onKeyDown}>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, animation: 'rpFadeUp .4s ease both .36s' }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.55px' }}>
            New password
          </label>
          <div style={{ position: 'relative', transition: 'transform .15s cubic-bezier(.22,1,.36,1)' }}
            onFocus={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
            onBlur={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
          >
            <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#c5cedd', pointerEvents: 'none' }}
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 016 0v2" />
            </svg>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              style={{
                width: '100%', border: '1.5px solid #e4e8f2', borderRadius: 12,
                padding: '12px 42px 12px 40px', fontSize: 13, color: '#0c1422',
                background: '#f7f8fd', outline: 'none',
                transition: 'border-color .16s, box-shadow .16s, background .16s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#6366f1'
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'
                e.target.style.background = '#fff'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e4e8f2'
                e.target.style.boxShadow = 'none'
                e.target.style.background = '#f7f8fd'
              }}
            />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: '#c5cedd', display: 'flex', alignItems: 'center', borderRadius: 4,
              transition: 'color .13s, transform .13s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#64748b'
                  ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#c5cedd'
                  ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)'
              }}
              onMouseDown={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(.9)'}
              onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)'}
            >
              {showPass ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l12 12M6.5 6.6A3 3 0 0010.4 10M4.3 4.4A7 7 0 001 8s2.5 5 7 5a6.9 6.9 0 003.7-1.1" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                </svg>
              )}
            </button>
          </div>

          {/* Strength */}
          {strength && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, animation: 'rpFadeUp .3s ease both' }}>
              <div style={{ height: 5, background: '#f0f1f6', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  width: strengthMeta[strength].width,
                  background: strengthMeta[strength].color,
                  transition: 'width .4s cubic-bezier(.22,1,.36,1), background .3s',
                }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: strengthMeta[strength].color }}>
                {strengthMeta[strength].label} password
              </span>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, animation: 'rpFadeUp .4s ease both .44s' }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.55px' }}>
            Confirm password
          </label>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#c5cedd', pointerEvents: 'none' }}
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 016 0v2" /><path d="M6 10.5l1.5 1.5 3-3" />
            </svg>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              style={{
                width: '100%', border: '1.5px solid #e4e8f2', borderRadius: 12,
                padding: '12px 42px 12px 40px', fontSize: 13, color: '#0c1422',
                background: '#f7f8fd', outline: 'none',
                transition: 'border-color .16s, box-shadow .16s, background .16s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#6366f1'
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'
                e.target.style.background = '#fff'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e4e8f2'
                e.target.style.boxShadow = 'none'
                e.target.style.background = '#f7f8fd'
              }}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: '#c5cedd', display: 'flex', alignItems: 'center', borderRadius: 4,
              transition: 'color .13s, transform .13s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#64748b'
                  ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#c5cedd'
                  ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)'
              }}
              onMouseDown={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(.9)'}
              onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)'}
            >
              {showConfirm ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l12 12M6.5 6.6A3 3 0 0010.4 10M4.3 4.4A7 7 0 001 8s2.5 5 7 5a6.9 6.9 0 003.7-1.1" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                </svg>
              )}
            </button>
          </div>

          {/* Match indicator */}
          {confirm.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 500,
              color: passwordsMatch ? '#16a34a' : '#6366f1',
              animation: 'rpFadeUp .25s ease both',
            }}>
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
        <div style={{ animation: 'rpFadeUp .4s ease both .52s' }}>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 16px',
              borderRadius: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13.5, fontWeight: 700, color: '#fff',
              background: 'linear-gradient(135deg,#2f3edc 0%,#4a55ee 45%,#5862f3 100%)',
              boxShadow: '0 5px 20px rgba(47,62,220,.38),0 2px 5px rgba(47,62,220,.16)',
              position: 'relative', overflow: 'hidden',
              opacity: loading ? .6 : 1,
              transition: 'transform .15s, box-shadow .15s, opacity .2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              if (loading) return
                ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 26px rgba(47,62,220,.44),0 0 42px rgba(99,111,240,.26)'
            }}
            onMouseLeave={e => {
              ; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 20px rgba(47,62,220,.38),0 2px 5px rgba(47,62,220,.16)'
            }}
            onMouseDown={e => {
              if (loading) return
                ; (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(.98)'
            }}
            onMouseUp={e => {
              if (loading) return
                ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            }}
          >
            {/* Shimmer */}
            <span style={{
              position: 'absolute', top: 0, bottom: 0, width: '45%',
              background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)',
              animation: 'rpShimmer 2.8s linear infinite',
              pointerEvents: 'none',
            }} />
            {loading ? (
              <>
                <svg style={{ animation: 'rpSpin .75s linear infinite' }} width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2">
                  <circle cx="8" cy="8" r="6" /><path d="M8 2a6 6 0 016 6" stroke="white" strokeLinecap="round" />
                </svg>
                Updating password…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
                Update password
              </>
            )}
          </button>
        </div>
      </div>

      {/* Back link */}
      <p style={{ textAlign: 'center', marginTop: 20, animation: 'rpFadeUp .4s ease both .58s' }}>
        <Link href="/login" style={{
          fontSize: 12, color: '#9ca3af', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          transition: 'color .15s, transform .15s',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#4c57ec'
              ; (e.currentTarget as HTMLElement).style.transform = 'translateX(-2px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#9ca3af'
              ; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back to login
        </Link>
      </p>
    </>
  )
}

// =====================================================
// 📄 PAGE
// =====================================================

export default function ResetPasswordPage() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @keyframes rpFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rpCardPop {
          0%   { opacity: 0; transform: scale(.94) translateY(18px); }
          65%  { transform: scale(1.01) translateY(-1px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes rpIconPop {
          0%   { opacity: 0; transform: scale(.6) rotate(-10deg); }
          65%  { transform: scale(1.12) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes rpShimmer {
          0%   { transform: translateX(-130%); }
          100% { transform: translateX(260%); }
        }
        @keyframes rpSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes rpShake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-5px); }
          40%     { transform: translateX(5px); }
          60%     { transform: translateX(-3px); }
          80%     { transform: translateX(3px); }
        }
        @keyframes rpPulse {
          0%,100% { opacity:.5; transform:scale(1); }
          50%     { opacity:.9; transform:scale(1.05); }
        }
        @keyframes rpGridIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div style={{
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        background: '#eef0f8',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Grid */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(99,111,240,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,111,240,.07) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'rpGridIn 1s ease both .2s', opacity: 0,
        }} />

        {/* Blobs */}
        {[
          { w: 300, h: 300, top: -70, right: -70, dur: '14s', op: .4 },
          { w: 180, h: 180, bottom: 20, left: -50, dur: '18s', delay: '3s', op: .28 },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'fixed', borderRadius: '50%',
            background: 'rgba(76,87,236,.12)',
            pointerEvents: 'none', zIndex: 0,
            width: b.w, height: b.h,
            top: b.top, right: (b as { right?: number }).right,
            bottom: (b as { bottom?: number }).bottom, left: (b as { left?: number }).left,
            opacity: b.op,
            animation: `rpPulse ${b.dur} ease-in-out infinite`,
            animationDelay: (b as { delay?: string }).delay ?? '0s',
          }} />
        ))}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'fixed', top: 20, left: 20, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500, color: '#9ca3af',
            padding: '6px 10px', borderRadius: 8,
            transition: 'color .15s, background .15s, transform .15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#4c57ec'
              ; (e.currentTarget as HTMLElement).style.background = 'rgba(76,87,236,.07)'
              ; (e.currentTarget as HTMLElement).style.transform = 'translateX(-2px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#9ca3af'
              ; (e.currentTarget as HTMLElement).style.background = 'none'
              ; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'
          }}
          onMouseDown={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(0) scale(.96)'}
          onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(-2px)'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back
        </button>

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 430,
          background: '#fff',
          borderRadius: 24,
          padding: '32px 34px 28px',
          position: 'relative', zIndex: 2,
          boxShadow: '0 0 0 1px rgba(90,99,240,.08),0 4px 8px rgba(0,0,0,.04),0 12px 28px rgba(90,99,240,.11),0 28px 60px rgba(90,99,240,.07)',
          animation: 'rpCardPop .6s cubic-bezier(.22,1,.36,1) both .1s',
        }}>
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <svg style={{ animation: 'rpSpin .75s linear infinite' }} width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="8" cy="8" r="6" /><path d="M8 2a6 6 0 016 6" stroke="#6366f1" strokeLinecap="round" />
              </svg>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </>
  )
}