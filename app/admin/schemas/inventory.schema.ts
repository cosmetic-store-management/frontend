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
    batchCode: z.string().min(1, "Batch code is required"),
    manufactureDate: z.coerce.date({
      message: "Please select a manufacture date",
    }),
    expiryDate: z.coerce.date({
      message: "Please select an expiry date",
    }),
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
  });

export const adjustStockSchema = z.object({
  actualStock: z.coerce.number().min(0, "Invalid actual stock"),
  minStock: z.coerce.number().min(0, "Minimum stock cannot be negative"),
  reason: z.string().trim().optional(),
});

export type RestockFormData = z.infer<typeof restockSchema>;
export type AdjustStockFormData = z.infer<typeof adjustStockSchema>;
