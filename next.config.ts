import type { NextConfig } from "next";

const securityHeaders = [
  // SAMEORIGIN (not DENY): external sites still can't frame the portfolio
  // (clickjacking protection intact), but the in-page resume/CV viewer CAN
  // embed the same-origin PDF — DENY was silently blanking it in every browser.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Clickjacking defense-in-depth. `frame-ancestors 'self'` matches the
  // X-Frame-Options above: same-origin framing (the PDF viewer) allowed,
  // cross-origin framing blocked. Only this directive is set so no script/style
  // loading is affected (a full CSP would need nonce plumbing for the inline
  // JSON-LD + framer-motion and risks post-deploy breakage).
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'" },
  // Cross-origin isolation — no cross-origin popup can grab a window handle.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js"
  experimental: {
    serverActions: {
      // Increase body size limit for large PDF/image uploads (base64-encoded
      // files up to ~7.5MB binary can travel as ~10MB base64).
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // The OG card is a static /public asset. Without this it was served
        // `no-cache, must-revalidate`, forcing every crawler + CDN to re-fetch
        // it on each share — the "slow preview" symptom. Cache it hard so it is
        // served instantly from the edge. Bust with /opengraph-image.jpg?v=2 if
        // the card is ever redesigned.
        source: "/opengraph-image.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
