import { getToken, onMessage } from "firebase/messaging";
import { messaging, vapidKey } from "./firebase";
import { api } from "./api";

const LS_TOKEN = "SJ_FCM_TOKEN";
const LS_ROLES = "SJ_ROLES";
const LS_NEWS = "SJ_NEWS";

export function getSavedFcmToken() {
  return localStorage.getItem(LS_TOKEN) || "";
}

export function getSavedRoles() {
  try {
    return JSON.parse(localStorage.getItem(LS_ROLES) || "[]");
  } catch {
    return [];
  }
}

export function setSavedRoles(roles) {
  localStorage.setItem(LS_ROLES, JSON.stringify(roles || []));
}

export function getNewsEnabled() {
  const v = localStorage.getItem(LS_NEWS);
  return v === null ? true : v === "true";
}
export function setNewsEnabled(v) {
  localStorage.setItem(LS_NEWS, String(!!v));
}

export async function enableNotifications({ roles, newsEnabled }) {
  if (!("Notification" in window)) throw new Error("Browser does not support notifications");

  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notification permission denied");

  const token = await getToken(messaging, { vapidKey });
  if (!token) throw new Error("FCM token not generated");

  localStorage.setItem(LS_TOKEN, token);
  setSavedRoles(roles || []);
  setNewsEnabled(newsEnabled);

  await api.register({ token, roles: roles || [], newsEnabled: !!newsEnabled });

  return token;
}

// Called on app load to keep token registered with backend
export async function refreshTokenOnLoad() {
  const token = getSavedFcmToken();
  if (!token) return;

  const roles = getSavedRoles();
  const newsEnabled = getNewsEnabled();

  try {
    await api.register({ token, roles, newsEnabled });
  } catch {
    // ignore
  }
}

// Foreground push listener
export function listenForegroundMessages({ onNavigate }) {
  onMessage(messaging, (payload) => {
    const target = payload?.data?.clickTarget || "";
    if (target && onNavigate) onNavigate(target);
  });
}
