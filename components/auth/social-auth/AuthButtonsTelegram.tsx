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

export function TelegramSignIn({ onSuccess, onError }: Props) {
    const onSuccessRef = useRef(onSuccess)
    const onErrorRef = useRef(onError)

    useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
    useEffect(() => { onErrorRef.current = onError }, [onError])

    useEffect(() => {
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
        return () => { delete window.onTelegramAuth }
    }, [])

    const handleClick = () => {
        const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || '7756463843'
        const origin = window.location.origin
        const url = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&return_to=${encodeURIComponent(origin)}&request_access=write`
        window.open(url, 'telegram_oauth', 'width=550,height=470')
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                border: '1.5px solid #e4e8f2',
                borderRadius: 12,
                padding: '12px 13px',
                fontSize: 13,
                fontWeight: 500,
                color: '#0c1422',
                background: '#f7f8fd',
                cursor: 'pointer',
                minHeight: 44,
                transition: 'border-color .16s, box-shadow .16s, background .16s',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget
                el.style.borderColor = '#6366f1'
                el.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'
                el.style.background = '#fff'
            }}
            onMouseLeave={e => {
                const el = e.currentTarget
                el.style.borderColor = '#e4e8f2'
                el.style.boxShadow = 'none'
                el.style.background = '#f7f8fd'
            }}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.48.7-.96.44l-2.64-1.95-1.28 1.23c-.14.14-.26.26-.54.26l.19-2.7 4.93-4.46c.21-.19-.05-.29-.33-.1L7.9 14.4l-2.59-.81c-.56-.18-.57-.56.12-.83l10.12-3.9c.47-.17.88.11.73.83l-.64-.89z"
                    fill="#26A5E4"
                />
            </svg>
            Continue with Telegram
        </button>
    )
}