/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",        // Static export — required for Capacitor
  trailingSlash: true,     // /cases/ instead of /cases — safer for static hosting
  images: {
    unoptimized: true,     // Required for static export
  },
  // No server actions, API routes, or SSR.
  // All data via supabase-js on the client.
};

module.exports = nextConfig;
