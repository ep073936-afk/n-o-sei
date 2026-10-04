import { Suspense, lazy, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StatusPanel from "./components/StatusPanel";
import RegionCard from "./components/RegionCard";
import NotificationToggle from "./components/NotificationToggle";
import { REGIONS, TSE_URL } from "./config";
import { useApuracao } from "./hooks/useApuracao";

const BrazilMap = lazy(() => import("./components/BrazilMap"));

const EMPTY_DATA = REGIONS.map((name) => ({
  name,
  status: "waiting",
  urnasApuradasPercent: null,
  eleitorado: null,
  comparecimento: null,
  abstencao: null,
}));

export default function App() {
  const { status, data, updatedAt, error, refresh } = useApuracao();
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  const regions = useMemo(() => {
    if (!data?.regions || !Array.isArray(data.regions)) {
      return EMPTY_DATA;
    }

    return REGIONS.map((name) => {
      const match = data.regions.find((item) => item.name.toLowerCase() === name.toLowerCase()) || {};
      return {
        name,
        status: match.status || "waiting",
        urnasApuradasPercent: match.urnasApuradasPercent ?? null,
        eleitorado: match.eleitorado ?? null,
        comparecimento: match.comparecimento ?? null,
        abstencao: match.abstencao ?? null,
      };
    });
  }, [data]);

  const activeRegion = regions.find((region) => region.name === selectedRegion) || regions[0];
  const globalPercent = typeof data?.urnasApuradasPercent === "number" ? data.urnasApuradasPercent : null;

  return (
    <div id="top">
      <Header />

      <div className="status-strip" aria-live="polite">
        <span className={`status-dot status-dot--${status}`}> </span>
        <strong>Última atualização</strong>
        <span>{updatedAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(updatedAt) : "Aguardando"}</span>
        <span className="status-strip__percent">
          {globalPercent == null ? "0%" : `${globalPercent}%`} apurado
        </span>
      </div>

      <main className="app-shell">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">● Central de apuração</p>
            <h1>
              Brasil decide.
              <br />
              <em>Você acompanha.</em>
            </h1>
            <p>Resultados somente quando publicados pela Justiça Eleitoral.</p>
          </div>

          <div className="hero-actions">
            <a className="primary-button" href={TSE_URL} target="_blank" rel="noreferrer">
              Consultar TSE
            </a>
            <NotificationToggle />
          </div>
        </section>

        <StatusPanel status={status} updatedAt={updatedAt} onRefresh={refresh} data={data} />

        <section id="alertas" className="section alerts-section" aria-labelledby="alertas-title">
          <p className="eyebrow">Alertas</p>
          <h2 id="alertas-title">Receba avisos da apuração</h2>
          <div className="alert-card">
            <NotificationToggle />
          </div>
        </section>

        <section className="section" aria-labelledby="national-title">
          <p className="eyebrow">Presidência da República</p>
          <h2 id="national-title">Apuração nacional</h2>

          <div className="national-card">
            <div className="national-card__content">
              <p className="eyebrow">Lista oficial</p>
              <h3>
                {status === "ready" && data?.urnasApuradasPercent != null
                  ? "Apuração publicada pela Justiça Eleitoral"
                  : status === "loading"
                    ? "Carregando dados oficiais"
                    : status === "error"
                      ? "Falha na consulta oficial"
                      : "Dados ainda não publicados"}
              </h3>
              <p>
                {status === "ready"
                  ? `A apuração oficial está em andamento e já registra ${data.urnasApuradasPercent ?? 0}% de urnas apuradas.`
                  : status === "error"
                    ? error || "A fonte oficial respondeu com erro. A próxima tentativa será feita automaticamente."
                    : "Candidatos, fotos e resultados serão mostrados somente após a publicação oficial do TSE."}
              </p>
              <a href={TSE_URL} target="_blank" rel="noreferrer">
                Consultar portal Resultados do TSE ↗
              </a>
            </div>

            <div className="skeleton" aria-hidden="true">
              {status === "loading" ? (
                <>
                  <i />
                  <i />
                  <i />
                </>
              ) : (
                <div className="placeholder-card">
                  <strong>{globalPercent == null ? "0%" : `${globalPercent}%`}</strong>
                  <span>urnas apuradas</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section regional" aria-labelledby="regional-title">
          <p className="eyebrow">Recorte territorial</p>
          <h2 id="regional-title">Apuração por região</h2>

          <div className="regional-grid">
            <Suspense fallback={<div className="map-placeholder">Carregando mapa…</div>}>
              <BrazilMap
                regions={regions}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
              />
            </Suspense>

            <div className="cards" aria-label="Lista de regiões">
              {regions.map((region, index) => (
                <RegionCard
                  key={region.name}
                  name={region.name}
                  index={index}
                  value={region}
                  active={region.name === activeRegion.name}
                  onClick={() => setSelectedRegion(region.name)}
                />
              ))}
            </div>
          </div>

          <div className="region-detail" aria-live="polite">
            <div>
              <p className="eyebrow">Região selecionada</p>
              <h3>{activeRegion.name}</h3>
            </div>
            <div className="region-detail__stats">
              <span>
                <strong>{activeRegion.urnasApuradasPercent == null ? "Aguardando" : `${activeRegion.urnasApuradasPercent}%`}</strong>
                urnas apuradas
              </span>
              <span>
                <strong>{activeRegion.eleitorado ?? "—"}</strong>
                eleitorado
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <nav className="bottom-nav" aria-label="Navegação inferior">
        <a href="#top" className="active">Início</a>
        <a href="#regional-title">Regiões</a>
        <a href="#alertas">Alertas</a>
      </nav>
    </div>
  );
}
