import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const analyticsScriptSources =
  "https://www.googletagmanager.com https://pagead2.googlesyndication.com";
const analyticsConnectSources =
  "https://www.google-analytics.com https://region1.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net";

const nextConfig: NextConfig = {
  async headers() {
    const scriptSrc = isDevelopment
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${analyticsScriptSources}`
      : `script-src 'self' 'unsafe-inline' ${analyticsScriptSources}`;

    const createSecurityHeaders = (frameAncestors: "'none'" | "'self'", xFrameOptions: "DENY" | "SAMEORIGIN") => [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          scriptSrc,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
          "font-src 'self' data:",
          `connect-src 'self' ${analyticsConnectSources}`,
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          `frame-ancestors ${frameAncestors}`,
          "upgrade-insecure-requests",
        ].join("; "),
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: xFrameOptions,
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
    ];

    const securityHeaders = createSecurityHeaders("'none'", "DENY");
    const miniWindowHeaders = createSecurityHeaders("'self'", "SAMEORIGIN");

    return [
      {
        source: "/mini",
        headers: miniWindowHeaders,
      },
      {
        source: "/en/mini",
        headers: miniWindowHeaders,
      },
      {
        source: "/((?!mini$|en/mini$).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
