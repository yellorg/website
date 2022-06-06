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
}

module.exports = nextConfig