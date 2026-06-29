import { apiClient } from "@/lib/client";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  stock: number;
  minStock: number;
  mac: number;
  // Brand — source of truth from product.brandId populate
  brandId?: string;
  brandName?: string;
  brandImage?: string;
  productImage?: string;
  expiringBatchesCount?: number;
  // Compat field
  supplier: string;
  lastUpdated: string;
}

export interface InventoryTransaction {
  id: string;
  sku: string;
  type: "in" | "out" | "adjustment";
  qty: number;
  user: string;
  date: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export function getSuppliers(): Promise<Supplier[]> {
  return apiClient
    .get<{ suppliers: any[] }>("/inventory/suppliers")
    .then((res) =>
      res.suppliers.map((s) => ({
        id: s._id || s.id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        address: s.address,
      })),
    );
}

export function createSupplier(data: Omit<Supplier, "id">): Promise<Supplier> {
  return apiClient
    .post<{ supplier: any }>("/inventory/suppliers", data)
    .then((res) => ({
      id: res.supplier._id || res.supplier.id,
      name: res.supplier.name,
      phone: res.supplier.phone,
      email: res.supplier.email,
      address: res.supplier.address,
    }));
}

export function getStockList(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ stock: InventoryItem[]; pagination: any }> {
  return apiClient
    .get<{
      stock: InventoryItem[];
      pagination: any;
    }>("/inventory/stock", params)
    .then((res) => res);
}

export function getTransactions(params: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<{ transactions: InventoryTransaction[]; pagination: any }> {
  return apiClient
    .get<{
      transactions: InventoryTransaction[];
      pagination: any;
    }>("/inventory/transactions", params)
    .then((res) => res);
}

export function createGoodsReceipt(data: {
  supplierId: string;
  items: {
    variantId: string;
    quantity: number;
    importPrice: number;
    batchCode?: string;
    manufactureDate?: string;
    expiryDate?: string;
  }[];
}): Promise<void> {
  return apiClient.post("/inventory/goods-receipts", data);
}

export function adjustStock(data: {
  variantId: string;
  actualStock: number;
  reason?: string;
}): Promise<void> {
  return apiClient.post("/inventory/stock/adjust", data);
}

export function updateMinStock(data: {
  variantId: string;
  minStock: number;
}): Promise<void> {
  return apiClient.patch("/inventory/stock/min-stock", data);
}

export interface BatchItem {
  _id: string;
  variantId: string;
  goodsReceiptId: string | null;
  batchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
  importPrice: number;
  originalQty: number;
  remainingQty: number;
  createdAt: string;
}

export function getVariantBatches(variantId: string): Promise<BatchItem[]> {
  return apiClient
    .get<{ batches: BatchItem[] }>(`/inventory/stock/${variantId}/batches`)
    .then((res) => res.batches);
}

export function updateBatch(
  batchId: string,
  data: Partial<BatchItem>,
): Promise<BatchItem> {
  return apiClient
    .put<{ batch: BatchItem }>(`/inventory/stock/batches/${batchId}`, data)
    .then((res) => res.batch);
}
