export type InventoryItem = {
  id: string | number;
  productId: string | number;
  sku: string;
  productTitle: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  lowStockThreshold: number;
  updatedAt: string;
};
