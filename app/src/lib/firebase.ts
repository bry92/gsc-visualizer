import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

export const isFirebaseConfigured = requiredKeys.every(
  (key) => Boolean(import.meta.env[key as keyof ImportMetaEnv]),
);

let firebaseAuth: Auth | null = null;

if (isFirebaseConfigured) {
  const firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
}

export { firebaseAuth };
