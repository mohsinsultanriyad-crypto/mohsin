import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

let messaging = null;

export async function registerMessagingSW() {
  if (!("serviceWorker" in navigator)) return;

  try {
    // Register SW
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // Patch config placeholders (compat SW reads config above; here we set notification data only)
    // This is best-effort; some browsers cache SW. If you want perfect, you can hardcode config in SW.
    await navigator.serviceWorker.ready;

    return reg;
  } catch (e) {
    console.log("SW register failed:", e?.message || e);
    return null;
  }
}

export async function getFcmToken() {
  const supported = await isSupported().catch(() => false);
  if (!supported) return { ok: false, reason: "not_supported" };

  if (!messaging) messaging = getMessaging(app);

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) return { ok: false, reason: "missing_vapid" };

  try {
    const token = await getToken(messaging, { vapidKey });
    if (!token) return { ok: false, reason: "no_token" };
    return { ok: true, token };
  } catch (e) {
    return { ok: false, reason: e?.message || "token_error" };
  }
}

export async function initFcmForegroundListener(cb) {
  const supported = await isSupported().catch(() => false);
  if (!supported) return;

  if (!messaging) messaging = getMessaging(app);

  onMessage(messaging, (payload) => {
    cb?.(payload);
  });
}
