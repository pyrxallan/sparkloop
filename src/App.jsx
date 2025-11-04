import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import OnboardingPage from './components/OnboardingPage';
import VerificationPage from './components/VerificationPage';
import DiscoverPage from './components/DiscoverPage';
import MatchesPage from './components/MatchesPage';
import ChatPage from './components/ChatPage';

// Mock authentication service
const mockAuth = {
  signInWithGoogle: () => Promise.resolve({ 
    uid: 'user_' + Date.now(), 
    email: 'demo@sparkloop.app',
    displayName: 'Demo User'
  }),
  signInWithGitHub: () => Promise.resolve({ 
    uid: 'user_' + Date.now(), 
    email: 'demo@sparkloop.app',
    displayName: 'Demo User'
  }),
  signOut: () => Promise.resolve()
};

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Initialize demo matches when user logs in
  useEffect(() => {
    if (user && profile && matches.length === 0) {
      const demoMatches = [
        {
          id: 'match_1',
          userId: 'demo_user_1',
          name: 'Alex Chen',
          age: 27,
          bio: 'Software engineer who loves hiking',
          photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          matchedAt: Date.now() - 3600000,
          expiresAt: Date.now() + 82800000,
          messageCount: 0,
          iceBreaker: 'What\'s your favorite hiking trail?'
        },
        {
          id: 'match_2',
          userId: 'demo_user_2',
          name: 'Sam Rivera',
          age: 24,
          bio: 'Artist & coffee enthusiast',
          photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam',
          matchedAt: Date.now() - 7200000,
          expiresAt: Date.now() + 79200000,
          messageCount: 3,
          iceBreaker: 'Best coffee shop in town?'
        }
      ];
      setMatches(demoMatches);
    }
  }, [user, profile, matches.length]);

  const handleSocialLogin = async (provider) => {
    try {
      const result = provider === 'google' 
        ? await mockAuth.signInWithGoogle() 
        : await mockAuth.signInWithGitHub();
      
      setUser(result);
      
      // Set initial profile
      const initialProfile = {
        uid: result.uid,
        email: result.email,
        displayName: result.displayName,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.uid}`,
        verified: false
      };
      setProfile(initialProfile);
      
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleProfileComplete = (profileData) => {
    setProfile({
      ...profile,
      ...profileData,
      completedAt: Date.now()
    });
  };

  const handleVerificationComplete = (verificationData) => {
    setProfile({
      ...profile,
      verified: verificationData.verified,
      verifiedAt: verificationData.timestamp
    });
  };

  const handleNewMatch = (match) => {
    setMatches([...matches, match]);
  };

  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
  };

  const handleSendMessage = (matchId, message) => {
    // Update match message count
    setMatches(matches.map(m => 
      m.id === matchId 
        ? { ...m, messageCount: m.messageCount + 1 }
        : m
    ));
  };

  const handleLogout = async () => {
    await mockAuth.signOut();
    setUser(null);
    setProfile(null);
    setMatches([]);
    setSelectedMatch(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/discover" /> : <LandingPage onSocialLogin={handleSocialLogin} />
          } 
        />
        
        <Route 
          path="/onboarding" 
          element={
            user ? (
              <OnboardingPage onProfileComplete={handleProfileComplete} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        <Route 
          path="/verify" 
          element={
            user ? (
              <VerificationPage onVerificationComplete={handleVerificationComplete} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        <Route 
          path="/discover" 
          element={
            user ? (
              <DiscoverPage matches={matches} onNewMatch={handleNewMatch} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        <Route 
          path="/matches" 
          element={
            user ? (
              <MatchesPage matches={matches} onSelectMatch={handleSelectMatch} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        <Route 
          path="/chat/:matchId" 
          element={
            user ? (
              <ChatPage selectedMatch={selectedMatch} onSendMessage={handleSendMessage} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;