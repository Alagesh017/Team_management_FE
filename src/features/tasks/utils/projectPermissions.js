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

/** Workers / team leaders use sprint boards only — not the project backlog page. */
export function canAccessProjectBacklog(userRole) {
  const role = (userRole || "").toLowerCase();
  return role !== "team_leader" && role !== "worker";
}

/** First live sprint, else first sprint; null if none. */
export function getPreferredSprintBoardPath(project) {
  if (!project?.id) return null;
  const sprints = project.sprints || [];
  if (!sprints.length) return null;
  const live = sprints.find((s) => Number(s.sprint_status) === 1);
  const pick = live || sprints[0];
  return `/tasks/project/${project.id}/sprint/${pick.id}`;
}

export function isProjectSidebarActive(currentPath, projectId, userRole) {
  const base = `/tasks/project/${projectId}`;
  if (!canAccessProjectBacklog(userRole)) {
    return (
      currentPath.startsWith(`${base}/sprint/`) ||
      currentPath === `${base}/board` ||
      currentPath.startsWith(`${base}/task/`)
    );
  }
  return currentPath === base || currentPath.startsWith(`${base}/`);
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
