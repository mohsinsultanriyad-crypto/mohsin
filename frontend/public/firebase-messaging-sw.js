/* global firebase */
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
 apiKey: "AIzaSyDkJHAAIo51cd4wtZGlhNnonAad9P37KaA",
   authDomain: "saudi-job-f499b.firebaseapp.com",
   projectId: "saudi-job-f499b",
   storageBucket: "saudi-job-f499b.firebasestorage.app",
   messagingSenderId: "316409349988",
   appId: "1:316409349988:web:e0f28e55e1c3d89880dc71",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Saudi Job";
  const options = {
    body: payload?.notification?.body || "",
    data: payload?.data || {}
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification?.data || {};
  const target = data.clickTarget || "alerts";
  const newsLink = data.newsLink || "";

  let url = `${self.location.origin}/${target}`;

  if (target === "updates" && newsLink) {
    url = `${self.location.origin}/updates?open=${encodeURIComponent(newsLink)}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
