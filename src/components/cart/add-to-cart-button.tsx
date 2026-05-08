"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackAddToCart } from "@/lib/analytics/ecommerce";
import { getCartQuantityForProduct } from "@/features/cart/limits";
import type { AnalyticsProduct } from "@/types/analytics";
import { addCartItem, readCart } from "@/features/cart/storage";

type AddToCartButtonProps = {
  productId: string;
  productStock: number;
  analyticsProduct: AnalyticsProduct;
  disabled?: boolean;
};

export function AddToCartButton({ productId, productStock, analyticsProduct, disabled = false }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantityInCart, setQuantityInCart] = useState(0);

  useEffect(() => {
    const syncCartQuantity = () => {
      setQuantityInCart(getCartQuantityForProduct(readCart(), productId));
    };

    syncCartQuantity();
    window.addEventListener("cart-updated", syncCartQuantity);
    window.addEventListener("storage", syncCartQuantity);

    return () => {
      window.removeEventListener("cart-updated", syncCartQuantity);
      window.removeEventListener("storage", syncCartQuantity);
    };
  }, [productId]);

  const remainingStock = Math.max(0, productStock - quantityInCart);
  const isStockLimitReached = remainingStock <= 0;
  const isDisabled = disabled || isStockLimitReached;
  const buttonLabel = useMemo(() => {
    if (disabled) {
      return "Produit indisponible";
    }

    if (isStockLimitReached) {
      return "Stock maximum atteint";
    }

    return added ? "Ajoute au panier" : "Ajouter au panier";
  }, [added, disabled, isStockLimitReached]);

  return (
    <div className="mt-8 grid gap-3">
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          const result = addCartItem(productId, 1, productStock);

          if (!result.ok) {
            setError("Stock maximum deja atteint dans votre panier.");
            return;
          }

          trackAddToCart(analyticsProduct, 1);
          setAdded(true);
          setError(null);
        }}
        className="w-full bg-brand px-6 py-4 text-sm font-bold text-brand-contrast transition hover:bg-terracotta disabled:cursor-not-allowed disabled:bg-muted"
      >
        {buttonLabel}
      </button>
      {isStockLimitReached ? (
        <p className="text-sm font-bold text-muted">Stock maximum deja atteint dans votre panier.</p>
      ) : (
        <p className="text-sm text-muted">
          {remainingStock} unite{remainingStock > 1 ? "s" : ""} encore ajoutable{remainingStock > 1 ? "s" : ""} au panier.
        </p>
      )}
      {error ? <p className="text-sm font-bold text-muted">{error}</p> : null}
      {added ? (
        <Link
          href="/panier"
          className="w-full border border-line px-6 py-4 text-center text-sm font-bold hover:border-brand"
        >
          Voir le panier
        </Link>
      ) : null}
    </div>
  );
}
