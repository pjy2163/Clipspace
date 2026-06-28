import type { MetadataRoute } from "next";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  configuredSiteUrl && !configuredSiteUrl.includes("localhost")
    ? configuredSiteUrl.replace(/\/$/, "")
    : "https://clipspace.co.kr";

const routes = [
  { path: "", priority: 1 },
  { path: "/online-clipboard", priority: 0.9 },
  { path: "/team-clipboard", priority: 0.9 },
  { path: "/personal-clipboard", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/guide", priority: 0.8 },
  { path: "/privacy", priority: 0.7 },
  { path: "/use-cases", priority: 0.8 },
  { path: "/en", priority: 0.9 },
  { path: "/en/online-clipboard", priority: 0.7 },
  { path: "/en/team-clipboard", priority: 0.7 },
  { path: "/en/personal-clipboard", priority: 0.7 },
  { path: "/en/about", priority: 0.7 },
  { path: "/en/guide", priority: 0.7 },
  { path: "/en/privacy", priority: 0.6 },
  { path: "/en/use-cases", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
