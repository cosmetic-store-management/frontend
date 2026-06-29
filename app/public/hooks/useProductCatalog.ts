import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useProducts } from "@/public/hooks/useProducts";
import { useCategories } from "@/public/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";

const findCategoryContext = (
  cats: any[],
  slugToFind: string,
  parent: any = null,
): { active: any; parent: any } | null => {
  for (const cat of cats) {
    if (cat.slug === slugToFind) return { active: cat, parent };
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryContext(cat.children, slugToFind, cat);
      if (found) return found;
    }
  }
  return null;
};

export function useProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "";
  const selectedCategories = categoryParam
    ? categoryParam.split(",").filter(Boolean)
    : [];

  // Brands now use brand IDs (ObjectIds) instead of names for type-safe filtering
  const brandsParam = searchParams.get("brandId") || "";
  const selectedBrandIds = brandsParam
    ? brandsParam.split(",").filter(Boolean)
    : [];

  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const sortParam = searchParams.get("sort") || "newest";

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [minPriceInput, setMinPriceInput] = useState(
    minPriceParam ? parseInt(minPriceParam, 10).toLocaleString("vi-VN") : "",
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    maxPriceParam ? parseInt(maxPriceParam, 10).toLocaleString("vi-VN") : "",
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState({
    categories: true,
    price: true,
    brands: true,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const toggleFilter = (key: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePriceChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      if (!rawValue) {
        setter("");
        return;
      }
      setter(parseInt(rawValue, 10).toLocaleString("vi-VN"));
    };

  // Reset page when search changes
  useEffect(() => {
    {
      /* eslint-disable-next-line  */
    }
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data: categories = [] } = useCategories();

  const {
    data: prodData,
    isLoading,
    isFetching,
  } = useProducts({
    page: currentPage,
    limit: 24,
    search: debouncedSearch || undefined,
    category: categoryParam || undefined,
    brandId: brandsParam || undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    sort: sortParam,
  });

  const rawProducts =
    (Array.isArray(prodData) ? prodData : (prodData as any)?.products) || [];
  const brands: import("../services/product.service").BrandRef[] =
    (prodData as any)?.availableBrands || [];
  const totalPages = (prodData as any)?.pagination?.totalPages || 1;

  // Products sorted by backend — no client-side sort needed
  const products = rawProducts;

  // --- Handlers ---
  const toggleCategory = (slug: string) => {
    let newCategories = [...selectedCategories];

    if (newCategories.includes(slug)) {
      newCategories = newCategories.filter((c) => c !== slug);
      if (newCategories.length === 0) {
        const context = findCategoryContext(categories, slug);
        if (context && context.parent) {
          newCategories.push(context.parent.slug);
        }
      }
    } else {
      const context = findCategoryContext(categories, slug);
      if (context && context.parent) {
        newCategories = newCategories.filter((c) => c !== context.parent.slug);
      }
      newCategories.push(slug);
    }

    const newParams = new URLSearchParams(searchParams);
    if (newCategories.length > 0)
      newParams.set("category", newCategories.join(","));
    else newParams.delete("category");
    newParams.delete("page");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const toggleBrand = (brandId: string) => {
    const newIds = selectedBrandIds.includes(brandId)
      ? selectedBrandIds.filter((b) => b !== brandId)
      : [...selectedBrandIds, brandId];

    const newParams = new URLSearchParams(searchParams);
    if (newIds.length > 0) newParams.set("brandId", newIds.join(","));
    else newParams.delete("brandId");
    newParams.delete("page");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const applyPriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPriceInput)
      newParams.set("minPrice", minPriceInput.replace(/\D/g, ""));
    else newParams.delete("minPrice");
    if (maxPriceInput)
      newParams.set("maxPrice", maxPriceInput.replace(/\D/g, ""));
    else newParams.delete("maxPrice");
    newParams.delete("page");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const resetBrands = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("brandId");
    newParams.delete("page");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  let sidebarTitle = "ALL PRODUCTS";
  let displaySubcategories: any[] = categories;

  if (selectedCategories.length > 0) {
    const context = findCategoryContext(categories, selectedCategories[0]);
    if (context) {
      const { active, parent } = context;
      if (active.children && active.children.length > 0) {
        sidebarTitle = active.name;
        displaySubcategories = active.children;
      } else if (parent) {
        sidebarTitle = parent.name;
        displaySubcategories = parent.children;
      } else {
        sidebarTitle = active.name;
        displaySubcategories = [];
      }
    }
  }

  // Categories are no longer filtered by productCount so all 9 categories show up

  return {
    state: {
      searchTerm,
      minPriceInput,
      maxPriceInput,
      sortBy: sortParam,
      isMobileFilterOpen,
      openFilters,
      currentPage,
      selectedCategories,
      selectedBrands: selectedBrandIds,
      categoryParam:
        selectedCategories.length === 0 ? "all" : selectedCategories[0],
    },
    data: {
      categories,
      products,
      brands,
      totalPages,
      isLoading,
      isFetching,
      sidebarTitle,
      displaySubcategories,
    },
    actions: {
      setSearchTerm,
      setMinPriceInput,
      setMaxPriceInput,
      setSortBy: (sort: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (sort === "newest") newParams.delete("sort");
        else newParams.set("sort", sort);
        newParams.delete("page");
        setSearchParams(newParams, { preventScrollReset: true });
      },
      setIsMobileFilterOpen,
      setOpenFilters,
      setCurrentPage,
      toggleFilter,
      handlePriceChange,
      toggleCategory,
      toggleBrand,
      applyPriceFilter,
      resetBrands,
      setSelectedCategory: (catId: string) => {
        if (catId === "all") {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("category");
          newParams.delete("page");
          setSearchParams(newParams, { preventScrollReset: true });
        } else {
          toggleCategory(catId);
        }
      },
    },
  };
}
