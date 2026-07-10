import { z } from "zod";

export const restockSchema = z
  .object({
    supplierId: z.string().optional(),
    isNewSupplier: z.boolean().default(false),
    newSupplierName: z.string().optional(),
    newSupplierPhone: z.string().optional(),
    newSupplierEmail: z.string().optional(),
    newSupplierAddress: z.string().optional(),
    importPrice: z.coerce.number().min(1, "Import price must be greater than 0"),
    restockQty: z.coerce.number().min(1, "Quantity must be greater than 0"),
    batchCode: z.string().trim().optional(),
    manufactureDate: z.preprocess((val) => {
      if (!val || val === "" || val === null) return undefined;
      return new Date(val as string);
    }, z.date().optional()),
    expiryDate: z.preprocess((val) => {
      if (!val || val === "" || val === null) return undefined;
      return new Date(val as string);
    }, z.date().optional()),
  })
  .superRefine((data, ctx) => {
    if (data.isNewSupplier) {
      if (!data.newSupplierName || data.newSupplierName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supplier name is required",
          path: ["newSupplierName"],
        });
      }
      if (!data.newSupplierPhone || data.newSupplierPhone.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number is required",
          path: ["newSupplierPhone"],
        });
      }
    } else {
      if (!data.supplierId || data.supplierId === "new") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a supplier",
          path: ["supplierId"],
        });
      }
    }

    if (data.manufactureDate && data.expiryDate) {
      if (data.expiryDate <= data.manufactureDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry date must be after manufacture date",
          path: ["expiryDate"],
        });
      }
    }
  });

export const adjustStockSchema = z.object({
  actualStock: z.coerce.number().min(0, "Invalid actual stock"),
  minStock: z.coerce.number().min(0, "Minimum stock cannot be negative"),
  reason: z.string().trim().optional(),
});

export type RestockFormData = z.infer<typeof restockSchema>;
export type AdjustStockFormData = z.infer<typeof adjustStockSchema>;
