/**
 * @file components/ProductImage.tsx
 * @description 상품 이미지 컴포넌트
 *
 * 상품 이미지를 표시하는 컴포넌트입니다.
 * 이미지가 없거나 로딩 실패 시 플레이스홀더를 표시합니다.
 *
 * @see types/product.ts
 */

import Image from "next/image";
import { Package } from "lucide-react";

interface ProductImageProps {
  imageUrl: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}

/**
 * 상품 이미지 컴포넌트
 *
 * @param imageUrl - 상품 이미지 URL
 * @param alt - 이미지 대체 텍스트
 * @param className - 추가 CSS 클래스
 * @param priority - 우선 로딩 여부
 */
export default function ProductImage({
  imageUrl,
  alt,
  className = "",
  priority = false,
}: ProductImageProps) {
  if (!imageUrl) {
    return (
      <div
        className={`relative aspect-square w-full bg-muted flex items-center justify-center ${className}`}
      >
        <Package className="w-16 h-16 text-muted-foreground/50" />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative aspect-square w-full bg-muted overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={priority}
        onError={(e) => {
          // 이미지 로딩 실패 시 플레이스홀더로 대체
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            `;
          }
        }}
      />
    </div>
  );
}

