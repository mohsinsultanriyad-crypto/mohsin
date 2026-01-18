import Token from "../models/Token.js";
import { getAdmin, isFirebaseReady } from "../firebase.js";

export async function incrementBadgeForTokens(tokens) {
  if (!tokens?.length) return;
  await Token.updateMany({ token: { $in: tokens } }, { $inc: { badgeCount: 1 }, $set: { updatedAt: new Date() } });
}

export async function sendPushToTokens(tokens, payload) {
  if (!tokens?.length) return { sent: 0, skipped: tokens?.length || 0 };

  if (!isFirebaseReady()) {
    console.log("⚠️ Push skipped: Firebase not initialized");
    return { sent: 0, skipped: tokens.length };
  }

  const admin = getAdmin();

  // Firebase multicast (max 500 tokens per request)
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500));

  let sent = 0;
  for (const chunk of chunks) {
    const resp = await admin.messaging().sendEachForMulticast({
      tokens: chunk,
      notification: payload.notification,
      data: payload.data || {}
    });
    sent += resp.successCount || 0;
  }

  return { sent, skipped: tokens.length - sent };
}

export function buildJobPush(job) {
  return {
    notification: {
      title: `New Job: ${job.jobRole}`,
      body: `${job.city} • Tap to open`
    },
    data: {
      clickTarget: "alerts",
      jobId: String(job._id || "")
    }
  };
}

export function buildNewsPush(news) {
  return {
    notification: {
      title: "Saudi Labour News",
      body: `${news.title?.slice(0, 60) || "New update"} • Tap to read`
    },
    data: {
      clickTarget: "updates",
      newsLink: news.link || ""
    }
  };
}
