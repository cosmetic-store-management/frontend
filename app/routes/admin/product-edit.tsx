import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/admin/components/common/PageHeader";
import ProductEditor, {
  type ProductFormValues,
} from "@/admin/components/products/ProductEditor";
import { useProducts } from "@/admin/hooks/useProducts";
import { useBrands } from "@/admin/hooks/useBrand";
import { getAdminProductById } from "@/admin/services/product.service";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { categories, submitUpdate, submitting, error, clearError } =
    useProducts({
      keyword: "",
      brandId: "",
      categoryId: "",
      status: "",
    });

  const { data: brandData } = useBrands({ limit: 1000 });
  const brands = brandData?.brands ?? [];

  const {
    data: product,
    isLoading: loadingProduct,
    error: fetchError,
  } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => getAdminProductById(id!),
    enabled: !!id,
  });

  const handleCancel = () => {
    navigate("/admin/products");
  };

  const handleSubmit = async (values: ProductFormValues) => {
    if (!id) return;
    const ok = await submitUpdate(id, values);
    if (ok) {
      navigate("/admin/products");
    }
  };

  const initialValues = useMemo<Partial<ProductFormValues> | undefined>(() => {
    if (!product) return undefined;
    const p = product;
    return {
      name: p.name,
      slug: p.slug,
      brandId: p.brandId || "",
      description: p.description ?? "",
      imageUrl: p.imageUrl,
      imageUrls: p.imageUrls || [],
      categoryId: p.categoryId,
      categoryIds: p.categoryIds || [],
      isActive: p.isActive,
      variants: p.variants?.length
        ? p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku || "",
            price: String(v.price || 0),
            discountPrice:
              v.discountPrice != null ? String(v.discountPrice) : "",
            stock: String(v.stock || 0),
            minStock: String(v.minStock || 10),
            weight: String(v.weight || 200),
            imageUrl: v.imageUrl || "",
            isActive: v.isActive ?? true,
          }))
        : undefined,
    };
  }, [product]);

  return (
    <section className="space-y-4 animate-page-enter">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="rounded-full shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title="Edit Product"
          description={
            product
              ? `Update details for product ${product.name}`
              : "Loading data..."
          }
          error={error || (fetchError as Error)?.message}
          onClearError={clearError}
        />
      </div>

      <div className="bg-surface rounded-sm shadow-ui-card border border-border p-6 md:p-8 min-h-[500px]">
        {loadingProduct ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : initialValues ? (
          <ProductEditor
            mode="edit"
            loading={submitting}
            submitError={error}
            categories={categories}
            brands={brands}
            initialValues={initialValues}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-ink-muted">
            <p>{"Product details not found."}</p>
            <Button variant="outline" onClick={handleCancel} className="mt-4">{"Back"}</Button>
          </div>
        )}
      </div>
    </section>
  );
}
