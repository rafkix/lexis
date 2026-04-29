'use client'

import { useEffect, useRef } from 'react'
import { authApi } from '@/lib/api/auth'

type Props = {
  onSuccess: () => void
  onError: (msg: string) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          prompt: (notification?: (n: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
            getNotDisplayedReason?: () => string
          }) => void) => void
          cancel: () => void
          renderButton: (element: HTMLElement, config: object) => void
        }
      }
    }
  }
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  // ✅ display:none emas — Google SDK ko'rishi kerak
  const hiddenDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const initGoogle = () => {
      if (!window.google) return

      const callback = async (response: { credential: string }) => {
        try {
          await authApi.loginGoogle(response.credential)
          onSuccessRef.current()
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { detail?: string } } })
              ?.response?.data?.detail ?? 'Google login failed'
          onErrorRef.current(msg)
        }
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        hl: 'en',
      })

      if (hiddenDivRef.current) {
        window.google.accounts.id.renderButton(hiddenDivRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 400,
        })
      }

      // ✅ One Tap
      window.google.accounts.id.prompt((n) => {
        if (n.isNotDisplayed()) {
          console.info('One Tap not displayed:', n.getNotDisplayedReason?.() ?? 'unknown')
        }
      })
    }

    if (window.google) {
      initGoogle()
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]'
      )
      if (existing) {
        existing.addEventListener('load', initGoogle)
        return () => existing.removeEventListener('load', initGoogle)
      }
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGoogle
      document.body.appendChild(script)
    }

    return () => window.google?.accounts.id.cancel()
  }, [])

  const handleClick = () => {
    const btn = hiddenDivRef.current?.querySelector('div[role="button"]') as HTMLElement | null
    btn?.click()
  }

  return (
    <>
      {/* Ko'rinadigan custom button */}
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        style={{ minHeight: 44 }}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* ✅ display:none emas! Google SDK ko'rishi uchun visibility:hidden */}
      <div
        ref={hiddenDivRef}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}