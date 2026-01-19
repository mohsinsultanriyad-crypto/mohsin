/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "REPLACE_AT_BUILD_TIME",
  authDomain: "REPLACE_AT_BUILD_TIME",
  projectId: "REPLACE_AT_BUILD_TIME",
  storageBucket: "REPLACE_AT_BUILD_TIME",
  messagingSenderId: "REPLACE_AT_BUILD_TIME",
  appId: "REPLACE_AT_BUILD_TIME"
});

const messaging = firebase.messaging();

// Handles background notifications display (Firebase will show it)
messaging.onBackgroundMessage(function () {
  // no-op
});

// Open correct tab on notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const data = event.notification?.data || {};
  const targetTab = data.targetTab || data?.FCM_MSG?.data?.targetTab || "";
  const link = data.link || data?.FCM_MSG?.data?.link || "";
  const jobId = data.jobId || data?.FCM_MSG?.data?.jobId || "";

  let url = "/";
  if (targetTab === "alerts") url = "/alerts";
  if (targetTab === "updates") url = "/updates";

  const params = new URLSearchParams();
  if (link) params.set("link", link);
  if (jobId) params.set("jobId", jobId);

  const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(finalUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(finalUrl);
      return null;
    })
  );
});
