"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackAddToCart, trackRemoveFromCart, trackViewItemList } from "@/lib/analytics/ecommerce";
import { formatPriceCents } from "@/features/product/format";
import { readCart, writeCart } from "@/features/cart/storage";
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

    const nextItems = readCart()
      .map((item) => (item.productId === productId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    writeCart(nextItems);
    setCartVersion((value) => value + 1);
  }

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
              {line.imageUrl ? (
                <Image src={line.imageUrl} alt="" fill sizes="96px" className="object-cover" />
              ) : null}
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
                  className="h-9 w-9 border border-line"
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
            <option value="pickup">Retrait boutique gratuit</option>
            <option value="colissimo_home">Colissimo domicile</option>
            <option value="colissimo_pickup">Colissimo point retrait</option>
          </select>
        </label>
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
