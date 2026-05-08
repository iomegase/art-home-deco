import type { ShippingClass } from "@/types/domain/product";

export type PackagePresetKey =
  | "ENVELOPE_CARDBOARD"
  | "TUBE_POSTER"
  | "SMALL_BOX"
  | "SMALL_FRAGILE_BOX"
  | "MEDIUM_BOX"
  | "MEDIUM_FRAGILE_BOX"
  | "LARGE_BOX"
  | "XL_BOX";

export type PackagePreset = {
  key: PackagePresetKey;
  label: string;
  description: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export function calculateVolumetricWeightKg(lengthCm: number, widthCm: number, heightCm: number) {
  return Number(((lengthCm * widthCm * heightCm) / 5000).toFixed(3));
}

export function calculateChargeableWeightKg(realWeightKg: number, volumetricWeightKg: number) {
  return Number(Math.max(realWeightKg, volumetricWeightKg).toFixed(3));
}

export const packagePresets: Record<PackagePresetKey, PackagePreset> = {
  ENVELOPE_CARDBOARD: {
    key: "ENVELOPE_CARDBOARD",
    label: "Enveloppe cartonnée",
    description: "Produits plats, petits articles non fragiles, affiches à plat.",
    lengthCm: 32,
    widthCm: 24,
    heightCm: 2,
  },
  TUBE_POSTER: {
    key: "TUBE_POSTER",
    label: "Tube affiche",
    description: "Affiches roulées et visuels expédiés en tube.",
    lengthCm: 45,
    widthCm: 8,
    heightCm: 8,
  },
  SMALL_BOX: {
    key: "SMALL_BOX",
    label: "Petit colis",
    description: "Petit objet standard avec emballage léger.",
    lengthCm: 20,
    widthCm: 15,
    heightCm: 8,
  },
  SMALL_FRAGILE_BOX: {
    key: "SMALL_FRAGILE_BOX",
    label: "Petit colis fragile",
    description: "Petit objet fragile avec calage et protection.",
    lengthCm: 25,
    widthCm: 20,
    heightCm: 15,
  },
  MEDIUM_BOX: {
    key: "MEDIUM_BOX",
    label: "Colis moyen",
    description: "Objet décoratif standard en carton moyen.",
    lengthCm: 30,
    widthCm: 20,
    heightCm: 15,
  },
  MEDIUM_FRAGILE_BOX: {
    key: "MEDIUM_FRAGILE_BOX",
    label: "Colis moyen fragile",
    description: "Objet fragile nécessitant plus de volume de calage.",
    lengthCm: 35,
    widthCm: 25,
    heightCm: 25,
  },
  LARGE_BOX: {
    key: "LARGE_BOX",
    label: "Grand colis",
    description: "Objet volumineux ou lot important.",
    lengthCm: 45,
    widthCm: 35,
    heightCm: 25,
  },
  XL_BOX: {
    key: "XL_BOX",
    label: "Très grand colis",
    description: "Très grand objet ou conditionnement hors standard.",
    lengthCm: 55,
    widthCm: 40,
    heightCm: 30,
  },
};

export const DEFAULT_PACKAGE_PRESET = packagePresets.SMALL_BOX;

const shippingClassToPackagePresetKey: Record<ShippingClass, PackagePresetKey> = {
  XS: "ENVELOPE_CARDBOARD",
  TUBE_POSTER: "TUBE_POSTER",
  S: "SMALL_BOX",
  SMALL_FRAGILE_BOX: "SMALL_FRAGILE_BOX",
  M: "MEDIUM_BOX",
  L: "MEDIUM_FRAGILE_BOX",
  XL: "LARGE_BOX",
  PICKUP_ONLY: "SMALL_BOX",
};

export function getPackagePresetForShippingClass(shippingClass: ShippingClass | string | null | undefined) {
  if (!shippingClass || shippingClass === "PICKUP_ONLY") {
    return DEFAULT_PACKAGE_PRESET;
  }

  const presetKey =
    shippingClassToPackagePresetKey[shippingClass as ShippingClass] ?? DEFAULT_PACKAGE_PRESET.key;

  return packagePresets[presetKey];
}

export function getPackagePresetDisplayLabel(preset: PackagePreset) {
  return `${preset.label} — ${preset.lengthCm} × ${preset.widthCm} × ${preset.heightCm} cm`;
}

export const shippingClassOptions: Array<{ value: ShippingClass; label: string; help?: string }> = [
  {
    value: "XS",
    label: getPackagePresetDisplayLabel(packagePresets.ENVELOPE_CARDBOARD),
    help: packagePresets.ENVELOPE_CARDBOARD.description,
  },
  {
    value: "TUBE_POSTER",
    label: getPackagePresetDisplayLabel(packagePresets.TUBE_POSTER),
    help: packagePresets.TUBE_POSTER.description,
  },
  {
    value: "S",
    label: getPackagePresetDisplayLabel(packagePresets.SMALL_BOX),
    help: packagePresets.SMALL_BOX.description,
  },
  {
    value: "SMALL_FRAGILE_BOX",
    label: getPackagePresetDisplayLabel(packagePresets.SMALL_FRAGILE_BOX),
    help: packagePresets.SMALL_FRAGILE_BOX.description,
  },
  {
    value: "M",
    label: getPackagePresetDisplayLabel(packagePresets.MEDIUM_BOX),
    help: packagePresets.MEDIUM_BOX.description,
  },
  {
    value: "L",
    label: getPackagePresetDisplayLabel(packagePresets.MEDIUM_FRAGILE_BOX),
    help: packagePresets.MEDIUM_FRAGILE_BOX.description,
  },
  {
    value: "XL",
    label: getPackagePresetDisplayLabel(packagePresets.LARGE_BOX),
    help: packagePresets.LARGE_BOX.description,
  },
  { value: "PICKUP_ONLY", label: "Retrait boutique uniquement" },
];

export function getShippingClassAdminLabel(value: ShippingClass) {
  return shippingClassOptions.find((option) => option.value === value)?.label ?? value;
}
