import * as z from "zod";

export const flashSaleItemSchema = z
  .object({
    productId: z.string().min(1, "Bắt buộc"),
    productName: z.string().optional(),
    productImage: z.string().optional(),
    variantId: z.string().min(1, "Bắt buộc"),
    variantName: z.string().optional(),
    sku: z.string().optional(),
    originalPrice: z.number().min(0, "Giá không hợp lệ"),
    stock: z.number().min(0, "Tồn kho không hợp lệ"),
    flashPrice: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    quantityLimit: z.coerce.number().min(1, "Số lượng bán phải lớn hơn 0"),
  })
  .superRefine((data, ctx) => {
    if (data.flashPrice >= data.originalPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giá Flash Sale phải thấp hơn giá gốc",
        path: ["flashPrice"],
      });
    }
    if (data.quantityLimit > data.stock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Số lượng bán không được vượt quá tồn kho thực tế",
        path: ["quantityLimit"],
      });
    }
  });

export const flashSaleSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên chương trình"),
    startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
    endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
    isActive: z.boolean().default(true),
    items: z
      .array(flashSaleItemSchema)
      .min(1, "Vui lòng chọn ít nhất một sản phẩm"),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu",
        path: ["endTime"],
      });
    }
  });

export type FlashSaleFormData = z.infer<typeof flashSaleSchema>;
