import { trackEcommerceEvent } from "@/lib/analytics/ga4";
import type { AnalyticsCart, AnalyticsOrder, AnalyticsProduct } from "@/types/analytics";

function toEcommerce(items: AnalyticsProduct[], currency: "EUR", value?: number): AnalyticsCart {
  return {
    currency,
    value: value ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    items,
  };
}

export function trackViewItem(product: AnalyticsProduct) {
  trackEcommerceEvent("view_item", toEcommerce([product], "EUR"));
}

export function trackViewItemList(products: AnalyticsProduct[], listName: string) {
  trackEcommerceEvent("view_item_list", {
    ...toEcommerce(products, "EUR"),
    item_list_name: listName,
  });
}

export function trackSelectItem(product: AnalyticsProduct) {
  trackEcommerceEvent("select_item", toEcommerce([product], "EUR"));
}

export function trackAddToCart(product: AnalyticsProduct, quantity: number) {
  trackEcommerceEvent("add_to_cart", toEcommerce([{ ...product, quantity }], "EUR"));
}

export function trackRemoveFromCart(product: AnalyticsProduct, quantity: number) {
  trackEcommerceEvent("remove_from_cart", toEcommerce([{ ...product, quantity }], "EUR"));
}

export function trackBeginCheckout(cart: AnalyticsCart) {
  trackEcommerceEvent("begin_checkout", cart);
}

export function trackAddShippingInfo(cart: AnalyticsCart, shippingMethod: string) {
  trackEcommerceEvent("add_shipping_info", {
    ...cart,
    shipping_tier: shippingMethod,
  });
}

export function trackAddPaymentInfo(cart: AnalyticsCart, paymentMethod: string) {
  trackEcommerceEvent("add_payment_info", {
    ...cart,
    payment_type: paymentMethod,
  });
}

export function trackPurchase(order: AnalyticsOrder) {
  trackEcommerceEvent("purchase", order);
}
