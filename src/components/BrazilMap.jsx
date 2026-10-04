import { useEffect, useMemo, useState } from "react";
import { geoCentroid, geoConicEqualArea, geoPath } from "d3-geo";
import { GEO_UF_URL } from "../config";
import { UF_BY_SIGLA } from "../data/ufs";

const STATE_NEUTRAL = "#E2E8F0";
const STATE_SCALE = ["#EDF4FF", "#DCEBFF", "#BFDBFF", "#86B5E9", "#123B63"];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric.toFixed(1)}%` : "Aguardando";
}

function getStateFill(value, isSelected, isHovered) {
  if (value == null) {
    return isSelected ? "#D5DDE8" : STATE_NEUTRAL;
  }

  const percent = clamp(Number(value), 0, 100);
  const index = clamp(Math.floor((percent / 100) * (STATE_SCALE.length - 1)), 0, STATE_SCALE.length - 1);
  const base = STATE_SCALE[index];

  if (isSelected) {
    return "#0F2747";
  }

  return isHovered ? base : base;
}

export default function BrazilMap({ data, selectedUf = "SP", onSelectUf }) {
  const [geoJson, setGeoJson] = useState(null);
  const [hoveredUf, setHoveredUf] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    let active = true;

    fetch(GEO_UF_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Falha ao carregar geometria: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        if (active) setGeoJson(json);
      })
      .catch((error) => {
        console.error("Erro ao carregar GeoJSON do mapa do Brasil:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const projection = useMemo(() => {
    if (!geoJson?.features?.length) return null;
    const featureCollection = { type: "FeatureCollection", features: geoJson.features };
    const project = geoConicEqualArea();
    project.fitExtent([[28, 24], [780, 560]], featureCollection);
    return project;
  }, [geoJson]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return geoPath(projection);
  }, [projection]);

  const tooltipContent = useMemo(() => {
    if (!tooltip) return null;
    const ufMeta = UF_BY_SIGLA[tooltip.sigla];
    const ufData = data?.ufs?.[tooltip.sigla] || null;
    const leader = ufData?.candidatos?.[0]?.nomeUrna || "—";
    const percent = ufData?.pctApurado ?? null;

    return {
      sigla: tooltip.sigla,
      nome: ufMeta?.nome || tooltip.sigla,
      leader,
      percent,
    };
  }, [data, tooltip]);

  if (!geoJson || !pathGenerator) {
    return (
      <figure className="map-panel map brazil-map" aria-live="polite">
        <div className="brazil-map__header">
          <div>
            <p className="eyebrow">Mapa territorial</p>
            <h3>Brasil por UF</h3>
          </div>
        </div>
        <div className="brazil-map__placeholder">Carregando mapa do Brasil…</div>
      </figure>
    );
  }

  return (
    <figure className="map-panel map brazil-map" aria-label="Mapa político do Brasil por unidade federativa">
      <div className="brazil-map__header">
        <div>
          <p className="eyebrow">Visão territorial</p>
          <h3>Brasil por UF</h3>
        </div>
        <span className="brazil-map__badge">{selectedUf}</span>
      </div>

      <div className="brazil-map__canvas">
        <svg
          className="brazil-map__svg"
          viewBox="0 0 820 560"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Mapa do Brasil com os estados brasileiros"
        >
          <g>
            {geoJson.features.map((feature) => {
              const sigla = feature.properties?.sigla;
              const ufMeta = UF_BY_SIGLA[sigla];
              const ufData = data?.ufs?.[sigla] || null;
              const pathData = pathGenerator(feature);
              const centroid = geoCentroid(feature);
              const isSelected = sigla === selectedUf;
              const isHovered = sigla === hoveredUf;
              const fill = getStateFill(ufData?.pctApurado ?? null, isSelected, isHovered);
              const labelVisible = sigla === selectedUf || ["DF", "SE", "AL", "RN", "PB", "PE", "ES", "RJ", "AC", "AP", "RR", "TO", "AM", "RO", "SP", "RS", "SC", "PR"].includes(sigla);

              return (
                <g key={sigla}>
                  <path
                    className={`brazil-state ${isSelected ? "is-selected" : ""} ${isHovered ? "is-hovered" : ""}`}
                    d={pathData}
                    fill={fill}
                    stroke={isSelected ? "#0F2747" : "#FFFFFF"}
                    strokeWidth={isSelected ? 1.8 : 1}
                    style={{ cursor: "pointer", transition: "all 150ms ease" }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${ufMeta?.nome || sigla}, ${sigla}`}
                    onClick={() => onSelectUf?.(sigla)}
                    onMouseEnter={(event) => {
                      setHoveredUf(sigla);
                      setTooltip({ sigla, x: event.clientX, y: event.clientY });
                    }}
                    onMouseMove={(event) => {
                      setTooltip({ sigla, x: event.clientX, y: event.clientY });
                    }}
                    onMouseLeave={() => {
                      setHoveredUf(null);
                      setTooltip(null);
                    }}
                    onFocus={() => setHoveredUf(sigla)}
                    onBlur={() => setHoveredUf(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectUf?.(sigla);
                      }
                    }}
                  />

                  {labelVisible && (
                    <text
                      x={centroid[0]}
                      y={centroid[1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="brazil-map__label"
                      style={{
                        fontSize: isSelected ? 12 : 9,
                        fontWeight: isSelected ? 700 : 600,
                        fill: isSelected ? "#0F2747" : "#1E2A3A",
                      }}
                    >
                      {sigla}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="brazil-map__legend" aria-label="Legenda do mapa de resultados por estado">
        <span className="brazil-map__legend-label">Menor</span>
        <div className="brazil-map__scale" aria-hidden="true">
          {STATE_SCALE.map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </div>
        <span className="brazil-map__legend-label">Maior</span>
      </div>

      {tooltipContent && (
        <div
          className="brazil-map__tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          role="status"
          aria-live="polite"
        >
          <strong>{tooltipContent.nome}</strong>
          <span>{tooltipContent.sigla}</span>
          <div className="brazil-map__tooltip-row">
            <small>Líder</small>
            <b>{tooltipContent.leader}</b>
          </div>
          <div className="brazil-map__tooltip-row">
            <small>Apuração</small>
            <b>{tooltipContent.percent == null ? "Aguardando" : formatPercent(tooltipContent.percent)}</b>
          </div>
        </div>
      )}
    </figure>
  );
}
