import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import PersonnelLoginPage from './pages/PersonnelLoginPage'
import PatientPortalPage from './pages/PatientPortalPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import PersonnelDashboard from './pages/personnel/PersonnelDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import DirecteurDashboard from './pages/directeur/DirecteurDashboard'
import ChefServiceDashboard from './pages/chef/ChefServiceDashboard'
import InfirmierDashboard from './pages/InfirmierDashboard'
import BrancardierDashboard from './pages/BrancardierDashboard'
import AssignerTaches from './pages/medecin/AssignerTaches'
import MesTaches from './pages/infirmier/MesTaches'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/personnel" element={<PersonnelLoginPage />} />
      <Route path="/patient" element={<PatientPortalPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/patient/dashboard" element={
        <ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/personnel/dashboard" element={
        <ProtectedRoute allowedRoles={['MEDECIN', 'PERSONNEL', 'SECRETARY', 'AIDE_SOIGNANT']}><PersonnelDashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/directeur" element={
        <ProtectedRoute allowedRoles={['DIRECTEUR', 'ADMIN']}><DirecteurDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/chef" element={
        <ProtectedRoute allowedRoles={['CHEF_SERVICE']}><ChefServiceDashboard /></ProtectedRoute>
      } />
      <Route path="/infirmier/dashboard" element={
        <ProtectedRoute allowedRoles={['INFIRMIER']}><InfirmierDashboard /></ProtectedRoute>
      } />
      <Route path="/brancardier/dashboard" element={
        <ProtectedRoute allowedRoles={['BRANCARDIER']}><BrancardierDashboard /></ProtectedRoute>
      } />
      <Route path="/medecin/taches" element={
        <ProtectedRoute allowedRoles={['MEDECIN']}><AssignerTaches /></ProtectedRoute>
      } />
      <Route path="/infirmier/taches" element={
        <ProtectedRoute allowedRoles={['INFIRMIER']}><MesTaches /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}