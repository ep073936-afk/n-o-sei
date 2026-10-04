import Header from "./components/Header";
import Footer from "./components/Footer";
import StatusPanel from "./components/StatusPanel";
import BrazilMap from "./components/BrazilMap";
import RegionCard from "./components/RegionCard";
import { REGIONS, TSE_URL } from "./config";
import { useApuracao } from "./hooks/useApuracao";

export default function App() {
  const { status, updatedAt, refresh } = useApuracao();

  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <p className="eyebrow">● Central de apuração</p>
          <h1>
            Brasil decide.
            <br />
            <em>Você acompanha.</em>
          </h1>
          <p>Resultados somente quando publicados pela Justiça Eleitoral.</p>
        </section>

        <StatusPanel status={status} updatedAt={updatedAt} onRefresh={refresh} />

        <section className="section" aria-labelledby="national-title">
          <p className="eyebrow">Presidência da República</p>
          <h2 id="national-title">Apuração nacional</h2>
          <div className="waiting">
            <div>
              <p className="eyebrow">Lista oficial</p>
              <h3>Dados ainda não publicados</h3>
              <p>
                Candidatos, fotos e resultados serão mostrados somente após a publicação oficial
                pelo TSE.
              </p>
              <a href={TSE_URL} target="_blank" rel="noreferrer">
                Consultar portal Resultados do TSE ↗
              </a>
            </div>
            <div className="skeleton" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section className="section regional" aria-labelledby="regional-title">
          <p className="eyebrow">Recorte territorial</p>
          <h2 id="regional-title">Apuração por região</h2>
          <div className="regional-grid">
            <BrazilMap />
            <div className="cards">
              {REGIONS.map((name, i) => (
                <RegionCard key={name} name={name} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
