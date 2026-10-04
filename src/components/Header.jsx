import { BASE_URL, TSE_URL } from "../config";

export default function Header() {
  return (
    <header>
      <nav aria-label="Principal">
        <a className="brand" href={BASE_URL}>
          <i aria-hidden="true" />
          Apuração
          <br />
          <strong>Brasil</strong>
        </a>
        <div>
          <b>Eleições 2026</b>
          <a href={TSE_URL} target="_blank" rel="noreferrer">
            Resultados oficiais do TSE ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
