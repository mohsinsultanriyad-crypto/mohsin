import admin from "firebase-admin";

let firebaseReady = false;

export function initFirebaseAdmin() {
  if (firebaseReady) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.log("⚠️ Firebase Admin not configured. Push disabled.");
    return;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (e) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON");
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

  // ✅ Ensure data always string values
  const dataPayload = {};
  if (payload?.data) {
    for (const key of Object.keys(payload.data)) {
      dataPayload[key] = String(payload.data[key]);
    }
  }

  // ✅ Default fallback so click always opens app
  if (!dataPayload.targetTab) {
    dataPayload.targetTab = "updates";
  }

  const message = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: dataPayload
  };

  const res = await admin.messaging().sendEachForMulticast(message);

  return {
    ok: true,
    successCount: res.successCount,
    failureCount: res.failureCount
  };
}
