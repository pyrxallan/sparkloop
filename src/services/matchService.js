import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Create a new match
 */
export const createMatch = async (user1Id, user2Id, user2Data) => {
  try {
    const matchData = {
      user1Id,
      user2Id,
      user2Name: user2Data.name,
      user2Age: user2Data.age,
      user2Bio: user2Data.bio,
      user2PhotoUrl: user2Data.photoUrl,
      matchedAt: serverTimestamp(),
      expiresAt: Date.now() + 86400000, // 24 hours from now
      messageCount: 0,
      status: 'active',
      iceBreaker: generateIceBreaker(user2Data.interests)
    };

    const matchRef = await addDoc(collection(db, 'matches'), matchData);
    return { id: matchRef.id, ...matchData };
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

/**
 * Get all matches for a user
 */
export const getUserMatches = async (userId) => {
  try {
    const q = query(
      collection(db, 'matches'),
      where('user1Id', '==', userId),
      where('status', '==', 'active'),
      orderBy('matchedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const matches = [];
    
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });

    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

/**
 * Listen to real-time match updates
 */
export const subscribeToMatches = (userId, callback) => {
  const q = query(
    collection(db, 'matches'),
    where('user1Id', '==', userId),
    where('status', '==', 'active'),
    orderBy('matchedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const matches = [];
    snapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });
    callback(matches);
  });
};

/**
 * Get a specific match by ID
 */
export const getMatchById = async (matchId) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      return { id: matchSnap.id, ...matchSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
};

/**
 * Update match message count
 */
export const incrementMessageCount = async (matchId) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      const currentCount = matchSnap.data().messageCount || 0;
      await updateDoc(matchRef, {
        messageCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error updating message count:', error);
    throw error;
  }
};

/**
 * Delete expired match
 */
export const deleteMatch = async (matchId) => {
  try {
    await deleteDoc(doc(db, 'matches', matchId));
  } catch (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
};

/**
 * Check for expired matches and delete them
 */
export const cleanupExpiredMatches = async (userId) => {
  try {
    const matches = await getUserMatches(userId);
    const now = Date.now();
    
    for (const match of matches) {
      if (match.expiresAt < now && match.messageCount === 0) {
        await deleteMatch(match.id);
      }
    }
  } catch (error) {
    console.error('Error cleaning up expired matches:', error);
    throw error;
  }
};

/**
 * Generate AI ice breaker based on interests
 */
const generateIceBreaker = (interests) => {
  const iceBreakers = [
    `Hey! I noticed we both love ${interests?.[0] || 'similar things'}. What got you into it?`,
    `Hi there! ${interests?.[0] || 'Your profile'} caught my eye. Tell me more about your interests!`,
    `Hello! I see you're into ${interests?.[0] || 'cool stuff'}. Any recommendations?`,
    `Hey! Your interest in ${interests?.[0] || 'your hobbies'} is intriguing. How did you get started?`
  ];
  
  return iceBreakers[Math.floor(Math.random() * iceBreakers.length)];
};

/**
 * Get potential matches (excluding already matched users)
 */
export const getPotentialMatches = async (userId, limit = 10) => {
  try {
    // Get all users except current user
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', userId));
    
    const querySnapshot = await getDocs(q);
    const potentialMatches = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.profileCompleted) {
        potentialMatches.push({ id: doc.id, ...userData });
      }
    });
    
    // Shuffle and limit
    return potentialMatches
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    throw error;
  }
};