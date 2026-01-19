import admin from "firebase-admin";

let firebaseReady = false;

export function initFirebaseAdmin() {
  if (firebaseReady) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.log("⚠️ Firebase Admin not configured (no FIREBASE_SERVICE_ACCOUNT_JSON). Push disabled.");
    return;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (e) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON (must be single-line JSON).");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  firebaseReady = true;
  console.log("✅ Firebase Admin initialized");
}

export function isFirebaseReady() {
  return firebaseReady;
}

export async function sendPushToTokens(tokens, payload) {
  if (!firebaseReady) return { ok: false, reason: "firebase_not_ready" };
  if (!tokens?.length) return { ok: true, sent: 0 };

  // multicast send
  const message = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: payload.data || {}
  };

  const res = await admin.messaging().sendEachForMulticast(message);

  // Remove invalid tokens is handled from caller (optional)
  return {
    ok: true,
    successCount: res.successCount,
    failureCount: res.failureCount,
    responses: res.responses
  };
}
