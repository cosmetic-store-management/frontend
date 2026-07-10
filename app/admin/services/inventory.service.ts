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
  businessType: "Item Receipt" | "Item Fulfillment" | "Inventory Adjustment" | "Customer Return";
  qty: number;
  user: string;
  date: string;
  productName?: string;
  productImage?: string;
  barcode?: string;
  price?: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  taxCode?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactPosition?: string;
  isActive?: boolean;
  notes?: string;
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
        taxCode: s.taxCode,
        contactPerson: s.contactPerson,
        contactPhone: s.contactPhone,
        contactEmail: s.contactEmail,
        contactPosition: s.contactPosition,
        isActive: s.isActive,
        notes: s.notes,
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
      taxCode: res.supplier.taxCode,
      contactPerson: res.supplier.contactPerson,
      contactPhone: res.supplier.contactPhone,
      contactEmail: res.supplier.contactEmail,
      contactPosition: res.supplier.contactPosition,
      isActive: res.supplier.isActive,
      notes: res.supplier.notes,
    }));
}

export function updateSupplier(
  id: string,
  data: Partial<Omit<Supplier, "id">>,
): Promise<Supplier> {
  return apiClient
    .put<{ supplier: any }>(`/inventory/suppliers/${id}`, data)
    .then((res) => ({
      id: res.supplier._id || res.supplier.id,
      name: res.supplier.name,
      phone: res.supplier.phone,
      email: res.supplier.email,
      address: res.supplier.address,
      taxCode: res.supplier.taxCode,
      contactPerson: res.supplier.contactPerson,
      contactPhone: res.supplier.contactPhone,
      contactEmail: res.supplier.contactEmail,
      contactPosition: res.supplier.contactPosition,
      isActive: res.supplier.isActive,
      notes: res.supplier.notes,
    }));
}

export function deleteSupplier(id: string): Promise<void> {
  return apiClient.delete(`/inventory/suppliers/${id}`);
}

export function getStockList(params: {
  search?: string;
  page?: number;
  limit?: number;
  stockStatus?: string;
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
  variantId?: string;
}): Promise<{ transactions: InventoryTransaction[]; pagination: any }> {
  return apiClient
    .get<{
      transactions: any[];
      pagination: any;
    }>("/inventory/transactions", params)
    .then((res) => ({
      transactions: res.transactions.map((tx) => ({
        id: tx.id,
        sku: tx.sku,
        type: tx.type,
        businessType:
          tx.id.startsWith("TXRET")
            ? "Customer Return"
            : tx.type === "in"
              ? "Item Receipt"
              : tx.type === "out"
                ? "Item Fulfillment"
                : "Inventory Adjustment",
        productName: tx.productName,
        productImage: tx.productImage,
        barcode: tx.barcode,
        price: tx.price,
        qty: tx.qty,
        user: tx.user,
        date: tx.date,
      })),
      pagination: res.pagination,
    }));
}

export interface GoodsReceiptItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  importPrice: number;
  barcode?: string;
  productImage?: string;
}

export interface GoodsReceipt {
  id: string;
  code: string;
  supplierId: string;
  supplierName?: string;
  items: GoodsReceiptItem[];
  totalAmount: number;
  creatorId: string;
  creatorName?: string;
  createdAt: string;
}

export interface StocktakeItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  systemQty: number;
  actualQty: number;
  variance: number;
}

export interface Stocktake {
  id: string;
  code: string;
  items: StocktakeItem[];
  totalVarianceQty: number;
  totalAdjustmentValue: number;
  creatorId: string;
  creatorName?: string;
  notes?: string;
  createdAt: string;
}

export function getGoodsReceipts(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ receipts: GoodsReceipt[]; pagination: any }> {
  return apiClient.get("/inventory/goods-receipts", params);
}

export function getGoodsReceiptDetail(id: string): Promise<GoodsReceipt> {
  return apiClient.get(`/inventory/goods-receipts/${id}`);
}

export function getStocktakes(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ stocktakes: Stocktake[]; pagination: any }> {
  return apiClient.get("/inventory/stocktakes", params);
}

export function getStocktakeDetail(id: string): Promise<Stocktake> {
  return apiClient.get(`/inventory/stocktakes/${id}`);
}

export function createStocktake(data: {
  items: { variantId: string; actualQty: number }[];
  notes?: string;
}): Promise<Stocktake> {
  return apiClient.post("/inventory/stocktakes", data);
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

export function getInventoryStats(): Promise<{
  totalSKUs: number;
  totalValue: number;
  outOfStock: number;
  lowStock: number;
}> {
  return apiClient.get("/inventory/stats");
}
