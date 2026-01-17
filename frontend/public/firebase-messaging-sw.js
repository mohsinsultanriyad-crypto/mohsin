importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDkJHAAIo51cd4wtZGlhNnonAad9P37KaA",
  authDomain: "saudi-job-f499b.firebaseapp.com",
  projectId: "saudi-job-f499b",
  storageBucket: "saudi-job-f499b.firebasestorage.app",
  messagingSenderId: "316409349988",
  appId:  "1:316409349988:web:e0f28e55e1c3d89880dc71",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/logo.png"
    }
  );
});
