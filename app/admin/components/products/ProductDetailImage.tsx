type ProductDetailImageProps = {
  imageUrl?: string;
  name: string;
};

export default function ProductDetailImage({
  imageUrl,
  name,
}: ProductDetailImageProps) {
  return (
    <div className="relative shrink-0 bg-[linear-gradient(160deg,rgba(251,207,232,0.45)_0%,rgba(255,255,255,1)_70%)] md:w-[42%]">
      <div className="absolute inset-x-8 top-6 h-16 bg-rose-200/30 blur-3xl" />
      <div className="relative flex h-48 items-center justify-center overflow-hidden p-4 sm:p-5 md:h-full min-h-[250px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full max-h-[340px] w-full object-cover shadow-[0_16px_48px_rgba(15,23,42,0.12)] md:max-h-none"
          />
        ) : (
          <p className="text-ink-muted text-sm">Chưa có hình ảnh</p>
        )}
      </div>
    </div>
  );
}
