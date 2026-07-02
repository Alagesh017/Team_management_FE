import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../features/auth/pages/login'
import Register from '../features/auth/pages/register'
import Dashboard from '../features/dashboard/pages/Dashboard'
import AdminPage from '../features/admin/pages/AdminPage'
import WorkerPage from '../features/workers/pages/WorkerPage'
import TaskStatusPage from '../features/task-status/pages/TaskStatusPage'
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
import { ProtectedRoute } from '../common/components/ProtectedRoute'

// Dummy components for testing
const Tasks = () => <div className="text-2xl font-bold">Tasks</div>

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/register" element={<Register />} />
			
			{/* Protected Routes */}
			<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
			<Route path="/leave" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
			<Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
			<Route path="/workers" element={<ProtectedRoute><WorkerPage /></ProtectedRoute>} />
			<Route path="/task-status" element={<ProtectedRoute><TaskStatusPage /></ProtectedRoute>} />
			<Route path="/attendance" element={<ProtectedRoute><Navigate to="/404" replace /></ProtectedRoute>} />
			<Route path="/clients" element={<ProtectedRoute><ClientPage /></ProtectedRoute>} />
			<Route path="/projects" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
			<Route path="/project-grouping" element={<ProtectedRoute><ProjectGroupPage /></ProtectedRoute>} />
			<Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/projects/:projectId/sprints" element={<ProtectedRoute><SprintManagementPage /></ProtectedRoute>} />
            <Route path="/project-allocation" element={<ProtectedRoute><ProjectAllocationPage /></ProtectedRoute>} />
			<Route path="/project-allocation/:projectId" element={<ProtectedRoute><ProjectAllocationDetailPage /></ProtectedRoute>} />
			<Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
			<Route path="/tasks/project/:projectId" element={<ProtectedRoute><ProjectBacklogPage /></ProtectedRoute>} />
			<Route path="/tasks/project/:projectId/board" element={<ProtectedRoute><TaskBoardPage /></ProtectedRoute>} />
			<Route path="/tasks/project/:projectId/sprint/:sprintId" element={<ProtectedRoute><TaskBoardPage /></ProtectedRoute>} />
			<Route path="/tasks/project/:projectId/task/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
			<Route path="/tasks-dashboard" element={<ProtectedRoute><TaskDashboardPage /></ProtectedRoute>} />
			<Route path="/tasks/export" element={<ProtectedRoute><TaskExportPage /></ProtectedRoute>} />
			<Route path="/tasks/export/:projectId" element={<Navigate to="/tasks/export" replace />} />
			<Route path="/tasks/editor/:excelId" element={<ProtectedRoute><TaskExcelEditorPage /></ProtectedRoute>} />
			<Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
			<Route path="/meetings" element={<ProtectedRoute><Navigate to="/404" replace /></ProtectedRoute>} />
			<Route path="/permission-request" element={<ProtectedRoute><Navigate to="/404" replace /></ProtectedRoute>} />
			<Route path="/404" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
			
			{/* Catch-all 404 route - must be last */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
