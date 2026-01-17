importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDkJHAAIo51cd4wtZGlhNnonAad9P37KaA",
  authDomain: "saudi-job-f499b.firebaseapp.com",
  projectId: "saudi-job-f499b",
  storageBucket: "saudi-job-f499b.firebasestorage.app",
  messagingSenderId: "316409349988",
  appId: "1:316409349988:web:e0f28e55e1c3d89880dc71"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload?.notification?.title || "SAUDI JOB";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/logo.png",
    data: {
      url: payload?.data?.url || "/"
    }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })()
  );
});
