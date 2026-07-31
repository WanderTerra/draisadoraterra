# Testes para draisadoraterra

## O que foi validado neste ambiente (sandbox), e o que não foi

✅ Sintaxe dos três arquivos JS (`node --check`)
✅ `package.json` — JSON válido
✅ `.github/workflows/qa.yml` — YAML válido
✅ **A lógica do teste de consistência foi simulada com os dados reais do
   bug encontrado em 31/07/2026** — rodei a mesma comparação de dígitos
   que o teste faz, fora do Playwright, e confirmei:
   - Com o href errado (`.../556799264781`) → a lógica aponta FALHA
   - Com o href corrigido (`.../5567992647815`) → a lógica aponta OK
   - Com o texto do rodapé (`(67) 99264-7815`) → contém o número correto

❌ Não rodei os testes de verdade via `npx playwright test` — este
   sandbox bloqueia o download do navegador Chromium (domínio
   `cdn.playwright.dev` fora da lista branca de rede). Isso NÃO afeta
   o GitHub Actions, que tem acesso irrestrito à internet.

## Estrutura

```
draisadoraterra-testes/
├── package.json
├── playwright.config.js
├── tests/
│   ├── consistencia.spec.js   ← o teste que teria pego o bug do telefone
│   └── links.spec.js          ← páginas carregam, imagem não quebrada
└── .github/workflows/qa.yml   ← roda em todo Pull Request
```

## Como o teste de consistência funciona

Ele **não sabe de antemão qual é o número certo por mágica** — o número
de referência está escrito no próprio teste, nesta linha:

```javascript
const NUMERO_CORRETO = '67992647815'; // (67) 99264-7815, sem o "55" do país
```

Se no futuro o telefone da Dra. Isadora mudar, é só atualizar essa linha
— senão o teste vai continuar comparando contra o número antigo.

Ele testa três páginas (ajustável na lista `PAGINAS`):
- `/` (raiz)
- `/links/` (o linktree)
- `/links/procedimentos.html`

Se alguma dessas páginas não tiver link de WhatsApp ou não existir, o
teste pula (não falha) — isso evita erro falso caso a estrutura mude.

## Como subir isso no repositório — pelo GitHub, sem terminal

1. No repositório `WanderTerra/draisadoraterra`, clique no seletor de
   branch (**main**) e crie uma branch nova, ex.: `adicionar-testes`
2. Nessa branch nova, use **"Add file" → "Upload files"** e arraste
   TODOS os arquivos deste pacote, respeitando as pastas:
   - `package.json` na raiz
   - `playwright.config.js` na raiz
   - `tests/consistencia.spec.js`
   - `tests/links.spec.js`
   - `.github/workflows/qa.yml`
3. Commit nessa branch (não na main)
4. Clique em **"Compare & pull request"**
5. Aguarde o ✅/❌ aparecer no PR
6. Se verde, clique em **Merge pull request**

## Como testar a correção do telefone usando este PR

Ideal: abra UM PR só, com duas mudanças juntas:
1. A correção do telefone no `index.html` (o `5` que faltava)
2. Este pacote de testes

Assim o PR mostra o teste **rodando e passando** já com a correção
aplicada — é a prova visual, dentro do próprio GitHub, de que o bug foi
resolvido e que o teste protege contra a regressão dele no futuro.

Se preferir separar em dois PRs, tudo bem também — só lembre que, no
primeiro PR (só os testes, sem a correção), o teste de consistência vai
aparecer **vermelho**, porque o bug ainda está lá. Isso é esperado e
está correto: é a prova de que o teste funciona.
