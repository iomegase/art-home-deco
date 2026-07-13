import test from "node:test";
import assert from "node:assert/strict";
import { shouldShowMaintenance, parseMaintenanceSettings } from "./maintenance";

test("shouldShowMaintenance: page maintenance seulement pour non-admin quand activé", () => {
  assert.equal(shouldShowMaintenance(true, false), true);
  assert.equal(shouldShowMaintenance(true, true), false);
  assert.equal(shouldShowMaintenance(false, false), false);
  assert.equal(shouldShowMaintenance(false, true), false);
});

test("parseMaintenanceSettings: lit enabled et retombe sur le défaut", () => {
  assert.deepEqual(parseMaintenanceSettings({ enabled: true }), { enabled: true });
  assert.deepEqual(parseMaintenanceSettings({ enabled: false }), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings({ enabled: "yes" }), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings(undefined), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings(null), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings("nope"), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings([1, 2]), { enabled: false });
});
