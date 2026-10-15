# Caderno visual

Autoestudos de todas as matérias em formato de post: texto curto, desenhos na margem, figuras
passo a passo, animações em loop e glossário. Organizado por módulo → matéria → aula, com uma
página de revisão para a prova por matéria.

Site: https://slaywithoutd.github.io/caderno-visual/

## Rodar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
```

O deploy no GitHub Pages roda sozinho a cada push na `main` (`.github/workflows/deploy.yml`).

## Adicionar coisas

- **Aula nova:** uma pasta `src/aulas/<modulo>/<materia>/<NN-slug>/` com `meta.json` e `conteudo.html`
  (mais `figuras.js`, `loops.js`, `glossario.js`, `revisao.js`). A página aparece sozinha.
- **Material da aula presencial:** jogue em `notas/` dentro da pasta da aula. Markdown no estilo
  Obsidian (`> [!prova]`, `> [!professor]`, `> [!duvida]`), PDFs de slides e fotos. Dá para subir
  pelo próprio site do GitHub ("Add file → Upload files").
- **Matéria ou módulo novo:** `src/data/estrutura.js`.

Detalhes de formato, componentes e estilo de escrita: [`CLAUDE.md`](CLAUDE.md).

## Skills (Claude Code)

Em `.claude/skills/`: `nova-aula`, `integrar-notas`, `revisao-prova`, `ajustar-visual`, `publicar`.
Abra o Claude Code nesta pasta e peça em linguagem natural (ex.: "cria a aula 02 de comp com estes
links e transcrições") ou chame pelo nome (`/nova-aula`).
