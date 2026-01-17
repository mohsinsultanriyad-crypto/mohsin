importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDkJHAAIo51cd4wtZGlhNnonAad9P37KaA",
  authDomain: "saudi-job-f499b.firebaseapp.com",
  projectId: "saudi-job-f499b",
  storageBucket: "saudi-job-f499b.firebasestorage.app",
  messagingSenderId: "316409349988",
  appId: "1:316409349988:web:e0f28e55e1c3d89880dc71",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  // ✅ App ko message bhejo -> badge ++
  self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "PUSH_ALERT" }));
    });

  // ✅ Background notification show
  const title = payload?.notification?.title || "Saudi Job";
  const body = payload?.notification?.body || "New update";

  self.registration.showNotification(title, {
    body,
    icon: "/logo.png",
    data: payload?.data || {},
  });
});

// ✅ Notification click -> site open
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If already open, focus
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      // else open new
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
