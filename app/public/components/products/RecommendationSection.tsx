import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { ProductCard } from "@/public/components/products/ProductCard";

export function RecommendationSection() {
  const { data: recommendedProducts, isLoading } = useQuery({
    queryKey: ["recommended_products"],
    queryFn: async () => {
      const res = await apiClient.get<{ products: any[] }>(
        "/products/recommendations?limit=5",
      );
      return res.products;
    },
  });

  if (isLoading) return null;
  if (!recommendedProducts || recommendedProducts.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-gradient uppercase tracking-wider">
          RECOMMENDED FOR YOU
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
