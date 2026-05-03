# Customer Tracking and Admin Clients Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter le suivi client invité par token, un onglet admin `Clients`, les nouveaux statuts logistiques et la préparation d’étiquette à imprimer, sans introduire d’auth client.

**Architecture:** Une nouvelle entité `Customer` devient la base de rattachement des commandes. Chaque commande payée reçoit un `trackingToken` opaque et des métadonnées logistiques. Le client consulte sa commande via `/commande/suivi/[token]`, tandis que l’admin dispose d’une vue `Clients` agrégée et d’un accès détaillé à l’historique des commandes.

**Tech Stack:** Next.js 16 App Router, Prisma 6, Neon Postgres, Stripe, Resend, TypeScript, Zod

---

### Task 1: Étendre le modèle Prisma pour Customer et le suivi commande

**Files:**
- Modify: `prisma/schema.prisma`
- Test: `npx prisma validate`, `npm run db:generate`, `npm run db:push`

- [ ] **Step 1: Add the Customer model and order fields in the schema**

Ajouter dans `prisma/schema.prisma` :

```prisma
model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders Order[]
}
```

Étendre `Order` avec :

```prisma
customerId            String?
trackingToken         String?   @unique
trackingTokenExpiresAt DateTime?
shippingAddressLine1  String?
shippingAddressLine2  String?
shippingPostalCode    String?
shippingCity          String?
shippingCountry       String?
carrier               String?
labelUrl              String?
labelGeneratedAt      DateTime?
shippedAt             DateTime?
deliveredAt           DateTime?
```

Et la relation :

```prisma
customer Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
```

- [ ] **Step 2: Extend order status values in code assumptions**

Le schéma reste en `String`, mais les valeurs métier à utiliser ensuite seront :
- `pending`
- `paid`
- `validated`
- `label_ready`
- `shipped`
- `delivered`
- `cancelled`

- [ ] **Step 3: Validate Prisma schema**

Run: `npx prisma validate`
Expected: schema valid

- [ ] **Step 4: Generate Prisma client**

Run: `npm run db:generate`
Expected: Prisma client generated successfully

- [ ] **Step 5: Push schema to Neon**

Run: `npm run db:push`
Expected: new tables/columns created successfully

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add customer and order tracking fields"
```

### Task 2: Ajouter les helpers Customer et token de suivi

**Files:**
- Create: `src/server/services/customer/customer.service.ts`
- Create: `src/server/services/customer/tracking-token.ts`
- Test: local node/prisma verification through app flows

- [ ] **Step 1: Implement tracking token generator**

Créer `src/server/services/customer/tracking-token.ts` avec :

```ts
import { randomBytes } from "node:crypto";

export function createTrackingToken() {
  return randomBytes(24).toString("base64url");
}
```

- [ ] **Step 2: Implement customer upsert service**

Créer `src/server/services/customer/customer.service.ts` avec une fonction :

```ts
import { db } from "@/server/db/client";

