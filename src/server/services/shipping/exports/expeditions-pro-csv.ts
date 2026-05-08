import { calculateOrderShippingEstimate } from "@/server/services/shipping/order-shipping";
import { buildCsvDocument } from "@/server/utils/csv";
import { formatCityName, formatPersonName } from "@/server/utils/text-format";
import {
  formatCurrencyCentsToEuros,
  toCountryIsoCode,
  type ExportableColishipOrder,
} from "@/server/services/shipping/exports/shared";

const DEFAULT_CONTENT_DESCRIPTION = "Articles de décoration";
// Code catégorie contenu temporaire à confirmer dans le référentiel Colissimo avant production.
const DEFAULT_CONTENT_CATEGORY_CODE = "10150";

export function buildExpeditionsProCsv(orders: ExportableColishipOrder[]) {
  const headers = [
    "recipient_first_name",
    "recipient_last_name",
    "recipient_company",
    "recipient_address_line_1",
    "recipient_address_line_2",
    "recipient_postal_code",
    "recipient_city",
    "recipient_country_iso_code",
    "recipient_additional_information",
    "recipient_phone",
    "recipient_email",
    "recipient_proximity_point",
    "content_detailed_description",
    "content_category_code",
    "package_1_weight",
    "package_1_length",
    "package_1_width",
    "package_1_height",
    "package_1_value",
    "external_reference",
  ];

  const rows = orders.map((order) => {
    const shippingEstimate = calculateOrderShippingEstimate(order);
    const additionalInformation = shippingEstimate.usedFallbackWeight
      ? "Poids fallback 100g utilise"
      : "";

    return [
      formatPersonName(order.customerFirstName),
      formatPersonName(order.customerLastName),
      "",
      order.shippingAddressLine1 ?? "",
      order.shippingAddressLine2 ?? "",
      order.shippingPostalCode ?? "",
      formatCityName(order.shippingCity ?? ""),
      toCountryIsoCode(order.shippingCountry),
      additionalInformation,
      order.customerPhone ?? "",
      order.customerEmail,
      "",
      DEFAULT_CONTENT_DESCRIPTION,
      DEFAULT_CONTENT_CATEGORY_CODE,
      shippingEstimate.totalWeightKg,
      shippingEstimate.packageDimensions.lengthCm,
      shippingEstimate.packageDimensions.widthCm,
      shippingEstimate.packageDimensions.heightCm,
      formatCurrencyCentsToEuros(order.subtotalCents),
      order.orderNumber,
    ];
  });

  return buildCsvDocument(headers, rows, {
    delimiter: ",",
    forceQuoteAll: true,
  });
}
