import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import OnboardingPage from './components/OnboardingPage';
import VerificationPage from './components/VerificationPage';
import DiscoverPage from './components/DiscoverPage';
import MatchesPage from './components/MatchesPage';
import ChatPage from './components/ChatPage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithGoogle, signInWithGitHub, signOut } from './services/authService';
import { subscribeToMatches } from './services/matchService';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [matchesUnsub, setMatchesUnsub] = useState(null);
  const [messages, setMessages] = useState([]);

  // Monitor authentication state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setMatches([]);
        setSelectedMatch(null);
      }
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setProfile({ uid: user.uid, email: user.email, displayName: user.displayName, verified: false });
        }
      });
    }
  }, [user]);

  // Re-monitor authentication state to handle profile fetching

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            setProfile({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, verified: false });
          }
        } else {
          setProfile(null);
          setMatches([]);
          setSelectedMatch(null);
        }
      } finally {
        setLoadingAuth(false);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to matches for the current user
  useEffect(() => {
    if (matchesUnsub) {
      matchesUnsub();
      setMatchesUnsub(null);
    }
    if (user?.uid) {
      const unsub = subscribeToMatches(user.uid, (list) => setMatches(list));
      setMatchesUnsub(() => unsub);
    }
    return () => {
      if (matchesUnsub) matchesUnsub();
    };
  }, [user?.uid]);

  const handleSocialLogin = async (provider) => {
    return provider === 'google' ? await signInWithGoogle() : await signInWithGitHub();
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
    setMatches((prev) => [...prev, match]);
  };

  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
  };

  const handleSendMessage = (matchId, message) => {
    setMatches((prev) => prev.map(m => m.id === matchId ? { ...m, messageCount: (m.messageCount || 0) + 1 } : m));
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loadingAuth) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={!profile?.profileCompleted ? "/onboarding" : (!profile?.verified ? "/verify" : "/discover")} />
            ) : (
              <LandingPage onSocialLogin={handleSocialLogin} />
            )
          }
        />

        <Route
          path="/onboarding"
          element={
            user ? (
              !profile?.profileCompleted ? (
                <OnboardingPage onProfileComplete={handleProfileComplete} />
              ) : (
                <Navigate to={profile?.verified ? "/discover" : "/verify"} />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/verify"
          element={
            user ? (
              profile?.profileCompleted && !profile?.verified ? (
                <VerificationPage onVerificationComplete={handleVerificationComplete} />
              ) : (
                <Navigate to={!profile?.profileCompleted ? "/onboarding" : "/discover"} />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/discover"
          element={
            user ? (
              profile?.profileCompleted && profile?.verified ? (
                <DiscoverPage matches={matches} onNewMatch={handleNewMatch} />
              ) : (
                <Navigate to={!profile?.profileCompleted ? "/onboarding" : "/verify"} />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/matches"
          element={
            user ? (
              profile?.profileCompleted && profile?.verified ? (
                <MatchesPage matches={matches} onSelectMatch={handleSelectMatch} />
              ) : (
                <Navigate to={!profile?.profileCompleted ? "/onboarding" : "/verify"} />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/chat/:matchId"
          element={
            user ? (
              profile?.profileCompleted && profile?.verified ? (
                <ChatPage selectedMatch={selectedMatch} onSendMessage={handleSendMessage} />
              ) : (
                <Navigate to={!profile?.profileCompleted ? "/onboarding" : "/verify"} />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;