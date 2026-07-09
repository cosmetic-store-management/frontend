type ProductDetailImageProps = {
  imageUrl?: string;
  name: string;
};

export default function ProductDetailImage({
  imageUrl,
  name,
}: ProductDetailImageProps) {
  return (
    <div className="relative shrink-0 w-full h-full flex flex-col items-center justify-center p-8 min-h-62.5 md:min-h-full">
      <div className="relative w-full max-w-xs flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-auto object-contain shadow-sm rounded-md bg-white border border-border"
          />
        ) : (
          <p className="text-ink-muted text-sm">{"No image available"}</p>
        )}
      </div>
    </div>
  );
}
