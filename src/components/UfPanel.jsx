import { getCandidateColor } from "../data/colors.js";

const currency = new Intl.NumberFormat("pt-BR");

function formatPercent(value) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "—";
}

export function UfPanel({ ufSigla, data, onClose }) {
  const ufData = ufSigla ? data?.ufs?.[ufSigla] : null;

  if (!ufSigla || !ufData) {
    return (
      <aside className="uf-panel empty">
        <div className="uf-panel__header">
          <h3>UF</h3>
          <button type="button" onClick={onClose}>Fechar</button>
        </div>
        <p>Selecione um estado no mapa para ver o detalhamento.</p>
      </aside>
    );
  }

  const sorted = [...(ufData.candidatos || [])].sort((a, b) => Number(b.votos || 0) - Number(a.votos || 0));

  return (
    <aside className="uf-panel" role="dialog" aria-modal="false" aria-label={`Detalhes do estado ${ufSigla}`}>
      <div className="uf-panel__header">
        <div>
          <p className="eyebrow">Estado</p>
          <h3>{ufSigla}</h3>
        </div>
        <button type="button" className="secondary-button" onClick={onClose}>Fechar</button>
      </div>

      <div className="uf-panel__progress">
        <div className="uf-panel__meta">
          <span>Seções apuradas</span>
          <strong>{formatPercent(ufData.pctApurado)}</strong>
        </div>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${Math.min(Number(ufData.pctApurado || 0), 100)}%` }} />
        </div>
      </div>

      <div className="uf-panel__list">
        {sorted.map((candidate, index) => (
          <div key={`${ufSigla}-${candidate.id || candidate.nomeUrna || index}`} className="uf-candidate">
            <div className="uf-candidate__tag" style={{ background: getCandidateColor(candidate, index) }} aria-hidden="true" />
            <div className="uf-candidate__body">
              <div className="uf-candidate__head">
                <strong>{candidate.nomeUrna || candidate.nome}</strong>
                <span>{candidate.partido}</span>
              </div>
              <div className="uf-candidate__meta">
                <span>{candidate.numero}</span>
                <span>{candidate.pctVotosValidos != null ? `${candidate.pctVotosValidos.toFixed(1)}%` : "—"}</span>
              </div>
              <div className="meter" aria-hidden="true">
                <span style={{ width: `${Math.min(Number(candidate.pctVotosValidos || 0), 100)}%`, background: getCandidateColor(candidate, index) }} />
              </div>
              <small>{currency.format(Number(candidate.votos || 0))} votos</small>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
