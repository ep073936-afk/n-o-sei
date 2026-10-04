import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GEO_URL, REGIONS } from "../config";

const PROJECTION_CONFIG = { center: [-54, -14], scale: 690 };

const REGION_COLORS = {
  Norte: "#3fa9a5",
  Nordeste: "#7dd67d",
  "Centro-Oeste": "#ffc857",
  Sudeste: "#6299f7",
  Sul: "#c5f333",
};

export default function BrazilMap({ regions = [], selectedRegion = REGIONS[0], onSelectRegion }) {
  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        regions.map((region) => [region.name, region.urnasApuradasPercent ?? 0]),
      ),
    [regions],
  );

  const palette = REGIONS.map((region) => ({
    name: region,
    color: REGION_COLORS[region] || "#dfe8f7",
    value: statusMap[region] ?? 0,
  }));

  const selectedColor = REGION_COLORS[selectedRegion] || "#1f6ae5";

  return (
    <figure className="map-panel">
      <div className="map-head">
        <div>
          <p className="eyebrow">Visão territorial</p>
          <h3>Brasil por região</h3>
        </div>
        <span>{selectedRegion}</span>
      </div>

      <div className="map-legend" aria-label="Legenda das regiões">
        {palette.map((item) => (
          <button
            key={item.name}
            type="button"
            className="legend-item"
            aria-label={`Exibir ${item.name}`}
            onClick={() => onSelectRegion?.(item.name)}
          >
            <span style={{ background: item.color }} aria-hidden="true" />
            {item.name}
          </button>
        ))}
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        aria-label="Mapa do Brasil"
        role="img"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className="outline"
                style={{
                  default: { fill: selectedColor, stroke: "#d5f588", strokeWidth: 1 },
                  hover: { fill: "#d9f45e", stroke: "#d5f588", strokeWidth: 1 },
                  pressed: { fill: "#d9f45e", stroke: "#d5f588", strokeWidth: 1 },
                }}
                tabIndex={0}
                onClick={() => onSelectRegion?.(selectedRegion)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectRegion?.(selectedRegion);
                  }
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      <figcaption>
        Contorno geográfico real do Brasil com estrutura pronta para regionalizar os dados oficiais.
      </figcaption>
      <div className="map-foot">
        Base cartográfica: IBGE <b>● {selectedRegion}</b>
      </div>
    </figure>
  );
}
