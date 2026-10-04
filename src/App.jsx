import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StatusPanel from "./components/StatusPanel";
import RegionCard from "./components/RegionCard";
import NotificationToggle from "./components/NotificationToggle";
import { CargoTabs } from "./components/CargoTabs";
import { UfPanel } from "./components/UfPanel";
import { REGIONS, TSE_URL } from "./config";
import { useApuracao } from "./hooks/useApuracao";
import { UFS, REGION_ORDER } from "./data/ufs";

const BrazilMap = lazy(() => import("./components/BrazilMap"));

function getHashCargo() {
  const hash = window.location.hash.replace("#/", "").replace("#", "");
  return ["presidente", "governador", "senador", "deputado-federal", "deputado-estadual"].includes(hash)
    ? hash
    : "presidente";
}

const EMPTY_DATA = REGIONS.map((name) => ({
  name,
  status: "waiting",
  urnasApuradasPercent: null,
  eleitorado: null,
  comparecimento: null,
  abstencao: null,
  leader: "—",
}));

export default function App() {
  const [cargo, setCargo] = useState(getHashCargo);
  const [selectedUf, setSelectedUf] = useState("SP");
  const { status, data, updatedAt, error, refresh } = useApuracao(cargo, 1);

  useEffect(() => {
    window.location.hash = `/${cargo}`;
    window.scrollTo(0, 0);
  }, [cargo]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const regions = useMemo(() => {
    if (!data?.ufs || typeof data.ufs !== "object") {
      return EMPTY_DATA;
    }

    const summaryByRegion = Object.fromEntries(REGIONS.map((name) => [name, { region: name, values: [], leader: "—" }]));
    Object.entries(data.ufs).forEach(([sigla, ufData]) => {
      const uf = UFS.find((entry) => entry.sigla === sigla);
      if (!uf) return;
      const entry = summaryByRegion[uf.regiao];
      if (!entry) return;
      entry.values.push({ sigla, ...ufData });
    });

    return REGION_ORDER.map((regionName) => {
      const entry = summaryByRegion[regionName] || { values: [] };
      const filledValues = entry.values.filter((item) => typeof item.pctApurado === "number");
      const pct = filledValues.length ? filledValues.reduce((sum, item) => sum + Number(item.pctApurado || 0), 0) / filledValues.length : null;
      const firstLeader = filledValues[0]?.candidatos?.[0]?.nomeUrna || "—";

      return {
        name: regionName,
        status: pct == null ? "waiting" : "ready",
        urnasApuradasPercent: pct,
        eleitorado: null,
        comparecimento: null,
        abstencao: null,
        leader: firstLeader,
      };
    });
  }, [data]);

  const globalPercent = data?.nacional?.pctApurado ?? null;
  const activeRegion = regions[0] || EMPTY_DATA[0];
  const currentState = data?.ufs?.[selectedUf] || null;
  const selectedStatePercent = currentState?.pctApurado ?? null;
  const apuracaoStage =
    selectedStatePercent == null
      ? "Início da apuração"
      : Number(selectedStatePercent) >= 100
        ? "Fim da apuração"
        : Number(selectedStatePercent) <= 5
          ? "Início da apuração"
          : "Apuração em andamento";

  return (
    <div id="top" className="dashboard-shell">
      <Header />

      <div className="status-strip" aria-live="polite">
        <span className={`status-dot status-dot--${status}`}> </span>
        <strong>Última atualização</strong>
        <span>{updatedAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(updatedAt) : "Aguardando"}</span>
        <span className="status-strip__percent">
          {globalPercent == null ? "Aguardando apuração" : `${globalPercent.toFixed(1)}%`} apurado
        </span>
      </div>

      <div className="app-layout">
        <aside className="sidebar" aria-label="Navegação por seções">
          <div className="sidebar__sticky">
            <p className="eyebrow">Seções</p>
            <nav className="sidebar-nav">
              <a href="#inicio" className="active">Início</a>
              <a href="#status">Status</a>
              <a href="#regional">Regiões</a>
              <a href="#alertas">Alertas</a>
            </nav>
          </div>
        </aside>

        <main className="app-shell">
          <section id="inicio" className="panel-page hero">
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

          <section id="status" className="panel-page">
            <div className="cargo-area" aria-live="polite">
              <CargoTabs cargo={cargo} onChange={(nextCargo) => setCargo(nextCargo)} />
            </div>

            <StatusPanel status={status} updatedAt={updatedAt} onRefresh={refresh} data={data} />
          </section>

          <section id="regional" className="panel-page section regional" aria-labelledby="regional-title">
            <p className="eyebrow">Recorte territorial</p>
            <h2 id="regional-title">Apuração por UF</h2>

            <div className="regional-grid">
              <Suspense fallback={<div className="map-placeholder">Carregando mapa…</div>}>
                <BrazilMap data={data} selectedUf={selectedUf} onSelectUf={setSelectedUf} />
              </Suspense>

              <div className="cards" aria-label="Lista de regiões">
                {regions.map((region, index) => (
                  <RegionCard
                    key={region.name}
                    name={region.name}
                    index={index}
                    value={region}
                    active={region.name === activeRegion.name}
                    onClick={() => setSelectedUf("SP")}
                  />
                ))}
              </div>
            </div>

            <div className="state-selector" aria-labelledby="state-selector-title">
              <div className="state-selector__header">
                <p className="eyebrow" id="state-selector-title">Seleção rápida</p>
                <span>{selectedUf}</span>
              </div>

              <div className="state-selector__list" aria-label="Lista de estados">
                {UFS.map((uf) => (
                  <button
                    key={uf.sigla}
                    type="button"
                    className={selectedUf === uf.sigla ? "is-selected" : ""}
                    aria-pressed={selectedUf === uf.sigla}
                    onClick={() => setSelectedUf(uf.sigla)}
                  >
                    <strong>{uf.sigla}</strong>
                    <span>{uf.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="region-detail" aria-live="polite">
              <div>
                <p className="eyebrow">Estado selecionado</p>
                <h3>{selectedUf}</h3>
              </div>
              <div className="region-detail__stats">
                <span>
                  <strong>{currentState?.pctApurado == null ? "Aguardando" : `${Number(currentState.pctApurado).toFixed(1)}%`}</strong>
                  seções apuradas
                </span>
                <span>
                  <strong>{currentState?.candidatos?.[0]?.nomeUrna || "—"}</strong>
                  líder
                </span>
              </div>
            </div>

            <div className="apuracao-notice apuracao-notice--institutional" aria-live="polite">
              <div className="apuracao-notice__header">
                <div className="apuracao-notice__title">
                  <p className="eyebrow">Monitoramento operacional</p>
                  <h3>Apuração por UF</h3>
                </div>
                <span className={`apuracao-pill apuracao-pill--${selectedStatePercent == null ? "waiting" : Number(selectedStatePercent) >= 100 ? "done" : Number(selectedStatePercent) <= 5 ? "start" : "live"}`}>
                  {apuracaoStage}
                </span>
              </div>

              <div className="apuracao-notice__metrics">
                <div className="apuracao-notice__metric">
                  <div className="metric-icon metric-icon--state" aria-hidden="true">◉</div>
                  <div>
                    <small>Estado</small>
                    <strong>{selectedUf}</strong>
                  </div>
                </div>
                <div className="apuracao-notice__metric">
                  <div className="metric-icon metric-icon--percent" aria-hidden="true">%</div>
                  <div>
                    <small>Apuração</small>
                    <strong>{selectedStatePercent == null ? "Aguardando" : `${Number(selectedStatePercent).toFixed(1)}%`}</strong>
                  </div>
                </div>
              </div>

              <div className="apuracao-progress" aria-label="Progresso da apuração do estado selecionado">
                <div className="apuracao-progress__meta">
                  <span>Progresso da apuração</span>
                  <strong>{selectedStatePercent == null ? "0%" : `${Number(selectedStatePercent).toFixed(1)}%`}</strong>
                </div>
                <div className="apuracao-progress__bar">
                  <span style={{ width: `${selectedStatePercent == null ? 0 : Math.min(Number(selectedStatePercent), 100)}%` }} />
                </div>
              </div>

              <div className="uf-select-wrap">
                <label className="uf-select-label" htmlFor="uf-select">Selecionar UF</label>
                <select id="uf-select" value={selectedUf} onChange={(event) => setSelectedUf(event.target.value)}>
                  {UFS.map((uf) => (
                    <option key={uf.sigla} value={uf.sigla}>{uf.sigla} — {uf.nome}</option>
                  ))}
                </select>
              </div>

              <div className="apuracao-notice__rows">
                <div className="apuracao-notice__row">
                  <div className="row-icon row-icon--president" aria-hidden="true">P</div>
                  <div className="row-copy">
                    <span>Presidente</span>
                    <strong>{cargo === "presidente" ? (selectedStatePercent == null ? "Aguardando" : `${Number(selectedStatePercent).toFixed(1)}%`) : "Aguardando"}</strong>
                  </div>
                  <em>{cargo === "presidente" ? "Nacional" : "Em análise"}</em>
                </div>
                <div className="apuracao-notice__row">
                  <div className="row-icon row-icon--governor" aria-hidden="true">G</div>
                  <div className="row-copy">
                    <span>Governador</span>
                    <strong>{cargo === "governador" ? (selectedStatePercent == null ? "Aguardando" : `${Number(selectedStatePercent).toFixed(1)}%`) : "Aguardando"}</strong>
                  </div>
                  <em>{cargo === "governador" ? "Estadual" : "Em análise"}</em>
                </div>
              </div>
            </div>
          </section>

          <section id="alertas" className="panel-page section alerts-section" aria-labelledby="alertas-title">
            <p className="eyebrow">Alertas</p>
            <h2 id="alertas-title">Receba avisos da apuração</h2>
            <div className="alert-card">
              <NotificationToggle />
            </div>
          </section>
        </main>
      </div>

      <UfPanel ufSigla={selectedUf} data={data} onClose={() => setSelectedUf("SP")} />
      <Footer />
      <nav className="bottom-nav" aria-label="Navegação inferior">
        <a href="#inicio" className="active">Início</a>
        <a href="#status">Status</a>
        <a href="#regional">Regiões</a>
        <a href="#alertas">Alertas</a>
      </nav>
    </div>
  );
}
