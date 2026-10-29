/** Field keys per onboarding step — mirrors AdminForm / WorkerForm schemas. */

export const ADMIN_STEP_FIELDS = [
  [
    "avatar_url",
    "first_name",
    "last_name",
    "email",
    "phone",
    "joining_date",
  ],
  [
    "experience_years",
    "working_hours",
    "work_mode",
    "status",
    "linkedin_url",
    "office_location",
  ],
  [
    "address_line1",
    "address_line2",
    "city",
    "state",
    "country",
    "pincode",
    "remark",
  ],
];

export const WORKER_STEP_FIELDS = [
  [
    "avatar_url",
    "first_name",
    "last_name",
    "email",
    "phone",
  ],
  [
    "job_title",
    "department",
    "employment_type",
    "joining_date",
    "experience_years",
    "working_hours",
    "work_mode",
    "status",
    "office_location",
  ],
  [
    "linkedin_url",
    "github_url",
    "portfolio_url",
    "address_line1",
    "address_line2",
    "city",
    "state",
    "country",
    "pincode",
    "remark",
  ],
];

export function pickStepPayload(form, stepIndex, isWorkerSide) {
  const groups = isWorkerSide ? WORKER_STEP_FIELDS : ADMIN_STEP_FIELDS;
  const keys = groups[stepIndex] || [];
  const payload = {};
  keys.forEach((key) => {
    if (key === "avatar_url" || Object.prototype.hasOwnProperty.call(form, key)) {
      payload[key] = form[key];
    }
  });
  return payload;
}

export function toDateInputValue(val) {
  if (!val) return "";
  return String(val).slice(0, 10);
}

export function roleTypeFromUser(user, profile) {
  const r = String(user?.role || profile?.role || "").toLowerCase();
  if (["team_leader", "tl"].includes(r)) return "team_leader";
  if (r === "worker") return "worker";
  if (r === "superadmin") return "superadmin";
  if (r === "scrum") return "scrum";
  return profile?.role_type || "admin";
}

export function isWorkerSideRole(user, profile) {
  const r = String(user?.role || profile?.role || "").toLowerCase();
  return ["team_leader", "worker", "tl"].includes(r);
}
