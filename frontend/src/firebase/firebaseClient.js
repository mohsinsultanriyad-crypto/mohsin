import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDkJHAAIo51cd4wtZGlhNnonAad9P37KaA",
  authDomain: "saudi-job-f499b.firebaseapp.com",
  projectId: "saudi-job-f499b",
  storageBucket: "saudi-job-f499b.firebasestorage.app",
  messagingSenderId: "316409349988",
  appId: "1:316409349988:web:e0f28e55e1c3d89880dc71"
};

const app = initializeApp(firebaseConfig);

export function getMessagingInstance() {
  return getMessaging(app);
}

export async function enableNotifications(vapidKey) {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Permission denied");

  const messaging = getMessagingInstance();
  const token = await getToken(messaging, { vapidKey });
  if (!token) throw new Error("No FCM token generated");
  return token;
}

export function listenForegroundNotifications() {
  try {
    const messaging = getMessagingInstance();
    onMessage(messaging, (payload) => {
      const title = payload?.notification?.title || "SAUDI JOB";
      const body = payload?.notification?.body || "";
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
    });
  } catch {}
}
