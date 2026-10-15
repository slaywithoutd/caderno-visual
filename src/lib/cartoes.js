/* cartões de revisão: clicar mostra/esconde a resposta */
export function initCartoes() {
  document.querySelectorAll('.card').forEach((c) => c.addEventListener('click', () => {
    c.classList.toggle('open');
    c.setAttribute('aria-expanded', c.classList.contains('open'));
  }));
}
