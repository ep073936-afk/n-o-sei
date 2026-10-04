import { useEffect, useState } from "react";
import { getPushCapabilityState, supportsPush } from "../lib/platform";

function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    return new Uint8Array();
  }

  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const normalized = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = window.atob(normalized);
  const output = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    output[i] = binary.charCodeAt(i);
  }

  return output;
}

export function usePush() {
  const [capability, setCapability] = useState("unsupported");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [publicKey, setPublicKey] = useState("");

  const syncSubscriptionState = async () => {
    if (!supportsPush()) {
      setCapability("unsupported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const activeSubscription = await registration.pushManager.getSubscription();
      setSubscription(activeSubscription);
      setCapability(
        getPushCapabilityState({
          permission: Notification.permission,
          hasSubscription: Boolean(activeSubscription),
        }),
      );
    } catch {
      setCapability(getPushCapabilityState({ permission: Notification.permission, hasSubscription: false }));
    }
  };

  const ensurePublicKey = async () => {
    if (publicKey) {
      return publicKey;
    }

    const response = await fetch("/api/push/public-key", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar a chave do servidor de alertas.");
    }

    const payload = await response.json();
    const nextKey = payload.publicKey || "";
    setPublicKey(nextKey);
    return nextKey;
  };

  useEffect(() => {
    if (!supportsPush()) {
      setCapability("unsupported");
      return undefined;
    }

    let isMounted = true;

    const load = async () => {
      try {
        setError(null);
        await syncSubscriptionState();
        if (!isMounted) return;

        await ensurePublicKey();
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Não foi possível verificar o suporte a alertas.");
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const subscribe = async () => {
    if (!supportsPush()) {
      setCapability("unsupported");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setCapability("denied");
          return;
        }
      }

      if (Notification.permission === "denied") {
        setCapability("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const nextKey = await ensurePublicKey();
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        setSubscription(existing);
        setCapability("granted-subscribed");
        return;
      }

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(nextKey),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: pushSubscription.endpoint,
          keys: pushSubscription.toJSON().keys,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível ativar os alertas neste navegador.");
      }

      setSubscription(pushSubscription);
      setCapability("granted-subscribed");
    } catch (subscribeError) {
      setError(subscribeError.message || "Não foi possível ativar os alertas.");
      setCapability(getPushCapabilityState({ permission: Notification.permission, hasSubscription: Boolean(subscription) }));
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!supportsPush()) {
      setCapability("unsupported");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const activeSubscription = await registration.pushManager.getSubscription();

      if (activeSubscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: activeSubscription.endpoint }),
        });

        await activeSubscription.unsubscribe();
      }

      setSubscription(null);
      setCapability(getPushCapabilityState({ permission: Notification.permission, hasSubscription: false }));
    } catch (unsubscribeError) {
      setError(unsubscribeError.message || "Não foi possível desativar os alertas.");
      setCapability(getPushCapabilityState({ permission: Notification.permission, hasSubscription: Boolean(subscription) }));
    } finally {
      setLoading(false);
    }
  };

  return {
    capability,
    subscribe,
    unsubscribe,
    loading,
    error,
  };
}
