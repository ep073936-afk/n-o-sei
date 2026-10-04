import { useEffect, useState } from "react";

const STORAGE_KEY = "apuracao-brasil-ios-guide-closed-at";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export default function IosInstallGuide() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return;
    }

    const timestamp = Number(rawValue);
    if (Number.isFinite(timestamp) && Date.now() - timestamp < TTL_MS) {
      setHidden(true);
    }
  }, []);

  const handleInstalled = () => {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    window.location.reload();
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="ios-install-guide" role="status" aria-live="polite">
      <h3>Instale o app para ativar alertas no iPhone/iPad</h3>
      <p>É necessário iOS/iPadOS 16.4 ou superior e o site precisa ser aberto pelo Safari antes da instalação.</p>

      <ol>
        <li>
          <span className="step-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3a1 1 0 0 1 1 1v9.59l3.3-3.3a1 1 0 0 1 1.4 1.41l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.41L11 13.59V4a1 1 0 0 1 1-1Z" />
            </svg>
          </span>
          Toque no botão Compartilhar do Safari.
        </li>
        <li>
          <span className="step-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 4h4v2h-4V8Zm0 4h6v2H10v-2Z" />
            </svg>
          </span>
          Escolha “Adicionar à Tela de Início”.
        </li>
        <li>
          <span className="step-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 12.5V6a5 5 0 0 1 10 0v6.5h1.5a1 1 0 0 1 1 1V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6.5a1 1 0 0 1 1-1H7Zm2 0h6V6a3 3 0 0 0-6 0v6.5Z" />
            </svg>
          </span>
          Abra o app novo pelo ícone na Tela de Início.
        </li>
        <li>
          <span className="step-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm1 5h-2v6h5v-2h-3V7Z" />
            </svg>
          </span>
          Ative os alertas no botão “Receber alertas da apuração”.
        </li>
      </ol>

      <button type="button" className="secondary-button" onClick={handleInstalled}>
        Já instalei
      </button>
    </div>
  );
}
