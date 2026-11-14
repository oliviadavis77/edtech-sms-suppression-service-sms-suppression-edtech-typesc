import { sendDeadlineReminder } from "./course_deadline_service.js";

const phone = process.env.DEMO_LEARNER_PHONE;
if (!phone) throw new Error("DEMO_LEARNER_PHONE is required");

const result = await sendDeadlineReminder({
  courseId: "algebra-101",
  courseTitle: "Algebra 101",
  deadline: "2026-11-01T09:00:00.000Z",
  learners: [{ learnerId: "demo-learner", phone, optedOut: false }],
});
console.log(JSON.stringify(result, null, 2));
