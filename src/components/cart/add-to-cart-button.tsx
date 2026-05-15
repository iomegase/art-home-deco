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

export function AddToCartButton({
  productId,
  productStock,
  analyticsProduct,
  disabled = false,
}: AddToCartButtonProps) {
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
  const isStockLimitReachedInCart = productStock > 0 && quantityInCart >= productStock;
  const isDisabled = disabled || isStockLimitReachedInCart;

  const buttonLabel = useMemo(() => {
    if (disabled) return "Produit indisponible";
    if (isStockLimitReachedInCart) return "Stock maximum atteint";
    return added ? "Ajouté au panier ✓" : "Ajouter au panier";
  }, [added, disabled, isStockLimitReachedInCart]);

  return (
    <div className="mt-8 flex flex-col gap-3">
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          const result = addCartItem(productId, 1, productStock);
          if (!result.ok) {
            setError("Stock maximum déjà atteint dans votre panier.");
            return;
          }
          trackAddToCart(analyticsProduct, 1);
          setAdded(true);
          setError(null);
        }}
        className="h-[52px] w-full bg-[#171717] text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#747b4f] disabled:cursor-not-allowed disabled:bg-[#b0a99a]"
      >
        {buttonLabel}
      </button>

      {added && (
        <Link
          href="/panier"
          className="flex h-[52px] w-full items-center justify-center border border-[#dedede] text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717] transition hover:border-[#171717]"
        >
          Voir le panier
        </Link>
      )}

      {!disabled && !isStockLimitReachedInCart && !error && (
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#b0a99a]">
          {remainingStock} unité{remainingStock > 1 ? "s" : ""} disponible{remainingStock > 1 ? "s" : ""}
        </p>
      )}

      {disabled && (
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#b0a99a]">
          Ce produit est actuellement indisponible.
        </p>
      )}

      {!disabled && isStockLimitReachedInCart && (
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#b0a99a]">
          Stock maximum atteint dans votre panier.
        </p>
      )}

      {error && (
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#bd6745]">{error}</p>
      )}
    </div>
  );
}
