/** Resolve workflow flags from API fields (with legacy name fallback). */
export function taskStatusFlags(task) {
  if (!task) {
    return {
      completed: false,
      inProgress: false,
      pending: false,
      hold: false,
      todo: false,
    };
  }
  if (task.status_is_completed !== undefined) {
    return {
      completed: Boolean(task.status_is_completed),
      inProgress: Boolean(task.status_is_in_progress),
      pending: Boolean(task.status_is_pending),
      hold: Boolean(task.status_is_hold),
      todo: Boolean(task.status_is_todo),
    };
  }
  const name = (task.status_name || task.status || "").toLowerCase();
  return {
    completed: name.includes("done") || name.includes("complete"),
    inProgress: name.includes("progress") || name.includes("doing"),
    pending: name.includes("pending") || name.includes("wait"),
    hold: name.includes("hold") || name.includes("block"),
    todo: name.includes("todo") || name.includes("to do") || name.includes("backlog"),
  };
}

export function isTaskOverdue(task) {
  const flags = taskStatusFlags(task);
  if (flags.completed || !task?.due_date) return false;
  const due = new Date(task.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}
