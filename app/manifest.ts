import { MetadataRoute } from "next";

/**
 * manifest.json 생성
 * 
 * PWA(Progressive Web App) 메타데이터를 제공합니다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "쇼핑몰 MVP",
    short_name: "쇼핑몰",
    description: "Next.js + Clerk + Supabase 기반 쇼핑몰 MVP",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
