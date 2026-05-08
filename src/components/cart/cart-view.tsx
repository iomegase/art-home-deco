"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackAddToCart, trackRemoveFromCart, trackViewItemList } from "@/lib/analytics/ecommerce";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
import { formatPriceCents } from "@/features/product/format";
import { readCart, updateCartItemQuantity, writeCart } from "@/features/cart/storage";
import { resolveShippingCostCents } from "@/features/shipping/rates";
import type { CartQuote } from "@/features/cart/types";

type ShippingMethod = "pickup" | "colissimo_home" | "colissimo_pickup";

export function CartView() {
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("pickup");
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartVersion, setCartVersion] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      const items = readCart();

      if (items.length === 0) {
        setQuote(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingMethod }),
      })
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error ?? "Panier invalide.");
          }
          setQuote(payload.quote);
          setError(null);
        })
        .catch((err: Error) => {
          setQuote(null);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    });
  }, [shippingMethod, cartVersion]);

function updateQuantity(productId: string, quantity: number) {
    const current = quote?.lines.find((line) => line.productId === productId);
    if (!current) {
      return;
    }

    if (quantity > current.stock) {
      setError("Quantite maximale atteinte pour ce produit.");
      return;
    }

    const result = updateCartItemQuantity(productId, quantity, current.stock);

    if (!result.ok) {
      setError("Quantite maximale atteinte pour ce produit.");
      return;
    }

    if (current) {
      const delta = quantity - current.quantity;
      const analyticsProduct = {
        item_id: current.productId,
        item_name: current.title,
        price: current.unitPriceCents / 100,
        quantity: Math.abs(delta),
        sku: current.sku,
      };

      if (delta > 0) {
        trackAddToCart(analyticsProduct, delta);
      } else if (delta < 0) {
        trackRemoveFromCart(analyticsProduct, Math.abs(delta));
      }
    }

    setError(null);
    setCartVersion((value) => value + 1);
  }

  const shippingOptions = useMemo(() => {
    const shippableItems = (quote?.lines ?? []).map((line) => ({
      shippingClass: line.shippingClass,
      pickupOnly: line.pickupOnly,
    }));

    const pickupOption = {
      value: "pickup" as const,
      label: "Retrait boutique gratuit",
      disabled: false,
    };

    const hasPickupOnlyItem = shippableItems.some((item) => item.pickupOnly || item.shippingClass === "PICKUP_ONLY");

    if (hasPickupOnlyItem) {
      return [
        pickupOption,
        {
          value: "colissimo_home" as const,
          label: "Colissimo domicile indisponible",
          disabled: true,
        },
        {
          value: "colissimo_pickup" as const,
          label: "Colissimo point retrait indisponible",
          disabled: true,
        },
      ];
    }

    const colissimoPriceCents = resolveShippingCostCents({
      shippingMethod: "colissimo_home",
      items: shippableItems,
    });
    const formattedColissimoPrice = formatPriceCents(colissimoPriceCents);

    return [
      pickupOption,
      {
        value: "colissimo_home" as const,
        label: `Colissimo domicile — ${formattedColissimoPrice}`,
        disabled: false,
      },
      {
        value: "colissimo_pickup" as const,
        label: `Colissimo point retrait — ${formattedColissimoPrice}`,
        disabled: false,
      },
    ];
  }, [quote?.lines]);

  if (loading) {
    return <p className="text-muted">Calcul du panier...</p>;
  }

  if (error) {
    return (
      <div className="border border-line bg-surface p-6">
        <p className="font-bold text-brand">{error}</p>
        <button type="button" onClick={() => writeCart([])} className="mt-4 text-sm font-bold underline">
          Vider le panier
        </button>
      </div>
    );
  }

  if (!quote || quote.lines.length === 0) {
    return (
      <div className="border border-line bg-surface p-8">
        <h2 className="font-serif text-3xl">Votre panier est vide</h2>
        <Link href="/boutique" className="mt-4 inline-flex bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
          Voir la boutique
        </Link>
      </div>
    );
  }

  const analyticsItems = quote.lines.map((line) => ({
    item_id: line.productId,
    item_name: line.title,
    price: line.unitPriceCents / 100,
    quantity: line.quantity,
    sku: line.sku,
  }));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <TrackCartView products={analyticsItems} />
      <section className="grid gap-5">
        {quote.lines.map((line) => (
          <article key={line.productId} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-line pb-5">
            <div className="relative aspect-square bg-surface">
              <ProductImageFallback src={line.imageUrl} alt={line.title} fill sizes="96px" className="object-cover" />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <Link href={`/boutique/${line.slug}`} className="font-serif text-2xl hover:text-terracotta">
                  {line.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{line.sku}</p>
                <p className="mt-2 text-sm font-bold">{formatPriceCents(line.unitPriceCents)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                  className="h-9 w-9 border border-line"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                  disabled={line.quantity >= line.stock}
                  className="h-9 w-9 border border-line disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit border border-line bg-surface p-6">
        <h2 className="font-serif text-3xl">Resume</h2>
        <label className="mt-5 block text-sm font-bold">
          Livraison
          <select
            value={shippingMethod}
            onChange={(event) => setShippingMethod(event.target.value as ShippingMethod)}
            className="mt-2 w-full border border-line bg-background px-3 py-2"
          >
            {shippingOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-xs text-muted">
          Les tarifs Colissimo s&apos;adaptent automatiquement a la classe logistique la plus elevee du panier.
        </p>
        <div className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPriceCents(quote.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Livraison</span>
            <span>{formatPriceCents(quote.shippingCostCents)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
            <span>Total</span>
            <span>{formatPriceCents(quote.totalCents)}</span>
          </div>
        </div>
        <Link
          href={`/checkout?shipping=${shippingMethod}`}
          className="mt-6 flex w-full justify-center bg-brand px-5 py-3 text-sm font-bold text-brand-contrast"
        >
          Passer au paiement
        </Link>
      </aside>
    </div>
  );
}

function TrackCartView({ products }: { products: Array<{ item_id: string; item_name: string; price: number; quantity: number; sku: string }> }) {
  useEffect(() => {
    trackViewItemList(products, "panier");
  }, [products]);

  return null;
}
