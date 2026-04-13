import { redirect } from 'next/navigation'

type Props = {
    params: { locale: string }
    searchParams: { code?: string; state?: string }
}

export default async function GoogleCallbackPage({
    params,
    searchParams,
}: Props) {
    const { locale } = params
    const { code, state } = searchParams

    // ❌ code yo‘q
    if (!code) {
        redirect(`/${locale}/auth?error=google_no_code`)
    }

    try {
        // 🔥 BACKENDGA SERVERDAN yuboramiz (MUHIM!)
        const res = await fetch(`${process.env.API_URL}/auth/google/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error('Google auth failed')
        }

        const data = await res.json()

        // 🔥 TOKENNI COOKIEGA YOZAMIZ (secure)
        const token = data.access_token

        // ⚠️ bu joyni sen cookie systemga moslaysan
        // (next/headers orqali ham qilsa bo‘ladi)

        // 🔥 redirect
        if (state) {
            redirect(`/auth/authorize?state=${state}`)
        }

        redirect(process.env.NEXT_PUBLIC_APP_URL || '/')
    } catch (err) {
        console.error(err)
        redirect(`/${locale}/auth?error=google_failed`)
    }
}