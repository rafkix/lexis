'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authService } from '@/lib/api/auth'

/**
 * GOOGLE SIGN IN
 */
export const GoogleSignInButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const clientIdParam = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const state = searchParams.get('state')

  const getRedirectUrl = () => {
    if (clientIdParam) {
      return `https://auth.enwis.uz/auth/authorize?client_id=${clientIdParam}&redirect_uri=${redirectUri}&state=${state}`
    }
    return `/dashboard` // 🔥 LOCAL REDIRECT
  }

  const handleGoogleLogin = () => {
    const GOOGLE_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!GOOGLE_ID || !(window as any).google) {
      alert('Google yuklanmadi')
      return
    }

    setIsLoading(true)

    ;(window as any).google.accounts.id.initialize({
      client_id: GOOGLE_ID,
      callback: async (response: any) => {
        try {
          const res = await authService.googleLogin({
            token: response.credential, // 🔥 FIX
          })

          // 🔥 MUHIM: status tekshir
          if (res.status === 'success') {
            window.location.href = getRedirectUrl()
          } else {
            // 🔗 LINK FLOW
            alert(`Account mavjud: ${res.email}`)
          }

        } catch (error: any) {
          console.error(error.response?.data)
          alert('Google login xato')
        } finally {
          setIsLoading(false)
        }
      },
    })

    ;(window as any).google.accounts.id.prompt()
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex h-[48px] w-full items-center justify-center gap-3 rounded-xl bg-white px-4 text-[15px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-70"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      ) : (
        <span>Google</span>
      )}
    </button>
  )
}

/**
 * TELEGRAM SIGN IN
 */
export const TelegramSignInWidget = () => {
  const telegramRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const state = searchParams.get('state')

  const getRedirectUrl = () => {
    if (clientId) {
      return `https://auth.enwis.uz/auth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`
    }
    return `/dashboard`
  }

  useEffect(() => {
    ;(window as any).onTelegramAuth = async (user: any) => {
      try {
        const res = await authService.telegramLogin({
          data: user, // 🔥 FIX
        })

        if (res.status === 'success') {
          window.location.href = getRedirectUrl()
        } else {
          alert(`Account mavjud: ${res.email}`)
        }

      } catch (error: any) {
        alert(error.response?.data?.detail || 'Telegram login xato')
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', 'EnwisAuthBot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')

    if (telegramRef.current) {
      telegramRef.current.innerHTML = ''
      telegramRef.current.appendChild(script)
    }
  }, [])

  return (
    <div className="w-full h-[48px] flex items-center justify-center rounded-xl bg-[#54a9eb]">
      <div ref={telegramRef} />
    </div>
  )
}