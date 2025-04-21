import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { NotificationsProvider } from '@/hooks/useNotifications';
import { Toaster } from "@/components/ui/toaster";
import HomePage from '@/pages/Index';
import EventsPage from '@/pages/EventsPage';
import EventDetailsPage from '@/pages/EventDetail';
import CalendarPage from '@/pages/CalendarPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import AuthPage from '@/pages/AuthPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import NotFoundPage from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
