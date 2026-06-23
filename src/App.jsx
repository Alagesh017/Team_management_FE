import AppRoutes from './routes/app-routes'
import { BrowserRouter as Router } from 'react-router-dom'
import { ProjectProvider } from './features/projects/contexts/ProjectContext'
import { ProjectAllocationProvider } from './features/project-allocation/contexts/ProjectAllocationContext'
import MicrosoftRedirectHandler from './features/auth/components/MicrosoftRedirectHandler'
import { Toaster } from './common/components/Toaster'
 
function App() {
	const basePath = import.meta.env.VITE_BASE_PATH || '/taskmanagement'
	return (
		<Router basename={basePath}>
			<MicrosoftRedirectHandler />
			<ProjectProvider>
				<ProjectAllocationProvider>
					<Toaster />
					<AppRoutes />
				</ProjectAllocationProvider>
			</ProjectProvider>
		</Router>
	)
}

export default App
