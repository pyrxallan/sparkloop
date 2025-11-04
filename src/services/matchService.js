import { db } from '../firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'

export const getMatches = async (userId) => {
  try {
    const matchesRef = collection(db, 'matches')
    const q = query(matchesRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    throw error
  }
}