import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import AuthProvider from './components/AuthProvider'
import TabProvider from './components/TabProvider'
import PasswordSavingProvider from './components/PasswordSavingProvider'

import Login from './pages/Login'
import ProjectsList from './pages/ProjectsList'
import Project from './pages/Project'
import Settings from './pages/Settings'
import NoContext from './pages/NoContext'

const queryClient = new QueryClient({
  keepPreviousData: false,
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PasswordSavingProvider>
          <TabProvider>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/project" element={<Project />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/nocontext" element={<NoContext />} />
              </Routes>
            </AuthProvider>
          </TabProvider>
        </PasswordSavingProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

export default App
