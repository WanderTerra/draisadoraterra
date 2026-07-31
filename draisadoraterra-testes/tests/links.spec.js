// tests/links.spec.js
//
// Checagem simples de que as páginas principais respondem (não estão 404)
// e que os links internos entre elas funcionam. O linkinator (rodado à
// parte, via `npm run test:links`) faz a varredura completa; este teste
// aqui serve como uma segunda camada rápida, direto no Playwright, que
// já aparece no mesmo relatório dos outros testes.

const { test, expect } = require('@playwright/test');

const PAGINAS = ['/', '/links/', '/links/procedimentos.html'];

for (const caminho of PAGINAS) {
  test(`página ${caminho} carrega com sucesso (200)`, async ({ page }) => {
    const resposta = await page.goto(caminho);
    expect(resposta.status(), `${caminho} retornou ${resposta.status()}`).toBe(200);
  });
}

test('página inicial não tem imagem quebrada (og-preview.png)', async ({ page, request }) => {
  await page.goto('/');
  const resposta = await request.get('/og-preview.png');
  expect(resposta.status()).toBe(200);
});
