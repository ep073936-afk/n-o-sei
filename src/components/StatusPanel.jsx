const formatDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "medium",
});

const MESSAGES = {
  unconfigured: {
    title: "A fonte oficial ainda não está disponível.",
    text: "A página será atualizada automaticamente quando o endpoint do TSE for configurado.",
  },
  loading: {
    title: "Consultando a fonte oficial…",
    text: "Aguarde enquanto os dados são carregados.",
  },
  ready: {
    title: "Dados recebidos da fonte oficial.",
    text: "A página é atualizada automaticamente.",
  },
  error: {
    title: "Não foi possível consultar a fonte oficial.",
    text: "Uma nova tentativa será feita automaticamente.",
  },
};

export default function StatusPanel({ status, updatedAt, onRefresh }) {
  const { title, text } = MESSAGES[status];
  const disabled = status === "unconfigured" || status === "loading";

  return (
    <section className="status" aria-labelledby="status-title">
      <div className="title">
        <div>
          <p className="eyebrow">Monitoramento</p>
          <h2 id="status-title">Status da apuração</h2>
        </div>
        <button type="button" onClick={onRefresh} disabled={disabled}>
          ↻ Atualizar agora
        </button>
      </div>

      <aside role="status" aria-live="polite">
        <strong>{title}</strong> {text}
      </aside>

      <div className="metrics">
        <div>
          Última atualização
          <strong>{updatedAt ? formatDate.format(updatedAt) : "Aguardando conexão"}</strong>
        </div>
        <div>
          Seções totalizadas<strong>Dados não disponíveis</strong>
        </div>
        <div>
          Apuração nacional<strong>—</strong>
          <i aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
