import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ShipmentsPage from './pages/ShipmentsPage';
import TrackingPage from './pages/TrackingPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
