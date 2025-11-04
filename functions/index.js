const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.checkExpiredMatches = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = Date.now();
    
    const expiredMatches = await db.collection('matches')
      .where('expiresAt', '<=', now)
      .where('messageCount', '==', 0)
      .get();
    
    const batch = db.batch();
    expiredMatches.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${expiredMatches.size} expired matches`);
  });