import { MetadataRoute } from "next";

/**
 * robots.txt 생성
 * 
 * 검색 엔진 크롤러에게 사이트 크롤링 규칙을 제공합니다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth-test/",
          "/storage-test/",
          "/tasks-example/",
          "/instruments-example/",
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app"}/sitemap.xml`,
  };
}
