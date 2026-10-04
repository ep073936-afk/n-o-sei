import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GEO_UF_URL } from "../config";
import { getCandidateColor, getCandidateColorWithAlpha } from "../data/colors";
import { UFS } from "../data/ufs";

const PROJECTION_CONFIG = { center: [-54, -14], scale: 690 };

export default function BrazilMap({ data, selectedUf = "SP", onSelectUf }) {
  const stateEntries = useMemo(() => {
    const states = [];
    for (const uf of UFS) {
      const ufData = data?.ufs?.[uf.sigla] || null;
      const leader = ufData?.candidatos?.slice().sort((a, b) => Number(b.votos || 0) - Number(a.votos || 0))[0] || null;
      states.push({ ...uf, ufData, leader });
    }
    return states;
  }, [data]);

  const renderFill = (ufSigla) => {
    const item = stateEntries.find((entry) => entry.sigla === ufSigla);
    if (!item?.ufData) return "#1a4e91";
    const pct = Number(item.ufData.pctApurado || 0);
    const leader = item.leader;
    if (!leader) return "#1a4e91";
    const color = getCandidateColor(leader, 0);
    const alpha = item.ufData.status === "totalizada" ? 1 : Math.max(0.35, Math.min(0.7, pct / 100));
    return item.ufData.status === "totalizada" ? color : getCandidateColorWithAlpha(leader, 0, alpha);
  };

  return (
    <figure className="map-panel map">
      <div className="map-head">
        <div>
          <p className="eyebrow">Visão territorial</p>
          <h3>Brasil por UF</h3>
        </div>
        <span>{selectedUf}</span>
      </div>

      <div className="map-legend" aria-label="Legenda das UFs">
        <span className="legend-item"><span style={{ background: "#1a4e91" }} aria-hidden="true" />Sem dados</span>
        <span className="legend-item"><span style={{ background: "#c5f333" }} aria-hidden="true" />Em apuração</span>
        <span className="legend-item"><span style={{ background: "#7df9c8" }} aria-hidden="true" />Encerrada</span>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        aria-label="Mapa do Brasil por estado"
        role="img"
        className="map-svg"
      >
        <Geographies geography={GEO_UF_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const sigla = geo.properties?.sigla || "";
              const fill = renderFill(sigla);
              const isSelected = sigla === selectedUf;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className="outline"
                  tabIndex={0}
                  role="button"
                  aria-label={`${geo.properties?.name || sigla}, ${data?.ufs?.[sigla]?.pctApurado ?? 0}% apurado, líder: ${data?.ufs?.[sigla]?.candidatos?.[0]?.nomeUrna || "Aguardando"}`}
                  onClick={() => onSelectUf?.(sigla)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectUf?.(sigla);
                    }
                  }}
                  style={{
                    default: { fill, stroke: isSelected ? "#c5f333" : "#dfe8f7", strokeWidth: isSelected ? 2 : 1, cursor: "pointer" },
                    hover: { fill: "#d9f45e", stroke: "#c5f333", strokeWidth: 2 },
                    pressed: { fill: "#d9f45e", stroke: "#c5f333", strokeWidth: 2 },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <div className="map-foot">
        <span>Mapa por UF</span>
        <b>{selectedUf}</b>
      </div>
    </figure>
  );
}
