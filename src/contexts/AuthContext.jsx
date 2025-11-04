import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import OnboardingPage from './components/OnboardingPage';
import VerificationPage from './components/VerificationPage';
import DiscoverPage from './components/DiscoverPage';
import MatchesPage from './components/MatchesPage';
import ChatPage from './components/ChatPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/chat/:matchId" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;