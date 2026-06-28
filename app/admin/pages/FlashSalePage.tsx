import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { Plus, Edit, Trash2, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "../components/PageHeader";
import { toast } from "@/lib/toast";
import { FlashSaleEditor } from "../components/FlashSaleEditor";
import type { FlashSaleFormData } from "../schemas/flash-sale.schema";

interface FlashSaleItem {
  productId: string;
  productName: string;
  productImage?: string;
  variantId: string;
  variantName: string;
  sku?: string;
  originalPrice: number;
  flashPrice: number;
  quantityLimit: number;
  soldQuantity: number;
}

interface FlashSale {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  items: FlashSaleItem[];
}

const getStatusLabel = (fs: FlashSale) => {
  if (!fs.isActive)
    return { label: "Disabled", color: "bg-muted text-muted-foreground" };
  const now = new Date().getTime();
  const start = new Date(fs.startTime).getTime();
  const end = new Date(fs.endTime).getTime();
  if (now < start)
    return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
  if (now > end)
    return { label: "Ended", color: "bg-red-100 text-red-700" };
  return { label: "Ongoing", color: "bg-green-100 text-green-700" };
};

export function FlashSalePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingData, setEditingData] = useState<
    (FlashSaleFormData & { id?: string }) | undefined
  >(undefined);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin_flash_sales", page],
    queryFn: async () => {
      const res = await apiClient.get<{ data: FlashSale[]; pagination: any }>(
        `/flash-sales?page=${page}&limit=10`,
      );
      return res;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/flash-sales/${id}`),
    onSuccess: () => {
      toast.success("Deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin_flash_sales"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FlashSaleFormData) =>
      apiClient.post("/flash-sales", data),
    onSuccess: () => {
      toast.success("Flash Sale created successfully!");
      setView("list");
      queryClient.invalidateQueries({ queryKey: ["admin_flash_sales"] });
    },
    onError: (err: any) => {
      console.error("CREATE FLASHSALE ERROR:", err.response?.data);
      toast.error(
        err.response?.data?.message || err.message || "Error creating Flash Sale",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FlashSaleFormData }) =>
      apiClient.put(`/flash-sales/${id}`, data),
    onSuccess: () => {
      toast.success("Flash Sale updated successfully!");
      setView("list");
      queryClient.invalidateQueries({ queryKey: ["admin_flash_sales"] });
    },
    onError: (err: any) => {
      console.error("UPDATE FLASHSALE ERROR:", err.response?.data);
      toast.error(
        err.response?.data?.message || err.message || "Error updating Flash Sale",
      );
    },
  });

  const handleOpenCreate = () => {
    setEditingData(undefined);
    setView("create");
  };

  const handleOpenEdit = (fs: FlashSale) => {
    setEditingData({
      id: fs.id,
      name: fs.name,
      startTime: fs.startTime,
      endTime: fs.endTime,
      isActive: fs.isActive,
      items: fs.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productImage: i.productImage,
        variantId: i.variantId,
        variantName: i.variantName,
        sku: (i as any).sku, // cast any because IFlashSaleItem type from API might not be updated here yet
        originalPrice: i.originalPrice,
        stock: i.quantityLimit, // Approximate actual stock for editing, wait no. Form expects current stock? We don't have current stock here but it's just for display.
        flashPrice: i.flashPrice,
        quantityLimit: i.quantityLimit,
      })),
    });
    setView("edit");
  };

  const handleFormSubmit = async (data: FlashSaleFormData) => {
    if (editingData) {
      updateMutation.mutate({ id: editingData.id!, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const flashSales = data?.data || [];
  const filteredFlashSales = flashSales.filter((fs) =>
    fs.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {view === "list" ? (
        <>
          <PageHeader
            title="Flash Sale"
            description="Manage flash sales and discounted items."
            actions={
              <Button
                className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
                size="sm"
                onClick={handleOpenCreate}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Flash Sale
              </Button>
            }
            filters={
              <div className="flex flex-col gap-3 w-full">
                <div className="group relative w-full sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search flash sale programs..."
                    className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
                  />
                </div>
              </div>
            }
          />

          <div className="premium-card rounded-sm overflow-hidden">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="w-[20%] text-left pl-4">Program Name</TableHead>
                  <TableHead className="w-[35%] text-center">Time</TableHead>
                  <TableHead className="w-[15%] text-center">Status</TableHead>
                  <TableHead className="w-[20%] text-center">Products</TableHead>
                  <TableHead className="w-[10%] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center ">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredFlashSales.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      {search
                        ? "No matching flash sales found"
                        : "No flash sales created yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlashSales.map((fs) => (
                    <TableRow key={fs.id}>
                      <TableCell className="font-medium pl-4">{fs.name}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {formatDate(fs.startTime)} - {formatDate(fs.endTime)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 rounded-sm text-xs font-medium uppercase ${getStatusLabel(fs).color
                            }`}
                        >
                          {getStatusLabel(fs).label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {(fs.items || []).length} items
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-ink-muted hover:text-ink"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(fs)}
                              className="cursor-pointer rounded-sm"
                            >
                              <Edit className="w-4 h-4 mr-2.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                              onClick={() => {
                                if (confirm("Delete this program?")) {
                                  deleteMutation.mutate(fs.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <FlashSaleEditor
          initialData={editingData}
          onSubmit={handleFormSubmit}
          onBack={() => setView("list")}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
