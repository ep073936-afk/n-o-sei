import { Component, memo, useCallback, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { GEO_UF_URL } from "../config";
import { getCandidateColor, getCandidateColorWithAlpha } from "../data/colors";
import { REGION_ORDER, UF_BY_SIGLA, UFS } from "../data/ufs";

const SMALL_UFS = new Set(["DF", "SE", "AL", "RN", "PB", "PE", "ES", "RJ"]);
const MAP_CENTER = [-54, -14.5];
const MAP_SCALE = 720;

function toPercent(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stateFillColor(sigla, ufData, isSelected, isDimmed) {
  const fallback = "#1a4e91";

  if (!ufData) {
    return fallback;
  }

  const leader = ufData.candidatos?.[0];
  if (!leader) {
    return fallback;
  }

  const solidColor = getCandidateColor(leader, 0);
  if (ufData.status === "totalizada") {
    return solidColor;
  }

  const opacity = Math.max(0.38, Math.min(0.82, toPercent(ufData.pctApurado) / 100));
  const tinted = getCandidateColorWithAlpha(leader, 0, opacity);

  if (isSelected || !isDimmed) {
    return tinted;
  }

  return getCandidateColorWithAlpha(leader, 0, Math.min(0.32, opacity));
}

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Mapa do Brasil não pôde ser renderizado:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <figure className="map-panel map-panel--error" aria-live="polite">
          <div className="map-head">
            <div>
              <p className="eyebrow">Mapa</p>
              <h3>Não foi possível carregar o mapa</h3>
            </div>
          </div>
          <p>Houve um erro ao carregar a geometria dos estados. Tente novamente.</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => this.setState({ hasError: false })}
          >
            Tentar novamente
          </button>
          <ul className="fallback-list">
            {UFS.map((uf) => (
              <li key={uf.sigla}>{uf.sigla} — {uf.nome}</li>
            ))}
          </ul>
        </figure>
      );
    }

    return this.props.children;
  }
}