export async function findOrCreateCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  return db.customer.upsert({
    where: { email: input.email },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    },
    create: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/server/services/customer
git commit -m "feat: add customer and tracking token services"
```

### Task 3: Rattacher les commandes au Customer et générer le suivi

**Files:**
- Modify: `src/server/use-cases/create-checkout-session.use-case.ts`
- Modify: `src/server/use-cases/handle-stripe-webhook.use-case.ts`
- Test: Stripe local flow

- [ ] **Step 1: Add provisional tracking token on order creation**

Dans `createCheckoutSessionUseCase`, lors du `db.order.create`, ajouter :

```ts
trackingToken: createTrackingToken(),
carrier: quote.shippingMethod === "pickup" ? null : "colissimo",
```

Importer `createTrackingToken`.

- [ ] **Step 2: Link or create customer after payment confirmation**

Dans `handle-stripe-webhook.use-case.ts`, sur `checkout.session.completed`, appeler :

```ts
const customer = await findOrCreateCustomer({
  email: order.customerEmail,
  firstName: order.customerFirstName,
  lastName: order.customerLastName,
  phone: order.customerPhone ?? undefined,
});
```

Puis mettre à jour la commande :

```ts
customerId: customer.id,
orderStatus: "paid",
```

- [ ] **Step 3: Ensure token exists for legacy orders if missing**

Toujours dans le webhook, avant update final :

```ts
trackingToken: order.trackingToken ?? createTrackingToken(),
```

- [ ] **Step 4: Run local verification through Stripe webhook path**

Run an existing local Stripe payment flow.
Expected: paid order has `customerId` and `trackingToken`

- [ ] **Step 5: Commit**

```bash
git add src/server/use-cases/create-checkout-session.use-case.ts src/server/use-cases/handle-stripe-webhook.use-case.ts
git commit -m "feat: link paid orders to customers"
```

### Task 4: Ajouter l’email client avec lien de suivi et le message succès

**Files:**
- Modify: `src/server/services/email.service.ts`
- Create: `src/emails/templates/order-tracking-link.ts`
- Modify: `src/server/use-cases/handle-stripe-webhook.use-case.ts`
- Modify: `src/app/(public)/commande/success/page.tsx`
- Test: local Stripe flow + HTML checks

- [ ] **Step 1: Add tracking link email template**

Créer `src/emails/templates/order-tracking-link.ts` avec un template qui contient :
- numéro de commande
- phrase de confirmation paiement
- lien `/commande/suivi/[token]`

- [ ] **Step 2: Send tracking email after successful payment**

Dans `handle-stripe-webhook.use-case.ts`, envoyer l’email avec :

```ts
const trackingUrl = `${env.NEXT_PUBLIC_APP_URL}/commande/suivi/${trackingToken}`;
```

- [ ] **Step 3: Update success page copy**

Dans `src/app/(public)/commande/success/page.tsx`, afficher explicitement :

```tsx
Votre paiement a été validé. Un email de confirmation vous a été envoyé.
```

- [ ] **Step 4: Verify success page and email flow**

Run: local Stripe flow
Expected:
- order paid
- success page message visible
- email service called without blocking webhook

- [ ] **Step 5: Commit**

```bash
git add src/emails/templates/order-tracking-link.ts src/server/services/email.service.ts src/server/use-cases/handle-stripe-webhook.use-case.ts src/app/(public)/commande/success/page.tsx
git commit -m "feat: send order tracking email after payment"
```

### Task 5: Ajouter la page client de suivi invité

**Files:**
- Create: `src/app/(public)/commande/suivi/[token]/page.tsx`
- Create: `src/server/repositories/customer-order.repository.ts`
- Test: route rendering with valid and invalid token

- [ ] **Step 1: Add repository for order lookup by tracking token**

Créer `src/server/repositories/customer-order.repository.ts` avec :

```ts
import { db } from "@/server/db/client";

export async function getOrderByTrackingToken(token: string) {
  return db.order.findUnique({
    where: { trackingToken: token },
    include: { items: true },
  });
}
```

- [ ] **Step 2: Create the public tracking page**

Créer `src/app/(public)/commande/suivi/[token]/page.tsx`.

Affichage minimal :
- numéro de commande
- statut commande
- transporteur
- tracking
- total
- lignes de commande
- adresse de livraison si présente

Si token invalide :
- `notFound()` ou message neutre `Commande introuvable`

- [ ] **Step 3: Add client-facing status mapping**

Dans la page ou un helper dédié, mapper :
- `paid` -> `Paiement confirmé`
- `validated` -> `Commande validée`
- `label_ready` -> `Étiquette prête`
- `shipped` -> `Expédiée`
- `delivered` -> `Livrée`
- `cancelled` -> `Annulée`

- [ ] **Step 4: Verify tracking route manually**

Run: open `/commande/suivi/<token>` with a real token from a paid order
Expected: page renders correct order details

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/commande/suivi/[token]/page.tsx src/server/repositories/customer-order.repository.ts
git commit -m "feat: add guest order tracking page"
```

### Task 6: Ajouter l’admin Clients

**Files:**
- Create: `src/server/repositories/customer.repository.ts`
- Create: `src/app/admin/(protected)/clients/page.tsx`
- Create: `src/app/admin/(protected)/clients/[id]/page.tsx`
- Modify: `src/app/admin/(protected)/layout.tsx`
- Modify: `src/app/admin/(protected)/page.tsx`
- Test: HTTP checks with admin cookie

- [ ] **Step 1: Add repository for customers list**

Créer `src/server/repositories/customer.repository.ts` avec :

```ts
import { db } from "@/server/db/client";

export async function listCustomersAdmin() {
  const customers = await db.customer.findMany({
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return customers.map((customer) => ({
    ...customer,
    orderCount: customer.orders.length,
    totalSpentCents: customer.orders.reduce((sum, order) => sum + order.totalCents, 0),
    lastOrderAt: customer.orders[0]?.createdAt ?? null,
  }));
}
```

- [ ] **Step 2: Add repository for customer detail**

Dans le même fichier, ajouter :

```ts
export async function getCustomerAdmin(id: string) {
  return db.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });
}
```

- [ ] **Step 3: Create admin customers list page**

Créer `/admin/clients` avec colonnes :
- prénom
- nom
- email
- téléphone
- nb commandes
- total cumulé
- dernière commande

- [ ] **Step 4: Create admin customer detail page**

Créer `/admin/clients/[id]` avec :
- identité
- coordonnées
- liste détaillée des commandes
- lignes, montants, statuts, tracking

- [ ] **Step 5: Add navigation links**

Mettre à jour :
- `src/app/admin/(protected)/layout.tsx`
- `src/app/admin/(protected)/page.tsx`

Ajouter l’entrée `Clients`.

- [ ] **Step 6: Verify admin routes**

Expected:
- `/admin/clients` redirects when anonymous
- `/admin/clients` renders with admin session
- `/admin/clients/[id]` renders real history

- [ ] **Step 7: Commit**

```bash
git add src/server/repositories/customer.repository.ts src/app/admin/(protected)/clients src/app/admin/(protected)/layout.tsx src/app/admin/(protected)/page.tsx
git commit -m "feat: add admin customers views"
```

### Task 7: Ajouter le bouton admin Imprimer l’étiquette et les nouveaux statuts

**Files:**
- Modify: `src/app/admin/(protected)/orders/[id]/page.tsx`
- Modify: any order update actions or server actions handling status changes
- Test: order detail rendering

- [ ] **Step 1: Extend admin order detail UI for logistics fields**

Afficher dans `/admin/orders/[id]` :
- `carrier`
- `labelUrl`
- `labelGeneratedAt`
- `shippedAt`
- `deliveredAt`

- [ ] **Step 2: Add print label button behavior**

Si `labelUrl` existe, afficher :

```tsx
<a href={labelUrl} target="_blank" rel="noreferrer">Imprimer l’étiquette</a>
```

Sinon afficher un état désactivé ou `Étiquette non disponible`.

- [ ] **Step 3: Add validated and label_ready as accepted manual statuses**

Dans les contrôles admin existants, autoriser :
- `validated`
- `label_ready`
- `shipped`
- `delivered`
- `cancelled`

- [ ] **Step 4: Verify admin order detail**

Expected:
- no regression on existing order page
- new statuses display cleanly
- print label link only shown when available

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/(protected)/orders/[id]/page.tsx
git commit -m "feat: extend admin orders with label and logistics states"
```

### Task 8: Revalidation complète du flux

**Files:**
- No code changes expected unless regression appears
- Test: local functional checks end-to-end

- [ ] **Step 1: Run static verification**

Run:
```bash
npm run typecheck
npm run lint
npm run build
```
Expected: all pass

- [ ] **Step 2: Verify payment-confirmed flow**

Run local Stripe test.
Expected:
- order paid
- customer linked
- tracking token generated
- success page shows email-confirmed message

- [ ] **Step 3: Verify guest tracking flow**

Open the tracking URL from a paid order.
Expected:
- route resolves
- status visible
- order data correct

- [ ] **Step 4: Verify admin clients flow**

Check manually:
- `/admin/clients`
- `/admin/clients/[id]`
- real order history visible

- [ ] **Step 5: Verify EasyShop still works**

Replay local webhook.
Expected:
- no regression on stock sync

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "test: validate customer tracking and admin clients flow"
```
