const METRICS = [
  { label: "Urnas apuradas", key: "urnasApuradasPercent", formatter: (value) => (typeof value === "number" ? `${value}%` : "—") },
  { label: "Eleitorado", key: "eleitorado", formatter: (value) => value ?? "—" },
  { label: "Comparecimento", key: "comparecimento", formatter: (value) => value ?? "—" },
  { label: "Abstenção", key: "abstencao", formatter: (value) => value ?? "—" },
];

export default function RegionCard({ name, index, value, active = false, onClick }) {
  const progress = typeof value?.urnasApuradasPercent === "number" ? Math.min(value.urnasApuradasPercent, 100) : 0;

  return (
    <button
      type="button"
      className={`region-card ${active ? "region-card--active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={value?.urnasApuradasPercent == null ? `Região ${name}: aguardando apuração` : `Região ${name}: ${value.urnasApuradasPercent}% apurado`}
    >
      <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
      <h3>{name}</h3>
      <p>{value?.urnasApuradasPercent == null ? "Aguardando publicação oficial." : `${value.urnasApuradasPercent}% apurado`}</p>
      <div className="region-card__meter" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <dl>
        {METRICS.map(({ label, key, formatter }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{formatter(value?.[key])}</dd>
          </div>
        ))}
      </dl>
    </button>
  );
}
