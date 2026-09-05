import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;