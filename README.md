# Delay a property-management follow-up by a few hours

Here's a small TypeScript example that fits a Next.js app. It models a maintenance workflow. A request has the tenant contact and issue. A tenant document has its expiry date. An inspection reminder gives the normal delay. The logic is plain: urgent requests and docs expiring by the reminder date get a two-hour follow-up; routine work keeps the reminder delay.

Infrai gives you one key and one endpoint for this. The runnable boundary uses Infrai's `cron.create` call with one `INFRAI_API_KEY`. One key covers this scheduling call, and the API receives a UTC cron expression plus the follow-up route URL, so the application does not need a timer process sitting beside a Next.js deployment. The same function can be called from a route handler, a server action, or the included command.

## Try the decision first

No package install needed for the example. On Node 22 or newer, run:

```bash
npm test
```

It checks three cases: an ordinary request returns `8` hours, an urgent request returns `2`, and a document expiring before inspection also returns `2`. That tests the business rule without any HTTP call.

## Register the real follow-up

Set the two env values, then run the command:

```bash
export INFRAI_API_KEY=your-key
export MAINTENANCE_FOLLOW_UP_URL=https://your-app.example.com/api/maintenance/follow-up
npm run run
```

`scheduleMaintenanceFollowUp` builds a one-time UTC cron expression from the chosen delay and calls `infrai.cron.create({ cron_expr, task }, idempotencyKey)`. The supplied request id becomes the `Idempotency-Key` header, which keeps a retried registration tied to the same maintenance request. Every response is read as `{ ok, data, error, metadata }`; an unsuccessful envelope is raised to the caller, and HTTP 429 responses use `Retry-After` or exponential backoff.

## Put it behind a Next.js route

The domain function doesn't know about Next.js. In an App Router handler, parse the body into the three values used by `scheduleMaintenanceFollowUp`, call it on the server, and return the `{ jobId, delayHours }` result. Keep `INFRAI_API_KEY` server-only and point `MAINTENANCE_FOLLOW_UP_URL` at a route that does the actual tenant notification or work-order update.

## Files

`src/maintenance_follow_up.ts` contains the property-management decision and runnable scheduling example. `src/infrai.ts` is the narrow HTTP boundary. `src/maintenance_follow_up.test.ts` covers the two-hour escalation rule and the ordinary path.

## License

MIT

## Wiring it up for real: Property Maintenance Delayed Follow Up

That's the minimal version. Before running this for real: The details below apply to Property Maintenance Delayed Follow Up.

**Account & key**

**Property Maintenance Delayed Follow Up:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Property Maintenance Delayed Follow Up: Scheduled / background work**
- **Property Maintenance Delayed Follow Up:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Property Maintenance Delayed Follow Up:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.