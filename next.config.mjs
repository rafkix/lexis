/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            // ✅ Google profile pictures (OAuth)
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'lh4.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'lh5.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'lh6.googleusercontent.com',
            },
            // ✅ Telegram CDN avatars
            {
                protocol: 'https',
                hostname: 't.me',
            },
            // ✅ Your own API server (local dev)
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/static/**',
            },
            // ✅ Your own API server (production) — change to your real domain
            {
                protocol: 'https',
                hostname: 'api.lexis.uz',
                pathname: '/static/**',
            },
        ],
    },
    allowedDevOrigins: ['26.48.94.111'],
}

export default nextConfig