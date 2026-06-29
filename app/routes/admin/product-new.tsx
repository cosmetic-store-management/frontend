import { useNavigate } from "react-router";
import { PageHeader } from "@/admin/components/common/PageHeader";
import ProductEditor from "@/admin/components/products/ProductEditor";
import { useProducts } from "@/admin/hooks/useProducts";
import { useBrands } from "@/admin/hooks/useBrand";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductFormValues } from "@/admin/components/products/ProductEditor";

export default function ProductNewPage() {
  const navigate = useNavigate();
  const { categories, submitCreate, submitting, error, clearError } =
    useProducts({
      keyword: "",
      brandId: "",
      categoryId: "",
      status: "",
    });

  const { data: brandData } = useBrands({ limit: 1000 });
  const brands = brandData?.brands ?? [];

  const handleCancel = () => {
    navigate("/admin/products");
  };

  const handleSubmit = async (values: ProductFormValues) => {
    const ok = await submitCreate(values);
    if (ok) {
      navigate("/admin/products");
    }
  };

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
          title="Thêm sản phẩm mới"
          description="Điền thông tin cơ bản, thuộc tính và hình ảnh để tạo sản phẩm mới."
          error={error}
          onClearError={clearError}
        />
      </div>

      <div className="bg-surface rounded-xl shadow-ui-card border border-border p-6 md:p-8">
        <ProductEditor
          mode="create"
          loading={submitting}
          submitError={error}
          categories={categories}
          brands={brands}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
