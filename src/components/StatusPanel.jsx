const formatDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "medium",
});

const MESSAGES = {
  waiting: {
    title: "Aguardando publicação oficial.",
    text: "Os dados só aparecem quando a Justiça Eleitoral divulgar a apuração oficial.",
  },
  loading: {
    title: "Consultando a fonte oficial…",
    text: "Aguarde enquanto os dados são carregados.",
  },
  ready: {
    title: "Dados recebidos da fonte oficial.",
    text: "A página é atualizada automaticamente e o histórico é mantido no servidor.",
  },
  error: {
    title: "Não foi possível consultar a fonte oficial.",
    text: "Uma nova tentativa será feita automaticamente; se persistir, verifique a conexão.",
  },
};

export default function StatusPanel({ status, updatedAt, onRefresh, data }) {
  const { title, text } = MESSAGES[status] || MESSAGES.waiting;
  const percent = data?.urnasApuradasPercent ?? null;
  const disabled = status === "loading";

  return (
    <section className="status-panel" aria-labelledby="status-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Monitoramento</p>
          <h2 id="status-title">Status da apuração</h2>
        </div>
        <button type="button" className="secondary-button" onClick={onRefresh} disabled={disabled}>
          ↻ Atualizar agora
        </button>
      </div>

      <aside className="status-banner" role="status" aria-live="polite">
        <strong>{title}</strong>
        <span>{text}</span>
      </aside>

      <div className="status-grid">
        <div className="status-item">
          <span>Última atualização</span>
          <strong>{updatedAt ? formatDate.format(updatedAt) : "Aguardando conexão"}</strong>
        </div>

        <div className="status-item">
          <span>Urnas apuradas</span>
          <strong>{percent == null ? "Aguardando" : `${percent}%`}</strong>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${percent == null ? 0 : Math.min(percent, 100)}%` }} />
          </div>
        </div>

        <div className="status-item">
          <span>Fonte oficial</span>
          <strong>{data?.sourceLabel || "Não publicada"}</strong>
        </div>
      </div>
    </section>
  );
}
