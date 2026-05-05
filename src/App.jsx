import AppRoutes from './routes/app-routes'
import { AuthProvider } from './features/auth/contexts/AuthContext'
import { ProjectProvider } from './features/projects/contexts/ProjectContext'

function App() {
	return (
		<AuthProvider>
			<ProjectProvider>
				<AppRoutes />
			</ProjectProvider>
		</AuthProvider>
	)
}

export default App
