/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDkJHAAIo51cd4wtZGlhNnonAad9P37KaA",
  authDomain: "saudi-job-f499b.firebaseapp.com",
  projectId: "saudi-job-f499b",
  storageBucket: "saudi-job-f499b.appspot.com",
  messagingSenderId: "316409349988",
  appId: "1:316409349988:web:e0f28e55e1c3d89880dc71"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(() => {});

// ✅ Always open app when notification clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Firebase sometimes wraps data inside FCM_MSG
  const raw = event.notification?.data || {};
  const data = raw?.FCM_MSG?.data || raw || {};

  const targetTab = data.targetTab || "";
  const jobId = data.jobId || "";
  const link = data.link || "";

  let path = "/";
  if (targetTab === "alerts") path = "/alerts";
  if (targetTab === "updates") path = "/updates";

  const params = new URLSearchParams();
  if (jobId) params.set("jobId", jobId);
  if (link) params.set("link", link);

  const finalUrl = params.toString()
    ? `${path}?${params.toString()}`
    : path;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus if already open
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(finalUrl);
          return client.focus();
        }
      }
      // Otherwise open new
      return clients.openWindow(finalUrl);
    })
  );
});
