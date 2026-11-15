/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export" is disabled so dynamic API routes (/api/health) run on Vercel
  // to prevent Supabase auto-pause. For Capacitor mobile builds, run: npm run build:mobile
  ...(process.env.CAPACITOR_BUILD === "true" ? { output: "export" } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
