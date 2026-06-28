import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Package,
  Percent,
  CheckSquare,
  Info,
  CalendarClock,
  PackageSearch,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  flashSaleSchema,
  FlashSaleFormData,
} from "@/admin/schemas/flash-sale.schema";
import { formatCurrency } from "@/lib/utils";
import { ProductSelectModal } from "./ProductSelectModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceInput } from "@/components/ui/price-input";

interface FlashSaleEditorProps {
  initialData?: FlashSaleFormData & { id?: string };
  onSubmit: (data: FlashSaleFormData) => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function FlashSaleEditor({
  initialData,
  onSubmit,
  onBack,
  isSubmitting,
}: FlashSaleEditorProps) {
  const isEditing = !!initialData?.id;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const form = useForm<FlashSaleFormData>({
    resolver: zodResolver(flashSaleSchema),
    defaultValues: initialData || {
      name: "",
      startTime: "",
      endTime: "",
      isActive: true,
      items: [],
    },
  });

  const [bulkDiscount, setBulkDiscount] = useState<string>("");
  const [bulkQuantity, setBulkQuantity] = useState<string>("");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSelectVariants = (variants: any[]) => {
    const currentIds = fields.map((f) => f.variantId);
    const newIds = variants.map((v) => v.variantId);

    // Remove items that were unchecked in the modal
    const idsToRemove = currentIds.filter((id) => !newIds.includes(id));
    idsToRemove.forEach((id) => {
      const index = fields.findIndex((f) => f.variantId === id);
      if (index !== -1) remove(index);
    });

    // Add new items that were checked in the modal
    const variantsToAdd = variants.filter(
      (v) => !currentIds.includes(v.variantId),
    );
    variantsToAdd.forEach((v) => {
      append({
        productId: v.productId,
        productName: v.productName,
        productImage: v.productImage,
        variantId: v.variantId,
        variantName: v.variantName,
        sku: v.sku,
        originalPrice: v.originalPrice,
        flashPrice: v.originalPrice,
        quantityLimit: 1,
        stock: v.stock,
      });
    });
  };

  const handleBulkApply = () => {
    const discount = parseFloat(bulkDiscount);
    const qty = parseInt(bulkQuantity);

    fields.forEach((field, index) => {
      if (!isNaN(discount) && discount >= 0 && discount <= 100) {
        const flashPrice = field.originalPrice * (1 - discount / 100);
        // Làm tròn đến hàng nghìn đồng (VD: 383.200 -> 383.000)
        form.setValue(
          `items.${index}.flashPrice`,
          Math.round(flashPrice / 1000) * 1000,
        );
      }
      if (!isNaN(qty) && qty > 0) {
        form.setValue(`items.${index}.quantityLimit`, qty);
      }
    });
  };

  const handleSubmit = async (data: FlashSaleFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="max-w-5xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isEditing ? "Cập nhật Flash Sale" : "Tạo Flash Sale Mới"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Thiết lập chiến dịch giảm giá giới hạn thời gian một cách nhanh
            chóng.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit as any)}
          className="space-y-6"
        >
          {/* Khối 1: Thông tin cơ bản */}
          <Card className="shadow-sm rounded-sm border hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 space-y-1">
                      <FormLabel className="text-sm font-bold">
                        Tên chương trình{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Siêu Sale Giữa Tháng"
                          className="bg-muted border-0 rounded-sm focus-visible:ring-1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-sm border p-4 md:col-span-2 bg-muted/10">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-bold">
                          Kích hoạt chương trình
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Sẽ tự động chạy khi đến "Thời gian bắt đầu".
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Khối 2: Thời gian */}
          <Card className="shadow-sm rounded-sm border hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-primary" />
                Thời gian diễn ra
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as any}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-bold">
                        Thời gian bắt đầu{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-bold">
                        Thời gian kết thúc{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Khối 3: Sản phẩm */}
          <Card className="shadow-sm rounded-sm border hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
            <CardHeader className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <PackageSearch className="w-5 h-5 text-primary" />
                  Sản phẩm tham gia
                </CardTitle>
              </div>
              {fields.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductModalOpen(true)}
                  className="shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {form.formState.errors.items && (
                <p className="text-sm font-medium text-destructive mb-4">
                  {form.formState.errors.items.message}
                </p>
              )}

              {fields.length === 0 ? (
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/5 hover:bg-muted/10 transition-colors">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">
                    Chưa có sản phẩm nào
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    Hãy thêm sản phẩm vào chương trình để thiết lập giá Flash
                    Sale và kích hoạt ưu đãi.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIsProductModalOpen(true)}
                    className="shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm ngay
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 rounded-sm border flex flex-col sm:flex-row items-end gap-6 mb-2">
                    <div className="space-y-2 flex-1 sm:max-w-[220px]">
                      {/* eslint-disable-next-line  */}
                      <label className="text-sm font-bold flex items-center gap-2">
                        <Percent className="w-4 h-4 text-muted-foreground" />
                        Giảm giá đồng loạt
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="VD: 15, 20, 50..."
                        value={bulkDiscount}
                        onChange={(e) => setBulkDiscount(e.target.value)}
                        className="bg-muted border-0 rounded-sm focus-visible:ring-1"
                      />
                    </div>
                    <div className="space-y-2 flex-1 sm:max-w-[220px]">
                      {/* eslint-disable-next-line  */}
                      <label className="text-sm font-bold flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        Số lượng Flash Sale
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Nhập số lượng..."
                        value={bulkQuantity}
                        onChange={(e) => setBulkQuantity(e.target.value)}
                        className="bg-muted border-0 rounded-sm focus-visible:ring-1"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleBulkApply}
                      className="gap-2 w-full sm:w-auto bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-none font-bold px-6 shadow-sm"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Áp dụng tất cả
                    </Button>
                  </div>

                  <div className="border rounded-sm overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead className="whitespace-nowrap text-center">
                            Giá gốc
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-center">
                            Tồn Kho
                          </TableHead>
                          <TableHead className="w-[180px] whitespace-nowrap text-center">
                            Giá Flash Sale
                          </TableHead>
                          <TableHead className="w-[150px] whitespace-nowrap text-center">
                            SL Flash Sale
                          </TableHead>
                          <TableHead className="w-12 text-center"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <img
                                  src={field.productImage || "/placeholder.jpg"}
                                  alt={field.variantName}
                                  className="w-10 h-10 rounded border object-cover"
                                />
                                <div>
                                  <div className="font-medium text-sm line-clamp-1">
                                    {field.productName}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap text-center">
                              {formatCurrency(field.originalPrice)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-center">
                              {field.stock}
                            </TableCell>
                            <TableCell className="text-center">
                              <FormField
                                control={form.control as any}
                                name={`items.${index}.flashPrice`}
                                render={({ field: inputField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <PriceInput
                                        value={inputField.value}
                                        onChange={inputField.onChange}
                                        placeholder="0"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <FormField
                                control={form.control as any}
                                name={`items.${index}.quantityLimit`}
                                render={({ field: inputField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        className="h-9"
                                        min={1}
                                        {...inputField}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(
                                            /\D/g,
                                            "",
                                          );
                                          inputField.onChange(val);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[150px] shadow-sm bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-none font-bold"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Lưu thay đổi" : "Tạo chương trình"}
            </Button>
          </div>
        </form>
      </Form>

      <ProductSelectModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        initialSelectedVariants={fields.map((f) => ({
          productId: f.productId,
          productName: f.productName,
          productImage: f.productImage,
          variantId: f.variantId,
          variantName: f.variantName,
          sku: f.sku,
          originalPrice: f.originalPrice,
          stock: f.stock,
        }))}
        onConfirm={handleSelectVariants}
      />
    </div>
  );
}
