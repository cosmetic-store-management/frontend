import { useState, useEffect, useRef } from "react";

interface ProductImageGalleryProps {
  productName: string;
  mainImage: string;
  imageUrls: string[];
  selectedVariantImage?: string | null;
  isActive?: boolean;
}

export function ProductImageGallery({
  productName,
  mainImage,
  imageUrls = [],
  selectedVariantImage,
  isActive = true,
}: ProductImageGalleryProps) {
  // bg = luôn hiển thị; fg = ảnh mới fade-in đè lên
  const [bgSrc, setBgSrc] = useState(mainImage);
  const [fgSrc, setFgSrc] = useState<string | null>(null);
  const [fgVisible, setFgVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentImage = fgVisible && fgSrc ? fgSrc : bgSrc;

  const allImages = Array.from(new Set([mainImage, ...imageUrls]));
  if (selectedVariantImage && !allImages.includes(selectedVariantImage)) {
    allImages.push(selectedVariantImage);
  }

  const changeImage = (src: string) => {
    if (src === currentImage) return;

    // Đặt ảnh mới ở foreground, opacity 0
    setFgSrc(src);
    setFgVisible(false);

    // Render xong frame (fg opacity=0), bắt đầu transition lên opacity=1
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFgVisible(true));
    });
  };

  // Khi fg transition hoàn tất → promote fg → bg, dọn fg
  const handleTransitionEnd = () => {
    if (fgSrc) {
      setBgSrc(fgSrc);
      setFgSrc(null);
      setFgVisible(false);
    }
  };

  useEffect(() => {
    {
      /* eslint-disable-next-line  */
    }
    changeImage(selectedVariantImage || mainImage);
    {
      /* eslint-disable-next-line  */
    }
  }, [selectedVariantImage, mainImage]);

  // Scroll thumbnail active vào view
  useEffect(() => {
    if (!scrollRef.current) return;
    const btn = scrollRef.current.querySelector<HTMLButtonElement>(
      `[data-img="${currentImage}"]`,
    );
    if (btn) {
      const c = scrollRef.current;
      c.scrollTo({
        left: btn.offsetLeft - c.clientWidth / 2 + btn.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentImage]);

  return (
    <div className="space-y-3 w-full">
      {/* Main image — crossfade */}
      <div className="relative aspect-square rounded-sm overflow-hidden border border-border bg-surface-soft">
        {/* Layer 1: background (luôn hiển thị) */}
        <img
          src={bgSrc}
          alt={productName}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Layer 2: foreground (ảnh mới, fade-in) */}
        {fgSrc && (
          <img
            src={fgSrc}
            alt={productName}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: fgVisible ? 1 : 0,
              transition: "opacity 0.22s ease-in-out",
            }}
            onTransitionEnd={handleTransitionEnd}
          />
        )}

        {!isActive && (
          <div className="absolute top-3 left-3 bg-ink text-white text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider z-10">{"Ngừng kinh doanh"}</div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto py-0.5 scrollbar-hide"
        >
          {allImages.map((img, i) => (
            <button
              key={i}
              data-img={img}
              onClick={() => changeImage(img)}
              style={{ width: "calc((100% - 32px) / 5)", minWidth: 48 }}
              className={`shrink-0 aspect-square overflow-hidden rounded-sm border-2 transition-all duration-200 ${
                currentImage === img
                  ? "border-brand opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img
                src={img}
                alt={`${productName} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
