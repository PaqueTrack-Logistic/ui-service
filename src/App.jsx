import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
<<<<<<< HEAD
import MainLayout from './components/MainLayout';
=======
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
>>>>>>> ecf40e9156bd359678e40ebe478c482862a63c49
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ShipmentsPage from './pages/ShipmentsPage';
import TrackingPage from './pages/TrackingPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
<<<<<<< HEAD
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/shipments" element={<MainLayout><ShipmentsPage /></MainLayout>} />
          <Route path="/tracking" element={<MainLayout><TrackingPage /></MainLayout>} />
          <Route path="/admin" element={<MainLayout><AdminPage /></MainLayout>} />
        </Routes>
=======
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/shipments" element={<ProtectedRoute><ShipmentsPage /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          </Routes>
        </main>
>>>>>>> ecf40e9156bd359678e40ebe478c482862a63c49
      </AuthProvider>
    </BrowserRouter>
  );
}
