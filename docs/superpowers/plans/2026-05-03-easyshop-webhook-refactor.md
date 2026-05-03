# EasyShop Webhook Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Shopcaisse callback assumption with an EasyShop integration that uses the public API for outbound calls and one inbound HMAC-signed webhook.

**Architecture:** Keep the existing Prisma-backed local product cache and admin sync screens. Split EasyShop into two clear paths: outbound API client using `Authorization: Bearer`, and inbound `/api/shopcaisse/webhook` that validates `x-server-authorization-hmac-sha256` before triggering internal sync logic.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma, Node `crypto`, Zod.

---

### Task 1: Normalize environment contract

**Files:**
- Modify: `src/server/env/schema.ts`
- Modify: `.env.example`
- Modify: `docs/shopcaisse-api.md`

- [ ] Replace legacy callback URL envs with `SHOPCAISSE_WEBHOOK_SECRET` and optional `SHOPCAISSE_WEBHOOK_SIGNATURE_HEADER`.
- [ ] Remove misleading local callback URL examples from `.env.example`.
- [ ] Rewrite Shopcaisse doc to match EasyShop webhook + JWT model.

### Task 2: Separate outbound EasyShop API client from inbound webhook handling

**Files:**
- Modify: `src/server/services/shopcaisse/client.ts`
- Modify: `src/server/services/shopcaisse/stock.ts`
- Create: `src/server/services/shopcaisse/webhook.ts`
- Create: `src/server/services/shopcaisse/signature.ts`

- [ ] Keep outbound requests based on `SHOPCAISSE_API_URL` + bearer token only.
- [ ] Add webhook payload parsing, signature verification, event routing, and idempotence hash generation.
- [ ] Trigger local stock sync on supported events and log ignored events explicitly.

### Task 3: Expose official EasyShop webhook route and recable admin/health

**Files:**
- Create: `src/app/api/shopcaisse/webhook/route.ts`
- Modify: `src/app/api/health/route.ts`
- Modify: `src/app/admin/(protected)/settings/shopcaisse/page.tsx`
- Modify: `src/app/admin/(protected)/sync/shopcaisse/page.tsx`

- [ ] Add `POST /api/shopcaisse/webhook` using raw body HMAC verification.
- [ ] Update health/admin screens to reflect webhook-based configuration.
- [ ] Keep manual admin stock sync working independently of webhook events.

### Task 4: Verify repository state

**Files:**
- Modify if needed: `package.json`

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Confirm the new webhook route is present and the old assumptions are gone from the surfaced admin text.
