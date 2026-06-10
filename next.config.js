/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['26.7.66.142'],
    images: {
        remotePatterns: [{
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'api.lexis.uz',
            },
        ],
    },
}

module.exports = nextConfig