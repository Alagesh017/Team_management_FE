import AppRoutes from './routes/app-routes'
import { BrowserRouter as Router } from 'react-router-dom'
import { ProjectProvider } from './features/projects/contexts/ProjectContext'
import { ProjectAllocationProvider } from './features/project-allocation/contexts/ProjectAllocationContext'
import MicrosoftRedirectHandler from './features/auth/components/MicrosoftRedirectHandler'
import { Toaster } from './common/components/Toaster'
import { useAuth } from './features/auth/contexts/AuthContext'
import { ProfileProvider } from './features/profile/contexts/ProfileContext'
import ProfileOnboardingWizard from './features/profile/components/ProfileOnboardingWizard'
 
function AppRoutesWithProfile() {
	const { user, loading } = useAuth()

	if (loading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
			</div>
		)
	}

	if (!user) {
		return <AppRoutes />
	}

	return (
		<ProfileProvider>
			<AppRoutes />
			<ProfileOnboardingWizard />
		</ProfileProvider>
	)
}

function App() {
	const basePath = import.meta.env.VITE_BASE_PATH || '/taskmanagement'
	return (
		<Router basename={basePath}>
			<MicrosoftRedirectHandler />
			<ProjectProvider>
				<ProjectAllocationProvider>
					<Toaster />
					<AppRoutesWithProfile />
				</ProjectAllocationProvider>
			</ProjectProvider>
		</Router>
	)
}

export default App
