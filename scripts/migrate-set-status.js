import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
  // Or use cert() with service account key JSON if needed
});

const db = getFirestore();

async function updateMissingStatus() {
  const usersSnapshot = await db.collection('users').get();

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;

    // Update resale properties
    const resaleSnapshot = await db.collection('users').doc(userId).collection('resaleProperties').get();
    for (const doc of resaleSnapshot.docs) {
      const data = doc.data();
      if (!data.status) {
        console.log(`Updating resale property ${doc.id} for user ${userId} with missing status`);
        await doc.ref.update({ status: 'Pending Approval' });
      }
    }

    // Update rental properties
    const rentalSnapshot = await db.collection('users').doc(userId).collection('rentalProperties').get();
    for (const doc of rentalSnapshot.docs) {
      const data = doc.data();
      if (!data.status) {
        console.log(`Updating rental property ${doc.id} for user ${userId} with missing status`);
        await doc.ref.update({ status: 'Pending Approval' });
      }
    }
  }

  console.log('Migration completed: Missing status fields updated.');
}

updateMissingStatus().catch(console.error);
