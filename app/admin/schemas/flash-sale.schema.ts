import * as z from "zod";

export const flashSaleItemSchema = z
  .object({
    productId: z.string().min(1, "Required"),
    productName: z.string().optional(),
    productImage: z.string().optional(),
    variantId: z.string().min(1, "Required"),
    variantName: z.string().optional(),
    sku: z.string().optional(),
    originalPrice: z.number().min(0, "Invalid price"),
    stock: z.number().min(0, "Invalid stock value"),
    flashPrice: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
    quantityLimit: z.coerce.number().min(1, "Quantity sold must be greater than 0"),
  })
  .superRefine((data, ctx) => {
    if (data.flashPrice >= data.originalPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Flash sale price must be lower than the original price",
        path: ["flashPrice"],
      });
    }
    if (data.quantityLimit > data.stock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity sold cannot exceed actual stock",
        path: ["quantityLimit"],
      });
    }
  });

export const flashSaleSchema = z
  .object({
    name: z.string().min(1, "Please enter a program name"),
    startTime: z.string().min(1, "Please select a start time"),
    endTime: z.string().min(1, "Please select an end time"),
    isActive: z.boolean().default(true),
    items: z
      .array(flashSaleItemSchema)
      .min(1, "Please select at least one product"),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be later than start time",
        path: ["endTime"],
      });
    }
  });

export type FlashSaleFormData = z.infer<typeof flashSaleSchema>;
