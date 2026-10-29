import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/api"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Google-Extended"],
        allow: ["/", "/blog", "/treatments", "/store"],
        disallow: ["/dashboard", "/login", "/api"],
      },
    ],
    sitemap: "https://shelleys.studio/sitemap.xml",
  };
}
