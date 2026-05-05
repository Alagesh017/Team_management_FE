import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Login from '../features/auth/pages/login'
import Register from '../features/auth/pages/register'
import Dashboard from '../features/dashboard/pages/Dashboard'
import AdminPage from '../features/admin/pages/AdminPage'
import WorkerPage from '../features/workers/pages/WorkerPage'
import TaskStatusPage from '../features/task-status/pages/TaskStatusPage'
import ClientPage from '../features/clients/pages/ClientPage'
import ProjectPage from '../features/projects/pages/ProjectPage'
import ProjectDetailPage from '../features/projects/pages/ProjectDetailPage'
import { ProtectedRoute } from '../common/components/ProtectedRoute'

// Dummy components for testing
const Attendance = () => <div className="text-2xl font-bold">Attendance</div>
const ProjectAllocation = () => <div className="text-2xl font-bold">Project Allocation</div>
const Tasks = () => <div className="text-2xl font-bold">Tasks</div>
const ProjectTasks = () => <div className="text-2xl font-bold">Project Specific Tasks</div>
const Meetings = () => <div className="text-2xl font-bold">Meetings</div>
const PermissionRequest = () => <div className="text-2xl font-bold">Permission Request</div>

export default function AppRoutes() {
	return (
		<Router basename="/">
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
				<Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
				<Route path="/project-allocation" element={<ProtectedRoute><ProjectAllocation /></ProtectedRoute>} />
				<Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
				<Route path="/tasks/project/:id" element={<ProtectedRoute><ProjectTasks /></ProtectedRoute>} />
				<Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
				<Route path="/permission-request" element={<ProtectedRoute><PermissionRequest /></ProtectedRoute>} />
			</Routes>
		</Router>
	)
}
