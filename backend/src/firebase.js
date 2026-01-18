import admin from "firebase-admin";

let initialized = false;

export function initFirebase(serviceAccountJsonString) {
  if (initialized) return;

  if (!serviceAccountJsonString) {
    console.log("⚠️ Firebase not initialized (FIREBASE_SERVICE_ACCOUNT_JSON missing). Push will be disabled.");
    return;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJsonString);
  } catch (e) {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON (must be valid JSON)");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  initialized = true;
  console.log("✅ Firebase Admin initialized");
}

export function getAdmin() {
  return admin;
}

export function isFirebaseReady() {
  return initialized;
}
