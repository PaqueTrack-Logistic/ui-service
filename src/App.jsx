import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LogisticsReportPage from './pages/LogisticsReportPage';
import RegisterPage from './pages/RegisterPage';
import ShipmentsPage from './pages/ShipmentsPage';
import TrackingPage from './pages/TrackingPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/shipments" element={<MainLayout><ShipmentsPage /></MainLayout>} />
          <Route path="/tracking" element={<MainLayout><TrackingPage /></MainLayout>} />
          <Route path="/admin" element={<MainLayout><AdminPage /></MainLayout>} />
          <Route path="/admin/users" element={<MainLayout><AdminUsersPage /></MainLayout>} />
          <Route
            path="/shipments/report"
            element={(
              <MainLayout>
                <RoleProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_LOGISTICS"]}>
                  <LogisticsReportPage />
                </RoleProtectedRoute>
              </MainLayout>
            )}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
