import admin from "firebase-admin";

export function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const raw = process.env.FIREBASE_ADMIN_JSON;
  if (!raw) throw new Error("FIREBASE_ADMIN_JSON missing in env");

  const serviceAccount = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin;
}
