import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const getFirebaseConfig = () => {
    const apiKey = localStorage.getItem('firebase_api_key');
    const authDomain = localStorage.getItem('firebase_auth_domain');
    const projectId = localStorage.getItem('firebase_project_id');
    const enabled = localStorage.getItem('firebase_enabled') === 'true';

    if (!enabled || !apiKey || !authDomain || !projectId) {
        return null;
    }

    return {
        apiKey,
        authDomain,
        projectId
    };
};

export const initFirebase = () => {
    const config = getFirebaseConfig();
    
    if (!config) return null;

    try {
        // Prevent multiple initializations
        const app = !getApps().length ? initializeApp(config) : getApp();
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        return { app, auth, db };
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        return null;
    }
};