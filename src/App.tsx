
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/session/AuthContext';

import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthShellLayout } from './layouts/AuthShellLayout';

import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { HomePage } from './pages/Home';
import { ProfilePage } from './pages/Profile';
import { PublicProfilePage } from './pages/PublicProfile';
import { ComposePage } from './pages/Compose';
import { SettingsPage } from './pages/Settings';
import { PostDetailPage } from './pages/PostDetail';
import { NotFoundPage } from './pages/NotFound';

import { ToastProvider } from './components/ui/Toast';
import { GlobalModals } from './components/GlobalModals';
import { NotificationPage } from './pages/Notification';
import { TrashPage } from './pages/Trash';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <GlobalModals />
            <Routes>
              {/* Public Logic */}
              <Route element={<PublicOnlyRoute><PublicLayout /></PublicOnlyRoute>}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Main Application Logic */}
              <Route element={<AuthShellLayout />}>
                {/* Home is accessible to everyone, but behaves differently via useAuth() hook inside Home */}
                <Route path="/" element={<HomePage />} />
                
                {/* Post detail page */}
                <Route path="/post/:postId" element={<PostDetailPage />} />

                {/* Public user profile by username */}
                <Route path="/u/:username" element={<PublicProfilePage />} />

                {/* Protected Routes inside the Shell */}
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/compose" element={<ProtectedRoute><ComposePage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
                <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
