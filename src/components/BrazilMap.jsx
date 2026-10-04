import { useEffect, useMemo, useState } from "react";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import Map, { Layer, Popup, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { GEO_UF_URL } from "../config";
import { UF_BY_SIGLA } from "../data/ufs";

setWorkerUrl(maplibreWorkerUrl);

const STATE_SCALE = ["#EDF4FF", "#DCEBFF", "#BFDBFF", "#86B5E9", "#123B63"];

function formatPercent(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric.toFixed(1)}%` : "Aguardando";
}

export default function BrazilMap({ data, selectedUf = "SP", onSelectUf }) {
  const [geoJson, setGeoJson] = useState(null);
  const [hoveredUf, setHoveredUf] = useState(null);
  const [popup, setPopup] = useState(null);

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
        if (active) {
          setGeoJson(json);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar GeoJSON do mapa do Brasil:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const enrichedGeoJson = useMemo(() => {
    if (!geoJson?.features?.length) {
      return null;
    }

    return {
      type: "FeatureCollection",
      features: geoJson.features.map((feature) => {
        const sigla = feature.properties?.sigla;
        const ufData = data?.ufs?.[sigla] || null;

        return {
          ...feature,
          properties: {
            ...feature.properties,
            sigla,
            nome: feature.properties?.nome || UF_BY_SIGLA[sigla]?.nome || sigla,
            regiao: feature.properties?.regiao || UF_BY_SIGLA[sigla]?.regiao || "—",
            pctApurado: ufData?.pctApurado ?? null,
          },
        };
      }),
    };
  }, [data, geoJson]);

  const popupContent = useMemo(() => {
    if (!popup) {
      return null;
    }

    const ufMeta = UF_BY_SIGLA[popup.sigla];
    const ufData = data?.ufs?.[popup.sigla] || null;

    return {
      sigla: popup.sigla,
      nome: ufMeta?.nome || popup.sigla,
      leader: ufData?.candidatos?.[0]?.nomeUrna || "—",
      percent: ufData?.pctApurado ?? null,
    };
  }, [data, popup]);

  const handleFeatureHover = (event) => {
    const feature = event.features?.[0];
    if (!feature) {
      return;
    }

    const sigla = feature.properties?.sigla;
    if (!sigla) {
      return;
    }

    setHoveredUf(sigla);
    const [longitude, latitude] = event.lngLat.toArray();
    setPopup({ sigla, longitude, latitude });
  };

  if (!enrichedGeoJson) {
    return (
      <figure className="map-panel map brazil-map" aria-live="polite">
        <div className="brazil-map__header">
          <div>
            <p className="eyebrow">Mapa territorial</p>
            <h3>Brasil por UF</h3>
          </div>
        </div>
        <div className="map-placeholder">Carregando mapa do Brasil…</div>
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

      <div className="brazil-map__viewport">
        <Map
          initialViewState={{
            longitude: -52.1,
            latitude: -14.3,
            zoom: 3.2,
            pitch: 0,
            bearing: 0,
          }}
          minZoom={2.3}
          maxZoom={7.2}
          mapStyle="https://demotiles.maplibre.org/style.json"
          interactiveLayerIds={["ufs-fill"]}
          onMouseMove={handleFeatureHover}
          onMouseLeave={() => {
            setHoveredUf(null);
            setPopup(null);
          }}
          onClick={(event) => {
            const feature = event.features?.[0];
            const sigla = feature?.properties?.sigla;
            if (sigla) {
              onSelectUf?.(sigla);
            }
          }}
          attributionControl={false}
        >
          <Source id="ufs-source" type="geojson" data={enrichedGeoJson}>
            <Layer
              id="ufs-fill"
              type="fill"
              paint={{
                "fill-color": [
                  "case",
                  ["==", ["get", "sigla"], selectedUf], "#0F2747",
                  ["==", ["get", "sigla"], hoveredUf], "#456FBA",
                  ["==", ["get", "pctApurado"], null], "#E2E8F0",
                  [
                    "interpolate",
                    ["linear"],
                    ["to-number", ["get", "pctApurado"]],
                    0,
                    "#EDF4FF",
                    25,
                    "#DCEBFF",
                    50,
                    "#BFDBFF",
                    75,
                    "#86B5E9",
                    100,
                    "#123B63",
                  ],
                ],
                "fill-opacity": 0.96,
                "fill-outline-color": [
                  "case",
                  ["==", ["get", "sigla"], selectedUf], "#0F2747",
                  "#FFFFFF",
                ],
              }}
            />
            <Layer
              id="ufs-line"
              type="line"
              paint={{
                "line-color": [
                  "case",
                  ["==", ["get", "sigla"], selectedUf], "#0F2747",
                  "#FFFFFF",
                ],
                "line-width": [
                  "case",
                  ["==", ["get", "sigla"], selectedUf], 2,
                  0.7,
                ],
              }}
            />
          </Source>

          {popupContent && (
            <Popup
              longitude={popup.longitude}
              latitude={popup.latitude}
              closeButton={false}
              closeOnClick={false}
              anchor="top-left"
              offset={12}
            >
              <div className="brazil-map__tooltip">
                <strong>{popupContent.nome}</strong>
                <span>{popupContent.sigla}</span>
                <div className="brazil-map__tooltip-row">
                  <small>Líder</small>
                  <b>{popupContent.leader}</b>
                </div>
                <div className="brazil-map__tooltip-row">
                  <small>Apuração</small>
                  <b>{popupContent.percent == null ? "Aguardando" : formatPercent(popupContent.percent)}</b>
                </div>
              </div>
            </Popup>
          )}
        </Map>
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
    </figure>
  );
}
