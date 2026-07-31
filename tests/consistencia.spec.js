// tests/consistencia.spec.js
//
// Verifica se o numero de telefone ESCRITO como texto na pagina bate com
// o numero usado nos links de WhatsApp (href="https://wa.me/...").
//
// Por que este teste existe: em 31/07/2026 encontramos os dois links de
// WhatsApp do index.html apontando para 5567992647-81, enquanto o numero
// real da Dra. Isadora e 5567992647-815 (faltava o digito final "5").
// Nenhuma ferramenta de link-checker pega esse tipo de erro, porque o
// link "existe" tecnicamente - so esta incorreto no digito.
//
// O teste roda contra as tres paginas do site: a raiz, o linktree e a
// pagina de procedimentos. Ajuste a lista PAGINAS abaixo se novas
// paginas forem criadas.

const { test, expect } = require('@playwright/test');

const PAGINAS = [
  { nome: 'raiz', caminho: '/' },
  { nome: 'linktree', caminho: '/links/' },
  { nome: 'procedimentos', caminho: '/links/procedimentos.html' },
];

function apenasDigitos(texto) {
  return (texto || '').replace(/\D/g, '');
}

for (const pagina of PAGINAS) {
  test(`[${pagina.nome}] todos os links de WhatsApp usam o numero correto`, async ({ page }) => {
    const resposta = await page.goto(pagina.caminho);

    test.skip(resposta.status() === 404, `Pagina ${pagina.caminho} nao encontrada - pulando.`);

    const links = await page.locator('a[href*="wa.me"]').all();

    test.skip(links.length === 0, `Nenhum link de WhatsApp em ${pagina.caminho}.`);

    const NUMERO_CORRETO = '67992647815';

    for (const link of links) {
      const href = await link.getAttribute('href');
      const match = href.match(/wa\.me\/(\d+)/);

      expect(match, `href "${href}" nao e um link wa.me/<numero> reconhecivel`).not.toBeNull();

      const numeroNoLink = match[1];
      const numeroSemPais = numeroNoLink.replace(/^55/, '');

      expect(
        numeroSemPais,
        `Link de WhatsApp em ${pagina.caminho} aponta para ${numeroNoLink}, ` +
        `mas o numero correto e 55${NUMERO_CORRETO}`
      ).toBe(NUMERO_CORRETO);
    }
  });

  test(`[${pagina.nome}] telefone exibido como texto bate com o numero correto`, async ({ page }) => {
    const resposta = await page.goto(pagina.caminho);
    test.skip(resposta.status() === 404, `Pagina ${pagina.caminho} nao encontrada - pulando.`);

    const corpoTexto = await page.locator('body').textContent();

    const match = corpoTexto.match(/\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*\d{4}/);

    test.skip(
      !match,
      `Nenhum telefone escrito encontrado em ${pagina.caminho} - ` +
      `provavelmente esta pagina so tem botao de WhatsApp sem numero visivel.`
    );

    const digitos = apenasDigitos(match[0]);

    expect(
      digitos.includes('67992647815') || '67992647815'.includes(digitos),
      `Telefone exibido em ${pagina.caminho} nao bate com o numero correto. ` +
      `Texto encontrado: "${match[0]}"`
    ).toBeTruthy();
  });
}
