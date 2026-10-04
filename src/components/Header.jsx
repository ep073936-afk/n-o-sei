import { BASE_URL, TSE_URL } from "../config";

export default function Header() {
  return (
    <header className="site-header">
      <nav aria-label="Navegação principal" className="topbar">
        <a className="brand" href={BASE_URL || "/"} aria-label="Voltar ao início">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-copy">
            Apuração
            <strong>Brasil</strong>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="tag">Eleições 2026</span>
          <a href={TSE_URL} target="_blank" rel="noreferrer" aria-label="Abrir resultados oficiais do TSE em nova aba">
            Resultados oficiais do TSE ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