const BrazilMapInner = memo(function BrazilMapInner({ data, selectedUf = "SP", selectedRegion = "Sudeste", onSelectUf, onSelectRegion }) {
  const [viewMode, setViewMode] = useState("states");
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState(MAP_CENTER);
  const [activeUf, setActiveUf] = useState(selectedUf);
  const [activeRegion, setActiveRegion] = useState(selectedRegion);
  const [showList, setShowList] = useState(false);

  const statesByRegion = useMemo(
    () =>
      REGION_ORDER.reduce((accumulator, regionName) => {
        accumulator[regionName] = UFS.filter((uf) => uf.regiao === regionName).map((uf) => uf.sigla);
        return accumulator;
      }, {}),
    [],
  );

  const selectedUfData = data?.ufs?.[activeUf] || null;
  const selectedRegionData = useMemo(
    () =>
      UFS.filter((uf) => uf.regiao === activeRegion).map((uf) => ({
        sigla: uf.sigla,
        nome: uf.nome,
        dados: data?.ufs?.[uf.sigla] || null,
      })),
    [activeRegion, data],
  );

  const handleStateSelect = useCallback(
    (nextUf) => {
      const uf = UF_BY_SIGLA[nextUf];
      if (!uf) return;
      setActiveUf(nextUf);
      setActiveRegion(uf.regiao);
      setViewMode("states");
      onSelectUf?.(nextUf);
    },
    [onSelectUf],
  );

  const handleRegionSelect = useCallback(
    (nextRegion) => {
      const firstUf = UFS.find((uf) => uf.regiao === nextRegion)?.sigla;
      setActiveRegion(nextRegion);
      if (firstUf) {
        setActiveUf(firstUf);
        onSelectUf?.(firstUf);
      }
      setViewMode("regions");
      onSelectRegion?.(nextRegion);
    },
    [onSelectRegion, onSelectUf],
  );

  const getGeographyStyle = useCallback(
    (sigla) => {
      const ufData = data?.ufs?.[sigla] || null;
      const regionName = UF_BY_SIGLA[sigla]?.regiao || "";
      const isSelected = viewMode === "states" ? sigla === activeUf : regionName === activeRegion;
      const isDimmed =
        viewMode === "states"
          ? activeUf && sigla !== activeUf
          : activeRegion && regionName !== activeRegion;
      const fill = stateFillColor(sigla, ufData, isSelected, isDimmed);

      return {
        default: {
          fill,
          stroke: isSelected ? "#c5f333" : "rgba(255,255,255,0.7)",
          strokeWidth: isSelected ? 2.3 : 1,
          opacity: isDimmed ? 0.62 : 1,
          cursor: "pointer",
          transition: "all 120ms ease",
        },
        hover: {
          fill,
          stroke: "#c5f333",
          strokeWidth: 2.4,
          opacity: 1,
          cursor: "pointer",
        },
        pressed: {
          fill,
          stroke: "#c5f333",
          strokeWidth: 2.4,
          opacity: 1,
          cursor: "pointer",
        },
      };
    },
    [activeRegion, activeUf, data, viewMode],
  );

  return (
    <figure className="map-panel map">
      <div className="map-head">
        <div>
          <p className="eyebrow">Visão territorial</p>
          <h3>{viewMode === "states" ? "Brasil por UF" : `Região ${activeRegion}`}</h3>
        </div>
        <span>{viewMode === "states" ? activeUf : activeRegion}</span>
      </div>

      <div className="map-toolbar">
        <div className="map-mode-toggle" role="tablist" aria-label="Alternar visualização do mapa">
          <button
            type="button"
            className={viewMode === "states" ? "is-active" : ""}
            role="tab"
            aria-selected={viewMode === "states"}
            onClick={() => setViewMode("states")}
          >
            Estados
          </button>
          <button
            type="button"
            className={viewMode === "regions" ? "is-active" : ""}
            role="tab"
            aria-selected={viewMode === "regions"}
            onClick={() => setViewMode("regions")}
          >
            Regiões
          </button>
        </div>

        <div className="map-zoom-controls" aria-label="Controles de zoom do mapa">
          <button type="button" aria-label="Aumentar zoom" onClick={() => setZoom((next) => Math.min(6, next + 0.5))}>+</button>
          <button type="button" aria-label="Diminuir zoom" onClick={() => setZoom((next) => Math.max(1, next - 0.5))}>−</button>
          <button type="button" aria-label="Recentralizar mapa" onClick={() => { setZoom(1); setCenter(MAP_CENTER); }}>Recentrar</button>
        </div>
      </div>

      <div className="map-legend" aria-label="Legenda das UFs">
        <span className="legend-item"><span style={{ background: "#1a4e91" }} aria-hidden="true" />Sem dados</span>
        <span className="legend-item"><span style={{ background: "#d9f45e" }} aria-hidden="true" />Em apuração</span>
        <span className="legend-item"><span style={{ background: "#7df9c8" }} aria-hidden="true" />Totalizada</span>
      </div>

      <div className="map-selection-status" aria-live="polite">
        {viewMode === "states"
          ? `${UF_BY_SIGLA[activeUf]?.nome || activeUf}: ${selectedUfData?.pctApurado != null ? `${toPercent(selectedUfData.pctApurado).toFixed(1)}%` : "Aguardando apuração"} apurado`
          : `${activeRegion}: ${selectedRegionData.length} UFs na região`}
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: MAP_CENTER, scale: MAP_SCALE }}
        width={800}
        height={800}
        className="map-svg"
        role="group"
        aria-label="Mapa do Brasil com UFs e regiões"
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={1}
          maxZoom={6}
          translateExtent={[[ -700, -700 ], [ 700, 700 ]]}
          onMoveEnd={({ coordinates, zoom: nextZoom }) => {
            setCenter(coordinates);
            setZoom(nextZoom);
          }}
        >
          <defs>
            <pattern id="uf-pending-pattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill="rgba(255,255,255,0.08)" />
              <line x1="0" x2="8" y1="0" y2="8" stroke="rgba(197, 243, 51, 0.7)" strokeWidth="1.2" />
            </pattern>
          </defs>

          <Geographies geography={GEO_UF_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const sigla = geo.properties?.sigla || "";
                const uf = UF_BY_SIGLA[sigla];
                const ufData = data?.ufs?.[sigla] || null;
                const regionName = uf?.regiao || "";
                const isSelectedState = viewMode === "states" ? sigla === activeUf : regionName === activeRegion;
                const isDimmed =
                  viewMode === "states"
                    ? activeUf && sigla !== activeUf
                    : activeRegion && regionName !== activeRegion;
                const isPending = Boolean(ufData && ufData.status !== "totalizada");
                const fill = stateFillColor(sigla, ufData, isSelectedState, isDimmed);
                const label = `${uf?.nome || sigla}, ${ufData?.pctApurado != null ? `${toPercent(ufData.pctApurado).toFixed(1)}%` : "Aguardando apuração"} apurado, líder: ${ufData?.candidatos?.[0]?.nomeUrna || "sem dados"}`;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={0}
                    role="button"
                    aria-label={label}
                    aria-pressed={isSelectedState}
                    className="uf-geography"
                    onClick={() => {
                      if (viewMode === "regions") {
                        handleRegionSelect(regionName);
                        return;
                      }
                      handleStateSelect(sigla);
                    }}
                    onDoubleClick={() => {
                      if (!uf) return;
                      setZoom((next) => Math.min(4, next + 1));
                      setCenter(MAP_CENTER);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (viewMode === "regions") {
                          handleRegionSelect(regionName);
                          return;
                        }
                        handleStateSelect(sigla);
                      }

                      if (event.key === "Escape") {
                        event.preventDefault();
                        setViewMode("states");
                      }
                    }}
                    style={{
                      default: {
                        fill: isPending && !isSelectedState ? "url(#uf-pending-pattern)" : fill,
                        stroke: isSelectedState ? "#c5f333" : "rgba(255,255,255,0.7)",
                        strokeWidth: isSelectedState ? 2.5 : 1,
                        opacity: isDimmed ? 0.62 : 1,
                        cursor: "pointer",
                      },
                      hover: {
                        fill: isPending ? "url(#uf-pending-pattern)" : fill,
                        stroke: "#c5f333",
                        strokeWidth: 2.4,
                        opacity: 1,
                      },
                      pressed: {
                        fill: isPending ? "url(#uf-pending-pattern)" : fill,
                        stroke: "#c5f333",
                        strokeWidth: 2.4,
                        opacity: 1,
                      },
                    }}
                    title={`${uf?.nome || sigla} • ${ufData?.pctApurado != null ? `${toPercent(ufData.pctApurado).toFixed(1)}%` : "Aguardando"} • ${ufData?.candidatos?.[0]?.nomeUrna || "sem dados"}`}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className="map-actions">
        <button type="button" className="secondary-button" onClick={() => setShowList((next) => !next)}>
          {showList ? "Ocultar lista" : "Ver como lista"}
        </button>
      </div>

      {showList && (
        <div className="map-list" aria-label="Lista das UFs">
          {UFS.map((uf) => (
            <button
              key={uf.sigla}
              type="button"
              className={activeUf === uf.sigla ? "is-selected" : ""}
              onClick={() => handleStateSelect(uf.sigla)}
            >
              <span>{uf.sigla}</span>
              <strong>{uf.nome}</strong>
            </button>
          ))}
        </div>
      )}

      <div className="small-ufs" aria-label="Atalhos para UFs menores">
        {Array.from(SMALL_UFS).map((sigla) => (
          <button key={sigla} type="button" onClick={() => handleStateSelect(sigla)}>
            {sigla}
          </button>
        ))}
      </div>

      <div className="map-foot">
        <span>{viewMode === "states" ? "Mapa por UF" : `Região ${activeRegion}`}</span>
        <b>{viewMode === "states" ? activeUf : activeRegion}</b>
      </div>
    </figure>
  );
});

export default function BrazilMap(props) {
  return (
    <MapErrorBoundary>
      <BrazilMapInner {...props} />
    </MapErrorBoundary>
  );
}
