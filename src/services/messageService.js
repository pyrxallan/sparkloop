import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { incrementMessageCount } from './matchService';

/**
 * Send a message
 */
export const sendMessage = async (matchId, senderId, receiverId, text) => {
  try {
    const messageData = {
      matchId,
      senderId,
      receiverId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      read: false
    };

    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update match message count
    await incrementMessageCount(matchId);
    
    return { id: messageRef.id, ...messageData };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Subscribe to messages for a specific match
 */
export const subscribeToMessages = (matchId, callback) => {
  const q = query(
    collection(db, 'messages'),
    where('matchId', '==', matchId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toMillis() || Date.now()
      });
    });
    callback(messages);
  });
};

/**
 * Get message count for a match
 */
export const getMessageCount = async (matchId) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('matchId', '==', matchId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting message count:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (matchId, userId) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('matchId', '==', matchId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    
    querySnapshot.forEach((doc) => {
      updatePromises.push(
        updateDoc(doc.ref, { read: true })
      );
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};