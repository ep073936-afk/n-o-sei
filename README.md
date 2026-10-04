# Apuração Brasil

## 1) Rodar local

```bash
npm install
cp .env.example .env
npm run build
npm run dev
```

Em seguida, em outro terminal:

```bash
npm run dev:server
```

A API fica em `http://localhost:3000` e o front em `http://localhost:5173`.

## 2) GeoJSON das UFs e mapeamento região/UF

O mapa usa o arquivo `public/brazil-ufs.geojson` como fonte da geometria real das 27 UFs do Brasil.

- Origem: repositório `giuliano-macedo/geodata-br-states` (malha de UFs do IBGE), adaptado para o formato usado pelo app.
- Estrutura esperada: `FeatureCollection` com 27 features, cada feature com `properties.sigla`, `properties.nome` e `properties.regiao`.
- A tabela de referência fica em `src/data/ufs.js` e define `sigla`, `nome` e `regiao`.
- A sigla da UF é a chave única para ligar o mapa, os rótulos e o painel do estado.

A geometria real foi simplificada para remover guias e detalhes redundantes, mantendo a forma e os limites estaduais reais, sem transformar o desenho em uma malha aproximada em quadriláteros.

Para regenerar ou atualizar o GeoJSON das UFs:

1. Obtenha a base oficial do IBGE/GeoJSON de estados ou do projeto `giuliano-macedo/geodata-br-states`.
2. Normalize as propriedades para manter `sigla`, `nome` e `regiao` com os mesmos valores usados em `src/data/ufs.js`.
3. Salve o resultado em `public/brazil-ufs.geojson`.
4. Confirme com:

```bash
node -e "const fs=require('fs'); const g=JSON.parse(fs.readFileSync('public/brazil-ufs.geojson','utf8')); console.log({ type: g.type, features: g.features.length, first: g.features[0].properties.sigla })"
```

Ao montar o mapa, a regra de associação é simples:

```js
const region = UF_BY_SIGLA[sigla]?.regiao;
```

Ou seja, a tabela `src/data/ufs.js` continua sendo a referência de nomes e regiões, mas a geometria real passa a vir do GeoJSON em `public/brazil-ufs.geojson`.

## 3) Gerar chaves VAPID

```bash
npm run vapid
```

Copie o JSON gerado para as variáveis `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VITE_VAPID_PUBLIC_KEY` no `.env`.

## 3) Gerar ícones do PWA

```bash
python scripts/generate-pwa-icons.py
```

O script gera os PNGs da pasta `public/icons` a partir do desenho-base do app e também salva a origem SVG em `public/icons/app-icon.svg`.

## 4) Configurar no Railway

```bash
npm run build
npm start
```

No painel do Railway, defina estas variáveis de ambiente:

- `PORT`
- `NODE_ENV`
- `TSE_API_URL`
- `POLL_INTERVAL_MS`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `ADMIN_KEY`
- `DATABASE_URL`
- `DATA_DIR`

Para PostgreSQL, adicione um serviço PostgreSQL no Railway e conecte a variável `DATABASE_URL` ao fornecido pelo serviço.

## 5) Testar push por curl

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -H "x-admin-key: sua-chave-admin" \
  -d '{
    "title": "Apuração Brasil",
    "body": "Atualização oficial disponível.",
    "url": "/"
  }'
```

## Testes manuais

### Android Chrome
- Instale o site como PWA.
- Ative os alertas com o botão principal.
- Envie um push de teste via `curl` com o header `x-admin-key`.
- Feche o navegador e confirme que a notificação chega.

### iPhone / iPad (iOS 16.4+)
- Abra o site no Safari.
- Toque em Compartilhar > Adicionar à Tela de Início.
- Abra o app instalado.
- Ative os alertas.
- Bloqueie a tela e confirme que a notificação chega enquanto o app estiver em segundo plano.

### Desktop Chrome / Edge
- Ative os alertas.
- Feche a aba e confirme a notificação do sistema.
- Teste cenário de rede offline / servidor fora do ar / permissão negada.

### Cenários de erro
- Permissão negada: o app deve mostrar mensagem curta e manter a UI estável.
- Rede offline: a app shell continua funcionando e o serviço não trava.
- Servidor fora do ar: a apuração continua em estado de erro sem quebrar a interface.
- Inscrição expirada (410): o service worker deve tentar reinscrever ou mostrar erro sem travar o botão.

## Estrutura principal

```
server/
├── config.js
├── index.js
├── poller.js
├── store.js
├── routes/
│   ├── apuracao.js
│   └── push.js
scripts/
└── generate-vapid.js
src/
├── App.jsx
├── config.js
├── hooks/useApuracao.js
├── main.jsx
└── styles.css
```

## Observações

- Se `TSE_API_URL` estiver vazio, o servidor retorna `{ status: "unconfigured" }` em `GET /api/apuracao`.
- Sem dados oficiais, a interface permanece em estados claros de "aguardando", "carregando" e "erro".
- O Railway usa disco efêmero; por isso o store usa PostgreSQL quando `DATABASE_URL` estiver disponível e usa JSON em `DATA_DIR` somente para desenvolvimento local.
