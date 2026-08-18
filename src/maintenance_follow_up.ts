import { infrai } from "./infrai.ts";

export type MaintenanceRequest = { id: string; tenantEmail: string; issue: string; urgency: "routine" | "urgent" };
export type TenantDocument = { kind: "lease" | "insurance"; expiresOn: string };
export type InspectionReminder = { dueOn: string; hoursAfterDue: number };

export function followUpDelay(request: MaintenanceRequest, document: TenantDocument, reminder: InspectionReminder): number {
  if (request.urgency === "urgent" || document.expiresOn <= reminder.dueOn) return 2;
  return reminder.hoursAfterDue;
}

export async function scheduleMaintenanceFollowUp(request: MaintenanceRequest, document: TenantDocument, reminder: InspectionReminder): Promise<{ jobId: string; delayHours: number }> {
  const delayHours = followUpDelay(request, document, reminder);
  const task = process.env.MAINTENANCE_FOLLOW_UP_URL;
  if (!task) throw new Error("Set MAINTENANCE_FOLLOW_UP_URL before running this example.");
  const runAt = new Date(Date.now() + delayHours * 60 * 60 * 1000);
  const cronExpr = `${runAt.getUTCMinutes()} ${runAt.getUTCHours()} ${runAt.getUTCDate()} ${runAt.getUTCMonth() + 1} *`;
  const result = await infrai.cron.create({ cron_expr: cronExpr, task }, `maintenance-follow-up:${request.id}`);
  return { jobId: result.job_id, delayHours };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await scheduleMaintenanceFollowUp({ id: "request-184", tenantEmail: "tenant@example.com", issue: "leaking tap", urgency: "routine" }, { kind: "lease", expiresOn: "2026-12-31" }, { dueOn: "2026-09-01", hoursAfterDue: 6 });
  console.log(`Scheduled maintenance follow-up ${result.jobId} after ${result.delayHours} hours.`);
}
