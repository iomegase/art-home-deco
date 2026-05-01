export type StockCheckResult = {
  productId: string;
  requestedQuantity: number;
  available: boolean;
  availableQuantity: number;
  source: "local" | "shopcaisse";
};

export interface StockProviderService {
  checkAvailability(items: Array<{ productId: string; quantity: number }>): Promise<StockCheckResult[]>;
}
