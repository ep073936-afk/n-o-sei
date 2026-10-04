import { TSE_URL } from "../config";

export default function Footer() {
  return (
    <footer>
      <strong>Apuração Brasil</strong>
      <span>Dados informativos. Fonte: Justiça Eleitoral / TSE.</span>
      <a href={TSE_URL} target="_blank" rel="noreferrer">
        Resultados do TSE ↗
      </a>
    </footer>
  );
}
