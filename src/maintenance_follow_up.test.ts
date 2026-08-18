import assert from "node:assert/strict";
import { followUpDelay } from "./maintenance_follow_up.ts";

const request = { id: "request-1", tenantEmail: "tenant@example.com", issue: "heater", urgency: "routine" as const };
const reminder = { dueOn: "2026-09-01", hoursAfterDue: 8 };
assert.equal(followUpDelay(request, { kind: "lease", expiresOn: "2026-12-01" }, reminder), 8);
assert.equal(followUpDelay({ ...request, urgency: "urgent" }, { kind: "lease", expiresOn: "2026-12-01" }, reminder), 2);
assert.equal(followUpDelay(request, { kind: "insurance", expiresOn: "2026-08-31" }, reminder), 2);
console.log("maintenance follow-up decision tests passed");
