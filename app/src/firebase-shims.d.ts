declare module "firebase/app" {
  export type FirebaseApp = unknown;
  export function initializeApp(options: Record<string, unknown>): FirebaseApp;
}

declare module "firebase/analytics" {
  export type Analytics = unknown;
  export function getAnalytics(app?: unknown): Analytics;
}

declare module "firebase/auth" {
  export type Auth = unknown;
  export type User = {
    uid?: string;
    email?: string | null;
  };

  export function getAuth(app?: unknown): Auth;
  export function onAuthStateChanged(
    auth: Auth,
    callback: (user: User | null) => void,
  ): () => void;
  export function signInWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<unknown>;
  export function createUserWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<unknown>;
  export function signOut(auth: Auth): Promise<void>;
}
