import { defaultMaintenanceSettings, type MaintenanceSettings } from "./types";

/**
 * Le site public affiche la page maintenance uniquement pour les visiteurs
 * non-admin quand le mode est activé. Un admin connecté voit toujours le site.
 */
export function shouldShowMaintenance(enabled: boolean, isAdmin: boolean): boolean {
  return enabled && !isAdmin;
}

/** Lit un réglage maintenance depuis une valeur JSON inconnue, avec repli sur le défaut. */
export function parseMaintenanceSettings(value: unknown): MaintenanceSettings {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const source = value as Partial<MaintenanceSettings>;
    return { enabled: source.enabled === true };
  }

  return { ...defaultMaintenanceSettings };
}
