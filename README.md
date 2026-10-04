# Apuração Brasil

Painel informativo de apuração das Eleições 2026 (React + Vite + react-simple-maps).

## Como rodar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Configuração

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
| --- | --- |
| `VITE_APURACAO_API_URL` | Endpoint JSON da apuração. Vazio = "aguardando apuração". |
| `VITE_POLL_INTERVAL_MS` | Intervalo de atualização automática (padrão 60000). |

## Estrutura

```
src/
├── main.jsx              # ponto de entrada
├── App.jsx               # composição da página
├── config.js             # constantes e variáveis de ambiente
├── hooks/useApuracao.js  # busca + atualização automática
├── components/           # Header, Footer, StatusPanel, BrazilMap, RegionCard
└── styles.css
public/brazil-topology.json   # contorno do Brasil (GeoJSON, malha IBGE)
```
