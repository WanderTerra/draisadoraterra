// tests/links.spec.js
//
// Checagem simples de que as paginas principais respondem (nao estao 404)
// e que os links internos entre elas funcionam.

const { test, expect } = require('@playwright/test');

const PAGINAS = ['/', '/links/', '/links/procedimentos.html'];

for (const caminho of PAGINAS) {
  test(`pagina ${caminho} carrega com sucesso (200)`, async ({ page }) => {
    const resposta = await page.goto(caminho);
    expect(resposta.status(), `${caminho} retornou ${resposta.status()}`).toBe(200);
  });
}

test('pagina inicial nao tem imagem quebrada (og-preview.png)', async ({ page, request }) => {
  await page.goto('/');
  const resposta = await request.get('/og-preview.png');
  expect(resposta.status()).toBe(200);
});
