import { useEffect, useRef } from "react";

const CARGOS = [
  { key: "presidente", label: "Presidente" },
  { key: "governador", label: "Governador" },
  { key: "senador", label: "Senador" },
  { key: "deputado-federal", label: "Deputado Federal" },
  { key: "deputado-estadual", label: "Deputado Estadual" },
];

export function CargoTabs({ cargo, onChange }) {
  const tabRefs = useRef([]);

  useEffect(() => {
    const activeIndex = CARGOS.findIndex((item) => item.key === cargo);
    tabRefs.current[activeIndex]?.focus();
  }, [cargo]);

  const onKeyDown = (event, index) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = (index + 1) % CARGOS.length;
      tabRefs.current[next]?.focus();
      onChange(CARGOS[next].key);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = (index - 1 + CARGOS.length) % CARGOS.length;
      tabRefs.current[prev]?.focus();
      onChange(CARGOS[prev].key);
    }
  };

  return (
    <div className="cargo-tabs" role="tablist" aria-label="Seleção de cargo">
      {CARGOS.map((item, index) => {
        const isActive = item.key === cargo;
        return (
          <button
            key={item.key}
            type="button"
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            role="tab"
            id={`cargo-tab-${item.key}`}
            aria-selected={isActive}
            aria-controls={`cargo-panel-${item.key}`}
            data-active={isActive}
            className={`cargo-tab ${isActive ? "is-active" : ""}`}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
