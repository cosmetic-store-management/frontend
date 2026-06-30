type ProductDetailImageProps = {
  imageUrl?: string;
  name: string;
};

export default function ProductDetailImage({
  imageUrl,
  name,
}: ProductDetailImageProps) {
  return (
    <div className="relative shrink-0 bg-surface-muted/30 w-full h-full flex flex-col items-center justify-center p-8 min-h-62.5 md:min-h-full">
      <div className="absolute inset-x-8 top-6 h-16 bg-rose-200/20 blur-3xl" />
      <div className="relative w-full max-w-xs flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-auto object-contain shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-md bg-white border border-border"
          />
        ) : (
          <p className="text-ink-muted text-sm">{"Chưa có hình ảnh"}</p>
        )}
      </div>
    </div>
  );
}
