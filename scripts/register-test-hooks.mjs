// Registers the test-only module resolver for the Node test runner.
// Intended invocation (from the repo root):
//   node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test <file.test.ts>
import { register } from "node:module";
register("./test-resolver.mjs", import.meta.url);
