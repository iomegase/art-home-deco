import { calculateOrderShippingEstimate } from "@/server/services/shipping/order-shipping";
import { buildCsvDocument } from "@/server/utils/csv";
import { formatCityName, formatPersonName } from "@/server/utils/text-format";
import {
  formatWeightKgForColishipClassic,
  toCountryIsoCode,
  type ExportableColishipOrder,
} from "@/server/services/shipping/exports/shared";

export function buildColishipClassicCsv(orders: ExportableColishipOrder[]) {
  const headers = [
    "Raison sociale",
    "Nom",
    "Prénom",
    "Adresse 1",
    "Adresse 2",
    "Code postal",
    "Commune",
    "Code pays",
    "Portable",
    "Téléphone",
    "Mail",
    "Poids",
    "Code point retrait",
    "Contre signature",
    "Assurance",
  ];

  const rows = orders.map((order) => {
    const shippingEstimate = calculateOrderShippingEstimate(order);

    return [
      "",
      formatPersonName(order.customerLastName),
      formatPersonName(order.customerFirstName),
      order.shippingAddressLine1 ?? "",
      order.shippingAddressLine2 ?? "",
      order.shippingPostalCode ?? "",
      formatCityName(order.shippingCity ?? ""),
      toCountryIsoCode(order.shippingCountry),
      order.customerPhone ?? "",
      "",
      order.customerEmail,
      formatWeightKgForColishipClassic(shippingEstimate.totalWeightKg),
      "",
      "N",
      "",
    ];
  });

  return buildCsvDocument(headers, rows, {
    delimiter: ";",
    lineEnding: "\r\n",
  });
}
