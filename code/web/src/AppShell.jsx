
import { useState } from 'react'
import LoginPage           from './LoginPage'
import NBSHeader           from './NBSHeader'
import SuperAdminDashboard from './SuperAdminDashboard'
import { API } from './api'

export default function AppShell() {
  const [authState,     setAuthState]     = useState(null)  // { accessToken, refreshToken, user }
  const [activeSection, setActiveSection] = useState('Dashboard')

  // Called by LoginPage on successful login
  const handleLogin = (data) => {
    // data = { accessToken, refreshToken, user }
    setAuthState(data)
    sessionStorage.setItem('nbs_token', data.accessToken)
    sessionStorage.setItem('nbs_user',  JSON.stringify(data.user))
  }

  const handleLogout = () => {
    setAuthState(null)
    sessionStorage.removeItem('nbs_token')
    sessionStorage.removeItem('nbs_user')
  }

  if (!authState) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#060f1e]">
      <NBSHeader activeSection={activeSection} user={authState.user} />
      <div className="flex-1 overflow-hidden">
        <SuperAdminDashboard
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          authToken={authState.accessToken}
          currentUser={authState.user}
        />
      </div>
    </div>
  )
}
