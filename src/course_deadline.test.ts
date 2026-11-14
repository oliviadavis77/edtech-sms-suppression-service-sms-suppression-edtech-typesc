import assert from "node:assert/strict";
import { eligibleLearners, deadlineRequest } from "./course_deadline_service.js";

const input = deadlineRequest.parse({
  courseId: "algebra-101",
  courseTitle: "Algebra 101",
  deadline: "2026-11-01T09:00:00.000Z",
  learners: [
    { learnerId: "learner-1", phone: "+15550001", optedOut: false },
    { learnerId: "learner-2", phone: "+15550002", optedOut: true },
  ],
});
const eligible = eligibleLearners(input, new Date("2026-10-25T09:00:00.000Z"));
assert.deepEqual(eligible.map((learner) => learner.learnerId), ["learner-1"]);
console.log("suppression decision passed: one learner is eligible, one is skipped");
