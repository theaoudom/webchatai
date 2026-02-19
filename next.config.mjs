/** @type {import('next').NextConfig} */
const nextConfig = {
    // Keep APK-parsing packages (and their native deps like memcpy) server-side only.
    // This prevents webpack from trying to bundle bytebuffer/memcpy for the browser.
    serverExternalPackages: ['app-info-parser', 'bytebuffer', 'memcpy'],

    eslint: {
        // ESLint v9 + FlatCompat throws "Unknown options: useEslintrc, extensions"
        // during Vercel builds. Linting is still done locally via `yarn lint`.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
