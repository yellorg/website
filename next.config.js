/** @type {import('next').NextConfig} */

const path = require('path')

const nextConfig = {
    swcMinify: false,
    reactStrictMode: false,
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    experimental: {
        outputStandalone: true,
    },
    images: {
        domains: ['cdn-icons-png.flaticon.com'],
    },
}

module.exports = nextConfig