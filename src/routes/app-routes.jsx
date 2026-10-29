import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../features/auth/pages/login'
import Register from '../features/auth/pages/register'
import Dashboard from '../features/dashboard/pages/Dashboard'
import AdminPage from '../features/admin/pages/AdminPage'
import WorkerPage from '../features/workers/pages/WorkerPage'
import TaskStatusPage from '../features/task-status/pages/TaskStatusPage'
import AttendanceStatusPage from '../features/attendance-status/pages/AttendanceStatusPage'
import ClientPage from '../features/clients/pages/ClientPage'
import ProjectPage from '../features/projects/pages/ProjectPage'
import ProjectDetailPage from '../features/projects/pages/ProjectDetailPage'
import ProjectGroupPage from '../features/projects/pages/ProjectGroupPage'
import ProjectAllocationPage from '../features/project-allocation/pages/ProjectAllocationPage'
import ProjectAllocationDetailPage from '../features/project-allocation/pages/ProjectAllocationDetailPage'
import TaskBoardPage from '../features/tasks/pages/TaskBoardPage'
import TaskDetailPage from '../features/tasks/pages/TaskDetailPage'
import TaskDashboardPage from '../features/tasks/pages/TaskDashboardPage'
import TaskExportPage from '../features/tasks/pages/TaskExportPage'
import TaskExcelEditorPage from '../features/tasks/pages/TaskExcelEditorPage'
import ProjectBacklogPage from '../features/tasks/pages/ProjectBacklogPage'
import SprintManagementPage from '../features/sprints/pages/SprintManagementPage'
import ReportPage from '../features/reports/pages/ReportPage'
import LeavePage from '../features/leave/pages/LeavePage'
import NotFoundPage from '../features/not-found/pages/NotFoundPage'
import WorkTimeAnalyticsPage from '../features/monitor/pages/WorkTimeAnalyticsPage'
import UserWorkTimeInsightPage from '../features/monitor/pages/UserWorkTimeInsightPage'
import EmployeeMonitorPage from '../features/monitor/pages/EmployeeMonitorPage'
import ManagerMonitorDashboard from '../features/monitor/pages/ManagerMonitorDashboard'
import ProfileCompletePage from '../features/profile/pages/ProfileCompletePage'
import { ProtectedRoute } from '../common/components/ProtectedRoute'

// Dummy components for testing
const Tasks = () => <div className="text-2xl font-bold">Tasks</div>

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/register" element={<Register />} />

			<Route element={<ProtectedRoute />}>
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/leave" element={<LeavePage />} />
				<Route path="/admin" element={<AdminPage />} />
				<Route path="/workers" element={<WorkerPage />} />
				<Route path="/task-status" element={<TaskStatusPage />} />
				<Route path="/attendance-status" element={<AttendanceStatusPage />} />
				<Route path="/attendance" element={<Navigate to="/404" replace />} />
				<Route path="/clients" element={<ClientPage />} />
				<Route path="/projects" element={<ProjectPage />} />
				<Route path="/project-grouping" element={<ProjectGroupPage />} />
				<Route path="/projects/:id" element={<ProjectDetailPage />} />
				<Route path="/projects/:projectId/sprints" element={<SprintManagementPage />} />
				<Route path="/project-allocation" element={<ProjectAllocationPage />} />
				<Route path="/project-allocation/:projectId" element={<ProjectAllocationDetailPage />} />
				<Route path="/tasks" element={<Tasks />} />
				<Route path="/tasks/project/:projectId" element={<ProjectBacklogPage />} />
				<Route path="/tasks/project/:projectId/board" element={<TaskBoardPage />} />
				<Route path="/tasks/project/:projectId/sprint/:sprintId" element={<TaskBoardPage />} />
				<Route path="/tasks/project/:projectId/task/:taskId" element={<TaskDetailPage />} />
				<Route path="/tasks-dashboard" element={<TaskDashboardPage />} />
				<Route path="/tasks/export" element={<TaskExportPage />} />
				<Route path="/tasks/export/:projectId" element={<Navigate to="/tasks/export" replace />} />
				<Route path="/tasks/editor/:excelId" element={<TaskExcelEditorPage />} />
				<Route path="/reports" element={<ReportPage />} />
				<Route path="/meetings" element={<Navigate to="/404" replace />} />
				<Route path="/permission-request" element={<Navigate to="/404" replace />} />
				<Route path="/profile/complete" element={<ProfileCompletePage />} />
				<Route path="/monitor" element={<EmployeeMonitorPage />} />
				<Route path="/work-time" element={<WorkTimeAnalyticsPage />} />
				<Route path="/work-time/users/:userId" element={<UserWorkTimeInsightPage />} />
				<Route path="/monitor/live" element={<ManagerMonitorDashboard />} />
				<Route path="/404" element={<NotFoundPage />} />
			</Route>

			{/* Catch-all 404 route - must be last */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
