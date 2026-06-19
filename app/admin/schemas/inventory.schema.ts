import { z } from "zod";

export const restockSchema = z.object({
  supplierId: z.string().optional(),
  isNewSupplier: z.boolean().default(false),
  newSupplierName: z.string().optional(),
  newSupplierPhone: z.string().optional(),
  newSupplierEmail: z.string().optional(),
  newSupplierAddress: z.string().optional(),
  importPrice: z.coerce.number().min(1, "Giá nhập phải lớn hơn 0"),
  restockQty: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
}).superRefine((data, ctx) => {
  if (data.isNewSupplier) {
    if (!data.newSupplierName || data.newSupplierName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tên nhà cung cấp không được để trống",
        path: ["newSupplierName"],
      });
    }
    if (!data.newSupplierPhone || data.newSupplierPhone.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Số điện thoại không được để trống",
        path: ["newSupplierPhone"],
      });
    }
  } else {
    if (!data.supplierId || data.supplierId === "new") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn nhà cung cấp",
        path: ["supplierId"],
      });
    }
  }
});

export const adjustStockSchema = z.object({
  actualStock: z.coerce.number().min(0, "Tồn kho thực tế không hợp lệ"),
});

export type RestockFormData = z.infer<typeof restockSchema>;
export type AdjustStockFormData = z.infer<typeof adjustStockSchema>;
