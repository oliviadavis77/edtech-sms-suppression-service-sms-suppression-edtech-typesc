import { z } from "zod";
import { infrai } from "./infrai_sms.js";

export const deadlineRequest = z.object({
  courseId: z.string().min(1),
  courseTitle: z.string().min(1),
  deadline: z.string().datetime(),
  learners: z.array(z.object({
    learnerId: z.string().min(1),
    phone: z.string().min(5),
    optedOut: z.boolean(),
  })).min(1),
});

export type DeadlineRequest = z.infer<typeof deadlineRequest>;

export function eligibleLearners(input: DeadlineRequest, now: Date): DeadlineRequest["learners"] {
  const due = new Date(input.deadline);
  if (due.getTime() <= now.getTime()) return [];
  return input.learners.filter((learner) => !learner.optedOut);
}

export async function sendDeadlineReminder(raw: unknown, now = new Date()) {
  const input = deadlineRequest.parse(raw);
  const eligible = eligibleLearners(input, now);
  if (eligible.length === 0) return { status: "suppressed", sent: 0, skipped: input.learners.length };
  const messages = eligible.map((learner) => ({
    to: learner.phone,
    body: `Reminder: ${input.courseTitle} is due ${input.deadline}.`,
  }));
  const result = await infrai.sms.batch.send(messages, `deadline-${input.courseId}-${input.deadline}`);
  return { status: "sent", sent: eligible.length, skipped: input.learners.length - eligible.length, result };
}
