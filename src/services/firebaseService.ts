import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { ExportData } from '../types/analysis';
import { firebaseConfig } from '../config/firebase';
import dotenv from 'dotenv';

dotenv.config();

export class FirebaseService {
  private app: App;
  private db: Firestore;

  constructor() {
    // Check required Firebase config values
    if (!firebaseConfig.project_id || !firebaseConfig.private_key || !firebaseConfig.client_email) {
      throw new Error('Missing required Firebase configuration: project_id, private_key, client_email');
    }

    // Initialize Firebase Admin SDK
    if (getApps().length === 0) {
      this.app = initializeApp({
        credential: cert({
          projectId: firebaseConfig.project_id,
          privateKey: firebaseConfig.private_key,
          clientEmail: firebaseConfig.client_email,
        }),
      });
    } else {
      this.app = getApps()[0];
    }

    this.db = getFirestore(this.app);
  }

  async pushAnalysisResults(results: ExportData): Promise<void> {
    try {
      const timestamp = new Date();

      // Add timestamp to the results
      const resultsWithTimestamp = {
        ...results,
        lastUpdated: timestamp,
      };

      // Update the analysis results document (overwrites previous data)
      await this.db.collection('analysis-results').doc('results').set(resultsWithTimestamp);

      console.log(`✅ Analysis results updated in Firebase at ${timestamp.toISOString()}`);
    } catch (error) {
      console.error('❌ Failed to push results to Firebase:', error);
      throw error;
    }
  }

  async getResults(): Promise<ExportData | null> {
    try {
      const doc = await this.db.collection('analysis-results').doc('results').get();
      if (doc.exists) {
        return doc.data() as ExportData;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get results from Firebase:', error);
      throw error;
    }
  }
}
