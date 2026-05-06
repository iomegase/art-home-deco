import { createSign } from "node:crypto";
import { getEnv } from "@/server/env";

type GoogleMetricStatus = "ok" | "not_configured" | "error";

type GoogleAnalyticsSnapshot = {
  status: GoogleMetricStatus;
  error?: string;
  summary?: {
    users: number;
    sessions: number;
    views: number;
    purchases: number;
    purchaseRevenue: number;
  };
  channels?: Array<{
    channel: string;
    sessions: number;
    users: number;
    purchases: number;
    revenue: number;
  }>;
  pages?: Array<{
    path: string;
    views: number;
    users: number;
  }>;
};

type SearchConsoleSnapshot = {
  status: GoogleMetricStatus;
  error?: string;
  summary?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  queries?: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  pages?: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
};

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function getGoogleServiceAccountConfig() {
  const env = getEnv();
  const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return {
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey,
    analyticsPropertyId: env.GOOGLE_ANALYTICS_PROPERTY_ID,
    searchConsoleSiteUrl: env.GOOGLE_SEARCH_CONSOLE_SITE_URL,
  };
}

async function getGoogleAccessToken(scope: string) {
  const config = getGoogleServiceAccountConfig();
  if (!config.email || !config.privateKey) {
    throw new Error("Google service account is not configured.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    iss: config.email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  const signature = signer.sign(config.privateKey, "base64url");
  const jwt = `${unsignedJwt}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google OAuth token request failed: ${errorText}`);
  }

  const payloadJson = (await response.json()) as { access_token: string };
  return payloadJson.access_token;
}

function parseMetric(row: { metricValues?: Array<{ value?: string }> } | undefined, index: number) {
  return Number(row?.metricValues?.[index]?.value ?? 0);
}

export async function getGoogleAnalyticsSnapshot(
  startDate: string,
  endDate: string,
): Promise<GoogleAnalyticsSnapshot> {
  const config = getGoogleServiceAccountConfig();
  if (!config.analyticsPropertyId || !config.email || !config.privateKey) {
    return { status: "not_configured" };
  }

  try {
    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/analytics.readonly");
    const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${config.analyticsPropertyId}:runReport`;

    const [summaryResponse, channelsResponse, pagesResponse] = await Promise.all([
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: "totalUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "transactions" },
            { name: "purchaseRevenue" },
          ],
        }),
        cache: "no-store",
      }),
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "transactions" },
            { name: "purchaseRevenue" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 8,
        }),
        cache: "no-store",
      }),
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 8,
        }),
        cache: "no-store",
      }),
    ]);

    if (!summaryResponse.ok || !channelsResponse.ok || !pagesResponse.ok) {
      throw new Error("Google Analytics Data API request failed.");
    }

    const summaryJson = (await summaryResponse.json()) as { rows?: Array<{ metricValues?: Array<{ value?: string }> }> };
    const channelsJson = (await channelsResponse.json()) as {
      rows?: Array<{
        dimensionValues?: Array<{ value?: string }>;
        metricValues?: Array<{ value?: string }>;
      }>;
    };
    const pagesJson = (await pagesResponse.json()) as {
      rows?: Array<{
        dimensionValues?: Array<{ value?: string }>;
        metricValues?: Array<{ value?: string }>;
      }>;
    };

    const summaryRow = summaryJson.rows?.[0];

    return {
      status: "ok",
      summary: {
        users: parseMetric(summaryRow, 0),
        sessions: parseMetric(summaryRow, 1),
        views: parseMetric(summaryRow, 2),
        purchases: parseMetric(summaryRow, 3),
        purchaseRevenue: parseMetric(summaryRow, 4),
      },
      channels:
        channelsJson.rows?.map((row) => ({
          channel: row.dimensionValues?.[0]?.value ?? "Unknown",
          sessions: Number(row.metricValues?.[0]?.value ?? 0),
          users: Number(row.metricValues?.[1]?.value ?? 0),
          purchases: Number(row.metricValues?.[2]?.value ?? 0),
          revenue: Number(row.metricValues?.[3]?.value ?? 0),
        })) ?? [],
      pages:
        pagesJson.rows?.map((row) => ({
          path: row.dimensionValues?.[0]?.value ?? "/",
          views: Number(row.metricValues?.[0]?.value ?? 0),
          users: Number(row.metricValues?.[1]?.value ?? 0),
        })) ?? [],
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Google Analytics fetch failed.",
    };
  }
}

export async function getSearchConsoleSnapshot(
  startDate: string,
  endDate: string,
): Promise<SearchConsoleSnapshot> {
  const config = getGoogleServiceAccountConfig();
  if (!config.searchConsoleSiteUrl || !config.email || !config.privateKey) {
    return { status: "not_configured" };
  }

  try {
    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/webmasters.readonly");
    const encodedSiteUrl = encodeURIComponent(config.searchConsoleSiteUrl);
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;

    const [summaryResponse, queriesResponse, pagesResponse] = await Promise.all([
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          rowLimit: 1,
        }),
        cache: "no-store",
      }),
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 8,
        }),
        cache: "no-store",
      }),
      fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 8,
        }),
        cache: "no-store",
      }),
    ]);

    if (!summaryResponse.ok || !queriesResponse.ok || !pagesResponse.ok) {
      throw new Error("Google Search Console API request failed.");
    }

    const summaryJson = (await summaryResponse.json()) as {
      responseAggregationType?: string;
      rows?: Array<{
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>;
    };
    const queriesJson = (await queriesResponse.json()) as {
      rows?: Array<{
        keys?: string[];
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>;
    };
    const pagesJson = (await pagesResponse.json()) as {
      rows?: Array<{
        keys?: string[];
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>;
    };

    const summaryRow = summaryJson.rows?.[0] ?? {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
    };

    return {
      status: "ok",
      summary: {
        clicks: summaryRow.clicks,
        impressions: summaryRow.impressions,
        ctr: summaryRow.ctr,
        position: summaryRow.position,
      },
      queries:
        queriesJson.rows?.map((row) => ({
          query: row.keys?.[0] ?? "",
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        })) ?? [],
      pages:
        pagesJson.rows?.map((row) => ({
          page: row.keys?.[0] ?? "",
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        })) ?? [],
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Search Console fetch failed.",
    };
  }
}
