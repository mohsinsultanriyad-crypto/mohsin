export async function sendPushToTokens(tokens, payload) {
  if (!firebaseReady) return { ok: false, reason: "firebase_not_ready" };
  if (!tokens?.length) return { ok: true, sent: 0 };

  // ✅ Ensure data object always exists and string values
  const dataPayload = {};
  if (payload?.data) {
    for (const key of Object.keys(payload.data)) {
      dataPayload[key] = String(payload.data[key]);
    }
  }

  // ✅ Default fallback (so click always opens app)
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
    failureCount: res.failureCount,
    responses: res.responses
  };
}
