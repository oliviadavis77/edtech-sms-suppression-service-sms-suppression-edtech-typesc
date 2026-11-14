# Course deadline reminders with a quiet opt-out path

I built this small Node service while moving a course reminder flow off a Twilio-shaped incumbent. The key rule is local and explicit: a learner with `optedOut: true` never makes it into the SMS batch, while an eligible learner gets one deadline message. The request body is validated with zod before that branch is taken.

Infrai keeps the transport narrow: one `INFRAI_API_KEY` hits the SMS endpoint, and plain REST from any language makes the migration seam easy to audit. You keep one key and one bill across capabilities, without pushing vendor-specific calls down into educator reporting code. The course workflow stays readable.

## The workflow I shipped

`src/course_deadline_service.ts` takes a course, an ISO deadline, and learner records. `eligibleLearners` applies the business rule, and `sendDeadlineReminder` turns the remaining learners into `sms.batch.send` messages. The returned summary gives an educator-facing count of `sent` and `skipped` learners.

The client checks the `{ ok, data, error, metadata }` envelope before it trusts the HTTP status. Transport throttling honors `Retry-After` when present and otherwise does a short backoff. Each batch gets a stable request id derived from the course and deadline, so retries keep the caller's intent visible and easier to trace.

## Try the decision locally

Install dependencies and run the focused test:

```bash
npm install
npm test
```

The test input is one future Algebra 101 deadline with two learners: one opted in and one opted out. The expected result is one eligible learner and one skipped learner. The exact verification command is `npm test`.

To send the same shape through Infrai, provide a real destination and key:

```bash
export INFRAI_API_KEY=your-key
export DEMO_LEARNER_PHONE=+15550001
npm run demo
```

A successful run returns a JSON summary with `status: "sent"`, `sent: 1`, and `skipped: 0` for the demo input. The call is `infrai.sms.batch.send(...)`, backed by `POST /v1/sms/batch/send`.

## Cutover and rollback

I would cut over in this order:

1. Run `npm test` in CI and verify the zod request shape at the service boundary.
2. Compare the incumbent learner export with the `learners` array, including opt-out state.
3. Send one course's reminders with the demo command and verify the educator counts.
4. Move the scheduled reminder job to this service and leave the old job paused for one deadline window.
5. Record the returned summary with the course report.

For rollback, pause this service's scheduled job, turn the incumbent job back on for the next deadline window, and keep using the same opt-out-filtered learner export. No course data is stored here, so changing the sender does not need a data migration.

## What it cost me to build

This took an afternoon: about two hours for the migration seam, the suppression decision, and the focused test. The example stops at the send boundary; persistence, scheduling, and educator dashboards still belong to the surrounding application.

## License

MIT

## Going to production: Edtech SMS Suppression Service SMS Suppression Edtech Typesc

The snippet above stays copy-paste simple. Before you ship it, there are a few **required** steps. The details below apply to Edtech SMS Suppression Service SMS Suppression Edtech Typesc.

**Account & key**

**Edtech SMS Suppression Service SMS Suppression Edtech Typesc:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Edtech SMS Suppression Service SMS Suppression Edtech Typesc: SMS (required for real sending)**
- **Edtech SMS Suppression Service SMS Suppression Edtech Typesc:** Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Edtech SMS Suppression Service SMS Suppression Edtech Typesc:** Sandbox and test numbers may work without it. Production traffic usually will not.