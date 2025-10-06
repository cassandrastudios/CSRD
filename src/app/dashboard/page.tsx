import { Dashboard } from '@/components/dashboard'
import { AuthWrapper } from '@/components/auth-wrapper'

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  )
}
