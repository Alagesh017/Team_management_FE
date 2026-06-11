import { Routes, Route } from 'react-router-dom'
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
import ReportPage from '../features/reports/pages/ReportPage'
import { ProtectedRoute } from '../common/components/ProtectedRoute'

// Dummy components for testing
const Attendance = () => <div className="text-2xl font-bold">Attendance</div>
const Tasks = () => <div className="text-2xl font-bold">Tasks</div>
const Meetings = () => <div className="text-2xl font-bold">Meetings</div>
const PermissionRequest = () => <div className="text-2xl font-bold">Permission Request</div>

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/register" element={<Register />} />
			
			{/* Protected Routes */}
			<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
			<Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
			<Route path="/workers" element={<ProtectedRoute><WorkerPage /></ProtectedRoute>} />
			<Route path="/task-status" element={<ProtectedRoute><TaskStatusPage /></ProtectedRoute>} />
			<Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
			<Route path="/clients" element={<ProtectedRoute><ClientPage /></ProtectedRoute>} />
			<Route path="/projects" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
			<Route path="/project-grouping" element={<ProtectedRoute><ProjectGroupPage /></ProtectedRoute>} />
			<Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
			<Route path="/project-allocation" element={<ProtectedRoute><ProjectAllocationPage /></ProtectedRoute>} />
			<Route path="/project-allocation/:projectId" element={<ProtectedRoute><ProjectAllocationDetailPage /></ProtectedRoute>} />
			<Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
			<Route path="/tasks/project/:id" element={<ProtectedRoute><TaskBoardPage /></ProtectedRoute>} />
			<Route path="/tasks/project/:projectId/task/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
			<Route path="/tasks-dashboard" element={<ProtectedRoute><TaskDashboardPage /></ProtectedRoute>} />
			<Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
			<Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
			<Route path="/permission-request" element={<ProtectedRoute><PermissionRequest /></ProtectedRoute>} />
		</Routes>
	)
}
