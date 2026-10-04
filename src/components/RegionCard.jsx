const METRICS = ["Urnas apuradas", "Eleitorado", "Comparecimento", "Abstenção"];

export default function RegionCard({ name, index }) {
  return (
    <article className="region-card">
      <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
      <h3>{name}</h3>
      <p>Dados regionais não disponíveis no momento.</p>
      <dl>
        {METRICS.map((label) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>—</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
