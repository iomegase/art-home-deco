import { randomBytes } from "node:crypto";

export function createTrackingToken() {
  return randomBytes(24).toString("base64url");
}
