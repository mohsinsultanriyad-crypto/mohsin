import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// ✅ Replace these placeholders with your Firebase Web config values
const firebaseConfig = {
  apiKey: "AIzaSyDkJHAAIo51cd4wtZGlhNnonAad9P37KaA",
  authDomain: "saudi-job-f499b.firebaseapp.com",
  projectId:"saudi-job-f499b",
  storageBucket: "saudi-job-f499b.firebasestorage.app",
  messagingSenderId: "316409349988",
  appId: "1:316409349988:web:e0f28e55e1c3d89880dc71",
};

// ✅ Replace with your VAPID public key (Firebase Cloud Messaging > Web push certificates)
const VAPID_KEY = "BKlCGsReCxG-c00ay_p8eJGvcZqNQ0hnpks0bCOBRSSyHLdHtH16RoK_LCE5QLypfWq14XSBKxOh7pRKwZD1AJw";

const app = initializeApp(firebaseConfig);

export async function initMessagingAndGetToken() {
  const supported = await isSupported();
  if (!supported) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const messaging = getMessaging(app);

  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  return token || null;
}
