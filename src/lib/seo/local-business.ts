import type { LegalSettings, StoreStatusSettings } from "@/features/admin-home/types";
import { getSiteUrl } from "@/lib/site-url";

const DAY_TO_SCHEMA: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function splitAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const streetAddress = parts[0] ?? address;
  const localityBlock = parts[1] ?? "";
  const postalMatch = localityBlock.match(/(\d{5})\s+(.+)/);

  return {
    streetAddress,
    postalCode: postalMatch?.[1] ?? "74170",
    addressLocality: postalMatch?.[2] ?? "Saint-Gervais-les-Bains",
    addressCountry: "FR",
  };
}

function buildOpeningHoursSpecification(storeStatus: StoreStatusSettings) {
  const groupedDays = storeStatus.openDays.map((day) => DAY_TO_SCHEMA[day]).filter(Boolean);
  if (groupedDays.length === 0) {
    return [];
  }

  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: groupedDays,
      opens: storeStatus.morningOpenTime,
      closes: storeStatus.morningCloseTime,
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: groupedDays,
      opens: storeStatus.afternoonOpenTime,
      closes: storeStatus.afternoonCloseTime,
    },
  ];
}

export function stringifyJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd(legal: LegalSettings) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: legal.commercialName,
    url: siteUrl,
    email: legal.email,
    telephone: `+33${legal.phone.replace(/\D/g, "").replace(/^0/, "")}`,
    address: {
      "@type": "PostalAddress",
      ...splitAddress(legal.address),
    },
  };
}

export function buildWebsiteJsonLd(legal: LegalSettings) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: legal.commercialName,
    url: siteUrl,
    inLanguage: "fr-FR",
  };
}

export function buildLocalBusinessJsonLd(legal: LegalSettings, storeStatus: StoreStatusSettings) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeGoodsStore"],
    name: legal.commercialName,
    alternateName: ["Art'Home", "Art Home", "Art et Home"],
    url: siteUrl,
    telephone: `+33${legal.phone.replace(/\D/g, "").replace(/^0/, "")}`,
    email: legal.email,
    address: {
      "@type": "PostalAddress",
      ...splitAddress(legal.address),
    },
    openingHoursSpecification: buildOpeningHoursSpecification(storeStatus),
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}
