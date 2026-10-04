export function isIos() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";

  return /iPhone|iPad|iPod/i.test(userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

export function supportsPush() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function getPushCapabilityState({ permission, hasSubscription = false } = {}) {
  if (!supportsPush()) {
    return "unsupported";
  }

  if (isIos() && !isStandalone()) {
    return "ios-needs-install";
  }

  if (permission === "denied") {
    return "denied";
  }

  if (permission === "granted") {
    return hasSubscription ? "granted-subscribed" : "granted-not-subscribed";
  }

  return "default";
}
