"use client";

import Link from "next/link";
import { useState } from "react";
import { addCartItem } from "@/features/cart/storage";

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartButton({ productId, disabled = false }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-8 grid gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          addCartItem(productId, 1);
          setAdded(true);
        }}
        className="w-full bg-brand px-6 py-4 text-sm font-bold text-brand-contrast transition hover:bg-terracotta disabled:cursor-not-allowed disabled:bg-muted"
      >
        {disabled ? "Produit indisponible" : added ? "Ajoute au panier" : "Ajouter au panier"}
      </button>
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
