import AppRoutes from './routes/app-routes'
import { AuthProvider } from './features/auth/contexts/AuthContext'
import { ProjectProvider } from './features/projects/contexts/ProjectContext'
import { ProjectAllocationProvider } from './features/project-allocation/contexts/ProjectAllocationContext'

function App() {
	return (
		<AuthProvider>
			<ProjectProvider>
				<ProjectAllocationProvider>
					<AppRoutes />
				</ProjectAllocationProvider>
			</ProjectProvider>
		</AuthProvider>
	)
}

export default App
