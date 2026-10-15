---
name: publicar
description: Publica o Caderno visual - confere o build, faz commit, envia para o GitHub e acompanha o deploy no GitHub Pages. Use quando a pessoa pedir para publicar, subir, colocar no ar, dar push ou "manda pro site".
---

# Publicar

1. `MSYS_NO_PATHCONV=1 BASE_PATH=/caderno-visual npx astro build` precisa passar (no Git Bash do
   Windows o `MSYS_NO_PATHCONV=1` evita que `/caderno-visual` vire um caminho do disco). Apague
   `dist/` depois.
2. `git status`: confira que não vai junto nada de `.archive/`, `dist/`, `node_modules/` ou arquivo
   pessoal fora de `src/aulas/**/notas/`.
3. Commit em português, assunto curto no imperativo/descritivo e um parágrafo do que mudou. Termine
   com a linha de coautoria pedida pelo sistema, se houver.
4. Push com a conta **slaywithoutd** (o `gh` desta máquina pode ter outra conta ativa; não troque a
   conta ativa):

   ```bash
   TOKEN=$(gh auth token -u slaywithoutd)
   git -c credential.helper= -c "credential.helper=!f(){ echo username=slaywithoutd; echo password=$TOKEN; }; f" push
   ```

5. Acompanhe o deploy:

   ```bash
   export GH_TOKEN=$(gh auth token -u slaywithoutd)
   id=$(gh run list -R slaywithoutd/caderno-visual -L 1 --json databaseId --jq '.[0].databaseId')
   gh run watch $id -R slaywithoutd/caderno-visual --exit-status
   ```

6. Abra https://slaywithoutd.github.io/caderno-visual/ (e a página alterada) e confira que carrega
   sem erro no console. Responda com o link da página.

Se o deploy falhar, leia o log (`gh run view $id --log-failed`), corrija e repita.
