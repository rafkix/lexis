'use client'

import { useEffect, useRef } from 'react'
import { authApi, TelegramAuthData } from '@/lib/api/auth'

type Props = {
    onSuccess: () => void
    onError: (msg: string) => void
}

declare global {
    interface Window {
        onTelegramAuth?: (user: TelegramAuthData) => void
    }
}

// Telegram SVG icon
function TelegramIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.48.7-.96.44l-2.64-1.95-1.28 1.23c-.14.14-.26.26-.54.26l.19-2.7 4.93-4.46c.21-.19-.05-.29-.33-.1L7.9 14.4l-2.59-.81c-.56-.18-.57-.56.12-.83l10.12-3.9c.47-.17.88.11.73.83l-.64-.89z"
                fill="#26A5E4"
            />
        </svg>
    )
}

export function TelegramSignIn({ onSuccess, onError }: Props) {
    const hiddenRef = useRef<HTMLDivElement>(null)
    const onSuccessRef = useRef(onSuccess)
    const onErrorRef = useRef(onError)

    useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
    useEffect(() => { onErrorRef.current = onError }, [onError])

    useEffect(() => {
        const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME
        if (!botName || !hiddenRef.current) return

        window.onTelegramAuth = async (userData: TelegramAuthData) => {
            try {
                await authApi.loginTelegram(userData)
                onSuccessRef.current()
            } catch (err: unknown) {
                const msg =
                    (err as { response?: { data?: { detail?: string } } })
                        ?.response?.data?.detail ?? 'Telegram login failed'
                onErrorRef.current(msg)
            }
        }

        hiddenRef.current.innerHTML = ''

        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-widget.js?22'
        script.setAttribute('data-telegram-login', botName)
        script.setAttribute('data-size', 'large')
        script.setAttribute('data-radius', '12')
        script.setAttribute('data-onauth', 'onTelegramAuth(user)')
        script.setAttribute('data-request-access', 'write')
        script.async = true

        hiddenRef.current.appendChild(script)

        return () => {
            delete window.onTelegramAuth
        }
    }, [])

    // ✅ Custom button — Telegram widget'dagi asosiy linkni topib bosamiz
    const handleClick = () => {
        const iframe = hiddenRef.current?.querySelector('iframe')
        if (iframe) {
            // iframe ichidagi linkni trigger qilamiz
            iframe.contentWindow?.document.querySelector('a')?.click()
            return
        }
        // Fallback: to'g'ridan-to'g'ri Telegram OAuth
        const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME
        const origin = window.location.origin
        window.open(
            `https://oauth.telegram.org/auth?bot_id=${botName}&origin=${origin}&return_to=${origin}`,
            '_blank',
            'width=550,height=470'
        )
    }

    return (
        <>
            {/* ✅ Ko'rinadigan custom button — Google bilan bir xil stil */}
            <button
                type="button"
                onClick={handleClick}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                style={{ minHeight: 44 }}
            >
                <TelegramIcon />
                Continue with Telegram
            </button>

            {/* ✅ Yashirin — faqat script uchun */}
            <div ref={hiddenRef} className="hidden" />
        </>
    )
}