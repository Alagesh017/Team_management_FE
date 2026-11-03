import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { DashboardFiltersProvider } from "../contexts/DashboardFiltersContext";
import DashboardToolbar from "../components/DashboardToolbar";
import DashboardStatCards from "../components/DashboardStatCards";
import ProjectOverviewCard from "../components/ProjectOverviewCard";
import TeamActivityTable from "../components/TeamActivityTable";
import TaskContributionHeatmap from "../components/TaskContributionHeatmap";
import UpcomingDeadlinesTable from "../components/UpcomingDeadlinesTable";
import ProjectPipelineSection from "../components/ProjectPipelineSection";
import { DASH_PAGE_GAP } from "../components/dashboardStyles";
import { projectService } from "../../projects/services/projectService";
import { cn } from "../../../core/utils/utils";

function DashboardContent() {
  const { user } = useAuth();
  const isWorker = user?.role === "worker";
  const isTeamLeader = user?.role === "team_leader";
  const isRestricted = isWorker || isTeamLeader;
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = user
          ? { role: user.role, role_id: user.roleId, user_id: user.userId }
          : {};
        const res = await projectService.getAllProjects(params);
        if (!cancelled && res?.projects) setProjects(res.projects);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className={cn("flex flex-col pb-2 max-w-[1600px] mx-auto w-full min-w-0", DASH_PAGE_GAP)}>
      <DashboardToolbar
        projects={projects}
        subtitle={
          isWorker
            ? "Your allocated projects and assigned tasks."
            : isTeamLeader
              ? "Your team projects and task progress."
              : undefined
        }
      />
      <DashboardStatCards />

      <ProjectPipelineSection />

      <div className={cn("grid grid-cols-1 xl:grid-cols-12 xl:items-stretch", DASH_PAGE_GAP)}>
        <div className={cn("xl:col-span-5 flex flex-col min-w-0 min-h-0", DASH_PAGE_GAP)}>
          <ProjectOverviewCard compact />
          {!isWorker && (
            <TeamActivityTable compact className="flex-1 min-h-0" />
          )}
        </div>
        <div className="xl:col-span-7 min-w-0 flex flex-col self-stretch min-h-0">
          <UpcomingDeadlinesTable className="flex-1 min-h-0 h-full" />
        </div>
      </div>

      {!isRestricted && <TaskContributionHeatmap />}
    </div>
  );
}

const Dashboard = () => (
  <DashboardFiltersProvider>
    <DashboardContent />
  </DashboardFiltersProvider>
);

export default Dashboard;
