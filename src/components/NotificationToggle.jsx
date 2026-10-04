import { TSE_URL } from "../config";
import { usePush } from "../hooks/usePush";
import IosInstallGuide from "./IosInstallGuide";

const LABELS = {
  unsupported: "Seu navegador não suporta alertas",
  "ios-needs-install": "Instale o app para ativar alertas",
  denied: "Alertas bloqueados",
  default: "Ativar alertas",
  "granted-not-subscribed": "Ativar alertas",
  "granted-subscribed": "Desativar alertas",
};

export default function NotificationToggle() {
  const { capability, subscribe, unsubscribe, loading, error } = usePush();

  const isUnsupported = capability === "unsupported";
  const isIosNeedsInstall = capability === "ios-needs-install";
  const isDenied = capability === "denied";
  const isActive = capability === "granted-subscribed";

  const handleClick = () => {
    if (isActive) {
      unsubscribe();
      return;
    }

    subscribe();
  };

  if (isIosNeedsInstall) {
    return <IosInstallGuide />;
  }

  return (
    <div className="notification-toggle" role="status" aria-live="polite">
      <div className="notification-toggle__copy">
        <strong>Receber alertas da apuração</strong>
        <span>Notificações quando a apuração oficial mudar.</span>
      </div>

      {isUnsupported && (
        <p className="notification-toggle__message">
          Seu navegador não suporta alertas. Consulte a
          {" "}
          <a href={TSE_URL} target="_blank" rel="noreferrer">fonte oficial do TSE</a>.
        </p>
      )}

      {!isUnsupported && isDenied && (
        <p className="notification-toggle__message">
          Os alertas foram bloqueados neste navegador. Você pode liberar as notificações nas configurações do sistema.
        </p>
      )}

      {!isUnsupported && !isDenied && !isIosNeedsInstall && (
        <button
          type="button"
          className={`notification-toggle__button ${isActive ? "is-active" : ""}`}
          onClick={handleClick}
          disabled={loading}
          aria-pressed={isActive}
        >
          {loading ? "Aguarde…" : LABELS[capability] || "Ativar alertas"}
        </button>
      )}

      {error && <p className="notification-toggle__error">{error}</p>}
    </div>
  );
}
