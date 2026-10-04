import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GEO_URL } from "../config";

const PROJECTION_CONFIG = { center: [-54, -14], scale: 690 };

export default function BrazilMap() {
  return (
    <figure className="map">
      <div className="map-head">
        <div>
          <p className="eyebrow">Visão territorial</p>
          <h3>Brasil por região</h3>
        </div>
        <span>Aguardando apuração</span>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        aria-label="Mapa geográfico do Brasil"
        role="img"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} className="outline" />
            ))
          }
        </Geographies>
      </ComposableMap>

      <figcaption>
        Contorno geográfico real do Brasil, baseado na malha do IBGE. Os resultados regionais
        serão exibidos após publicação da Justiça Eleitoral.
      </figcaption>
      <div className="map-foot">
        Base cartográfica: IBGE <b>● Sem resultados publicados</b>
      </div>
    </figure>
  );
}
