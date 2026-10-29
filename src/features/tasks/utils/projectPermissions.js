/**
 * Project management flags — keep in sync with Team_management project_permissions.py
 */

export function canAddEditDeleteProject(project, userRole) {
  if (!project) return false;
  const role = (userRole || "").toLowerCase();
  if (role !== "team_leader" && role !== "worker") return true;
  if (project.company_managed === true) return false;
  if (project.by_tl_managed === true) return role === "team_leader";
  if (project.team_managed === true) return true;
  return false;
}

export function canManageProjectSprints(project, userRole) {
  if (!project) return false;
  const role = (userRole || "").toLowerCase();
  if (role !== "team_leader" && role !== "worker") return true;
  if (project.company_managed === true) return false;
  return true;
}

export function isAdminRole(userRole) {
  const role = (userRole || "").toLowerCase();
  return role === "superadmin" || role === "admin" || role === "scrum";
}

/** Sidebar sprint create/edit — workers never; TL blocked on company-managed. */
export function canShowSprintActionsInSidebar(project, userRole) {
  const role = (userRole || "").toLowerCase();
  if (role === "worker") return false;
  if (!canManageProjectSprints(project, userRole)) return false;
  return true;
}

export function restrictionToastMessage(project, action = "This action") {
  if (project?.company_managed) {
    return `${action} is restricted: this project is company managed. Only administrators can change tasks and sprints.`;
  }
  if (project?.by_tl_managed) {
    return `${action} is restricted: this project is managed by the team leader. Workers cannot modify tasks here.`;
  }
  return `${action} is restricted for your role on this project.`;
}
