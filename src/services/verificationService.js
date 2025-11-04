import { db } from '../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'

export const verifyUser = async (userId, verificationData) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      isVerified: true,
      verificationData
    })
    return true
  } catch (error) {
    throw error
  }
}