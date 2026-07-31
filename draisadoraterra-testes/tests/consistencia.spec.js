// tests/consistencia.spec.js
//
// Verifica se o número de telefone ESCRITO como texto na página bate com
// o número usado nos links de WhatsApp (href="https://wa.me/...").
//
// Por que este teste existe: em 31/07/2026 encontramos os dois links de
// WhatsApp do index.html apontando para 5567992647-81, enquanto o número
// real da Dra. Isadora é 5567992647-815 (faltava o dígito final "5").
// Nenhuma ferramenta de link-checker pega esse tipo de erro, porque o
// link "existe" tecnicamente — só está incorreto no dígito.
//
// O teste roda contra as três páginas do site: a raiz, o linktree e a
// página de procedimentos. Ajuste a lista PAGINAS abaixo se novas
// páginas forem criadas.

const { test, expect } = require('@playwright/test');

const PAGINAS = [
  { nome: 'raiz', caminho: '/' },
  { nome: 'linktree', caminho: '/links/' },
  { nome: 'procedimentos', caminho: '/links/procedimentos.html' },
];

// Extrai só os dígitos de uma string (remove parênteses, espaço, traço, etc.)
function apenasDigitos(texto) {
  return (texto || '').replace(/\D/g, '');
}

for (const pagina of PAGINAS) {
  test(`[${pagina.nome}] todos os links de WhatsApp usam o número correto`, async ({ page }) => {
    const resposta = await page.goto(pagina.caminho);

    // Se a página não existir (ex.: procedimentos.html foi removida),
    // pula o teste em vez de falhar por 404 — o linkinator já cobre 404.
    test.skip(resposta.status() === 404, `Página ${pagina.caminho} não encontrada — pulando.`);

    const links = await page.locator('a[href*="wa.me"]').all();

    // Se não houver nenhum link de WhatsApp nesta página, não há o que checar.
    test.skip(links.length === 0, `Nenhum link de WhatsApp em ${pagina.caminho}.`);

    // NÚMERO DE REFERÊNCIA — fonte da verdade.
    // Ajuste aqui se o número real mudar no futuro.
    const NUMERO_CORRETO = '67992647815'; // (67) 99264-7815, sem o "55" do país

    for (const link of links) {
      const href = await link.getAttribute('href');
      const match = href.match(/wa\.me\/(\d+)/);

      expect(match, `href "${href}" não é um link wa.me/<numero> reconhecível`).not.toBeNull();

      const numeroNoLink = match[1];
      const numeroSemPais = numeroNoLink.replace(/^55/, '');

      expect(
        numeroSemPais,
        `Link de WhatsApp em ${pagina.caminho} aponta para ${numeroNoLink}, ` +
        `mas o número correto é 55${NUMERO_CORRETO}`
      ).toBe(NUMERO_CORRETO);
    }
  });

  test(`[${pagina.nome}] telefone exibido como texto bate com o número correto`, async ({ page }) => {
    const resposta = await page.goto(pagina.caminho);
    test.skip(resposta.status() === 404, `Página ${pagina.caminho} não encontrada — pulando.`);

    // Procura qualquer elemento que contenha "WhatsApp" como rótulo e pega
    // o texto ao lado — ajuste o seletor se a estrutura do HTML mudar.
    const blocoWhatsapp = page.locator('*:has-text("WhatsApp")').last();
    const existe = await blocoWhatsapp.count();
    test.skip(existe === 0, `Nenhum texto "WhatsApp" encontrado em ${pagina.caminho}.`);

    const textoCompleto = await blocoWhatsapp.textContent();
    const digitos = apenasDigitos(textoCompleto);

    // O texto pode conter outras coisas além do telefone (rótulo "WhatsApp",
    // por exemplo), então checamos se os dígitos do telefone aparecem
    // CONTIDOS no texto, em vez de exigir igualdade exata.
    expect(
      digitos.includes('67992647815'),
      `Texto exibido em ${pagina.caminho} não contém o telefone correto. ` +
      `Texto encontrado: "${textoCompleto.trim()}"`
    ).toBeTruthy();
  });
}
